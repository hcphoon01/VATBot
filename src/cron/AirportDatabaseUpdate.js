const csv = require("csv-parser");
const request = require("request");
const sqlite3 = require("sqlite3");
const Promise = require("bluebird");
const path = require("path");

class AirportDatabaseUpdate {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, err => {
      if (err) {
        console.log("Could not connect to database", err);
      } else {
        console.log("Connected to database");
      }
    });
  }

  // run an sql query
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.log("Error running sql " + sql);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  // create the airports table if it doesnt exist
  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS airports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icao STRING UNIQUE,
      latitude INTEGER,
      longitude INTEGER)`;
    return this.run(sql);
  }

  // insert data
  insert(id, icao, latitude, longitude) {
    const sql = `
      INSERT INTO airports (id, icao, latitude, longitude)
      VALUES (?, ?, ?, ?)`;
    return this.run(sql, [id, icao, latitude, longitude]);
  }

  // fetch last ID
  async fetchLastId() {
    const sql = `
      SELECT id FROM airports ORDER BY id DESC LIMIT 0, 1`;
    const result = await this.run(sql);
    if (result.id == 0) return 1;
    else {
      return result.id;
    }
  }
  // start the update
  async update() {
    await this.dropTable();
    await this.createTable();
    var index = await this.fetchLastId();
    const file = "http://ourairports.com/data/airports.csv";
    console.log('file fetched');
    request(file)
      .pipe(csv())
      .on("data", row => {
        this.insert(index, row.ident, row.latitude_deg, row.longitude_deg);
        index++;
      })
      .on("end", async () => {
        console.log("done");
        process.exit(1);
      });
  }

  // rename temp table
  // async renameTable() {
  //   const sql = `ALTER TABLE temp_airports RENAME TO airports`;
  //   await this.run(sql);
  //   return "renamed";
  // }

  // delete the airports table
  async dropTable() {
    const sql = `DROP TABLE IF EXISTS airports`;
    await this.run(sql);
    return "dropped";
  }

  // check to see if airports table exists
  async checkTable() {
    const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='airports'`;
    const result = await this.run(sql);
    if (result.id == 0) {
      return false;
    } else {
      return true;
    }
  }
}

const DBUpdate = new AirportDatabaseUpdate(
  path.resolve(__dirname, "../bwd/provider/sqlite/db.sqlite")
);
DBUpdate.update();

