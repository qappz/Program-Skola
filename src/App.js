import React, {Component} from "react";
import "./App.css";
import axios from "axios";

// Grabbed all the team abbreviations the site lists https://suredbits.com/api/nfl/team/#usage
const teamAbbreviations = [
  "ARI",
  "ATL",
  "BAL",
  "BUF",
  "CAR",
  "CHI",
  "CIN",
  "CLE",
  "DAL",
  "DEN",
  "DET",
  "GB",
  "HOU",
  "IND",
  "JAC",
  "KC",
  "LA",
  "MIA",
  "MIN",
  "NE",
  "NO",
  "NYG",
  "NYJ",
  "OAK",
  "PHI",
  "PIT",
  "SD",
  "SEA",
  "SF",
  "TB",
  "TEN",
  "WAS",
];

class PlayerStats extends Component {
  render() {
    return (
      <table>
        <col width="400" />
        <col width="100" />
        <tr>
          <td style={{fontWeight: "bold"}}>Stat</td>
          <td style={{fontWeight: "bold"}}>Value</td>
        </tr>

        {/* Go through all the stats one by one */}
        {Object.keys(this.props.stats)
          // Only show stats that have a value
          .filter(stat => this.props.stats[stat] !== 0)
          .map(stat => {
            return (
              <tr style={{height: 30}}>
                <td>{stat}</td>
                <td>{this.props.stats[stat]}</td>
              </tr>
            );
          })}
      </table>
    );
  }
}

class Player extends Component {
  render() {
    const player = this.props.player;

    // Get all of the stats to display together, and then only show the stats that have a value
    const allStats = {
      ...player.defense,
      ...player.fumbles,
      ...player.kickReturn,
      ...player.kicking,
      ...player.passing,
      ...player.punting,
      ...player.receiving,
      ...player.rushing,
    };

    return (
      <div>
        <div>
          {/* Header can be clicked to go back to the team overview */}
          <h1
            style={{display: "inline", cursor: "pointer"}}
            onClick={() => this.props.close()}
          >
            {player.teamName}
          </h1>
          <h3 style={{display: "inline"}}> {player.fullName}</h3>
        </div>

        <PlayerStats stats={allStats} />
      </div>
    );
  }
}

class TeamRoster extends Component {
  render() {
    return (
      <div>
        <h1 style={{display: "inline"}}>{this.props.team.name}</h1>

        <table>
          <col width="175" />
          <col width="80" />
          <col width="130" />
          <col width="180" />
          <tr>
            <td style={{fontWeight: "bold"}}>Name</td>
            <td style={{fontWeight: "bold"}}>Position</td>
            <td style={{fontWeight: "bold"}}>Birthday</td>
            <td style={{fontWeight: "bold"}}>College</td>
          </tr>

          {/* Show each player */}
          {this.props.team.roster.map(player => {
            return (
              <tr style={{height: 30}}>
                <td>
                  {/* Allow clicking player to see stats */}
                  <a
                    style={{cursor: "pointer"}}
                    onClick={() => this.props.onPlayerClick(player)}
                  >
                    {player.fullName}
                  </a>
                </td>
                <td>{player.position}</td>
                <td>{player.birthDate}</td>
                <td>{player.college}</td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
}

class Team extends Component {
  constructor(props) {
    super(props);

    this.state = {player: null};
  }

  componentWillReceiveProps(nextProps) {
    // Remove player so you can see the new team selected
    if (nextProps.team !== this.props.team) {
      this.setState({player: null});
    }
  }

  // Load player stats from the suredbits data
  fetchStats = player => {
    axios
      // Hits the API mentioned here: https://suredbits.com/api/
      // I was getting an error:
      //   Failed to load http://api.suredbits.com/nfl/v0/team/min/roster: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access.
      // So the website is mentioned in the package.json
      .get("/nfl/v0/stats/" + player.playerId)
      .then(response => {
        // Update player in state to show Player component. Include team name so it can be displayed in the header still.
        this.setState({
          player: {teamName: this.props.team.name, ...player, ...response.data},
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    const {team} = this.props;

    if (!team) {
      // Show nothing until a team is clicked
      return null;
    }

    return (
      <div
        style={{
          border: "thin solid #ddd",
          margin: 20,
          padding: 20,
        }}
      >
        {/* Set inside a box with a border */}
        {/* If a player is selected, show him instead of the team */}
        {this.state.player ? (
          <Player
            player={this.state.player}
            close={() => this.setState({player: null})}
          />
        ) : (
          <TeamRoster
            team={this.props.team}
            onPlayerClick={player => this.fetchStats(player)}
          />
        )}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {teams: []};
  }

  // Load a team from the suredbits data
  loadTeam = teamAbbreviation => {
    console.log("Loading");
    axios
      // Hits the API mentioned here: https://suredbits.com/api/
      // I was getting an error:
      //   Failed to load http://api.suredbits.com/nfl/v0/team/min/roster: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access.
      // So the website is mentioned in the package.json
      .get("/nfl/v0/team/" + teamAbbreviation + "/roster")
      .then(response => {
        // Save the team and set team as selected
        const team = {name: teamAbbreviation, roster: response.data};
        const teams = this.state.teams;
        teams.push(team);
        this.setState({
          teams,
          selectedTeam: team,
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    return (
      <div>
        <div
          style={{
            background: "#999",
            border: "thin solid #ccc",
            textDecoration: "none",
            margin: 20,
            padding: 10,
            wordWrap: "break-word",
          }}
        >
          {/* Set in a box with a border, and wrap text if the screen is too narrow */}

          {/* Show each abbreviation in white, allow clicking to load the team */}
          {teamAbbreviations.map(team => {
            return (
              <a
                style={{
                  cursor: "pointer",
                  marginRight: 8,
                  textDecoration: "none",
                  color: "white",
                }}
                onClick={() => {
                  this.loadTeam(team);
                }}
              >
                {team}
              </a>
            );
          })}
        </div>

        <Team team={this.state.selectedTeam} />
      </div>
    );
  }
}

export default App;
