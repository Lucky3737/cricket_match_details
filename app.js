const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  let playerDetails = `
    select * from cricket_team 
    `;

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  let dbObject = await db.all(playerDetails);
  let result = convertDbObjectToResponseObject(dbObject);
  response.send(result);
});

//POST
app.post("/players/", async (request, response) => {
  let playerDetails = request.body;

  let { playerName, jerseyNumber, role } = playerDetails;

  let addingPlayer = `
    INSERT INTO
     cricket_team (player_name,jersey_number,role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}')
    `;
  let dbResponse = await db.run(addingPlayer);
  let playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});
//GET
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;

  const playerQuery = `
    select * from cricket_team where player_id=${playerId};`;

  let player = await db.get(playerQuery);
  response.send(player);
});
//PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const updatePlayer = request.body;
  const { playerName, jerseyNumber, role } = updatePlayer;

  const updateDetails = `
    Update 
    cricket_team 
    set 
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
    
    where
    player_id=${playerId}
    `;
  await db.run(updateDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayer = `
    delete from cricket_team where player_id=${playerId}
    `;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
