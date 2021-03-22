const request = require("request");
const fs = require("fs");
const sqlite3 = require("sqlite3");
const path = require("path");

class sectorParser {
  constructor(filePath) {
    this.db = new sqlite3.Database(filePath);
    this.firURL =
      "https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/FIRBoundaries.dat";

    this.vatSpyURL =
      "https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/VATSpy.dat";

    this.vatSpyData = {
      countries: [],
      airports: [],
      positions: [],
      firs: [],
      uirs: [],
    };
  }

  async run() {
    request.get(this.vatSpyURL, (err, res, body) => {
      if (!err && res.statusCode == 200) {
        body = body.split(/\r?\n/);
        //remove empty lines
        body = body.filter(Boolean);

        body = body.filter((val) => {
          return val.charAt(0) != ";";
        });

        const indexes = body.reduce(
          (c, v, i) => (/\[([A-Za-z])*\]/g.test(v) ? c.concat(i) : c),
          []
        );

        //Countries Array
        for (let i = 1; i < indexes[1] - 1; i++) {
          const element = body[i].split("|");
          if (i == 1) {
            this.vatSpyData.countries.push({
              name: element[0],
              abbreviations: [element[1]],
              type: element[2],
            });
          } else {
            if (
              this.vatSpyData.countries[this.vatSpyData.countries.length - 1]
                .name == element[0]
            ) {
              this.vatSpyData.countries[
                this.vatSpyData.countries.length - 1
              ].abbreviations.push(element[1]);
            } else {
              this.vatSpyData.countries.push({
                name: element[0],
                abbreviations: [element[1]],
                type: element[2],
              });
            }
          }
        }

        // Airports Array
        for (let i = indexes[1] + 1; i < indexes[2]; i++) {
          const element = body[i].split("|");
          this.vatSpyData.airports.push({
            icao: element[0],
            name: element[1],
            fir: element[5],
          });
        }

        // FIR Array
        for (let i = indexes[2] + 1; i < indexes[3]; i++) {
          const element = body[i].split("|");
          this.vatSpyData.positions.push({
            position: element[2] ? element[2] : element[0],
            name: element[1],
            fir: element[0],
          });
          if (i == indexes[2] + 1) {
            this.vatSpyData.firs.push({
              name: element[0],
              coordinates: [],
            });
          } else {
            if (
              this.vatSpyData.firs[this.vatSpyData.firs.length - 1].name !=
              element[0]
            ) {
              this.vatSpyData.firs.push({
                name: element[0],
                coordinates: [],
                parent: element[0] != element[3] ? element[3] : "",
              });
            }
          }
        }

        // UIR Array
        for (let i = indexes[3] + 1; i < indexes[4]; i++) {
          const element = body[i].split("|");
          this.vatSpyData.uirs.push({
            ident: element[0],
            name: element[1],
            fir: element[2].split(","),
          });
        }

        request.get(this.firURL, (err, res, body) => {
          if (!err && res.statusCode == 200) {
            body = body.split(/\r?\n/);

            //Remove empty lines
            body = body.filter(Boolean);

            for (let i = 0; i < body.length; i++) {
              const element = body[i].split("|");
              if (/[a-zA-Z]/.test(element[0])) {
                for (
                  let j = parseInt([i]) + 1;
                  j < parseInt(element[3]) + parseInt([i]) + 1;
                  j++
                ) {
                  const el = body[j].split("|");
                  const k = this.vatSpyData.firs.findIndex(
                    (el) => el.name == element[0]
                  );
                  if (this.vatSpyData.firs[k]) {
                    this.vatSpyData.firs[k].coordinates.push({
                      latitude: el[0],
                      longitude: el[1],
                    });
                  }
                }
              }
            }

            this.db.run(`DELETE FROM firs`);
            this.db.run(`DELETE FROM positions`);

            for (let i = 0; i < this.vatSpyData.firs.length; i++) {
              const element = this.vatSpyData.firs[i];
              this.db.run(
                `INSERT INTO firs(name, coordinates, parent) VALUES(?,?,?)`,
                [
                  element.name,
                  JSON.stringify(element.coordinates),
                  element.parent
                ],
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
            }
            
            for (let i = 0; i < this.vatSpyData.positions.length; i++) {
              const element = this.vatSpyData.positions[i];
              this.db.run(
                `INSERT INTO positions(position, name, fir) VALUES(?,?,?)`,
                [
                  element.position,
                  element.name,
                  element.fir
                ],
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
            }
          }
        });
      }
    });
  }
}

const DBUpdate = new sectorParser(
  path.resolve(__dirname, "../bwd/sqlite/db.sqlite")
);
DBUpdate.run();
