const csv = require("csv-parser");
const request = require("request");
const sqlite3 = require("sqlite3");
const path = require("path");

class AirportDatabaseUpdate {
  constructor(filePath) {
    this.db = new sqlite3.Database(filePath);
  }

  async update() {
    const file = "http://ourairports.com/data/airports.csv";
    var index = 0;
    request(file)
      .pipe(csv())
      .on("data", (data) => {
        this.db.get(
          `SELECT id FROM airports WHERE icao = ?`,
          [data.ident],
          (err, row) => {
            if (!row) {
              this.db.run(
                `INSERT INTO airports(icao, name, latitude, longitude) VALUES(?,?,?,?)`,
                [data.ident, data.name, data.latitude_deg, data.longitude_deg],
                function (err) {
                  if (err) {
                    return console.log(err.message);
                  }
                  // get the last insert id
                  console.log(
                    `A row has been inserted with rowid ${this.lastID}`
                  );
                }
              );
              index++;
            }
          }
        );
      })
      .on("end", () => {
        console.log(`Inserted ${index} entries`);
      });
  }
}

const DBUpdate = new AirportDatabaseUpdate(
  path.resolve(__dirname, "../bwd/sqlite/db.sqlite")
);
DBUpdate.update();
