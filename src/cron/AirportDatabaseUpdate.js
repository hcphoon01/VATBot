const csv = require("csv-parser");
const request = require("request");
const Promise = require("bluebird");
const path = require("path");

class AirportDatabaseUpdate {
  constructor(dbFilePath) {
    this.db = require("better-sqlite3")(dbFilePath);
  }

  // create the airports table if it doesnt exist
  async createTable() {
    const sql = this.db.prepare(`
    CREATE TABLE IF NOT EXISTS airports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      icao STRING UNIQUE,
      latitude INTEGER,
      longitude INTEGER)`);
    return await sql.run();
  }

  // fetch last ID
  async fetchLastId() {
    const sql = this.db.prepare(`
      SELECT id FROM airports ORDER BY id DESC LIMIT 0, 1`);
    const result = await sql.get();
    if (!result) return 1;
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
    var data = [];
    const insert = this.db.prepare('INSERT INTO airports (id, icao, latitude, longitude) VALUES (?,?,?,?)');
    request(file)
      .pipe(csv())
      .on("data", row => {
        data.push(row);
      })
      .on("end", () => {
        console.log("all fetched, starting insert");
        const bulkInsert = this.db.transaction((list) => {
          for (const item of list) {
            insert.run(index, item.ident, item.latitude_deg, item.longitude_deg);
            index++;
            console.log(index);
          }
        });
        bulkInsert(data);
        
        console.log("done");
        process.exit(1);
      });
  }


  // delete the airports table
  async dropTable() {
    const sql = this.db.prepare(`DROP TABLE IF EXISTS airports`);
    await sql.run();
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

