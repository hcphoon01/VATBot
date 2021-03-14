const request = require("request");
const fs = require("fs");

const vatSpyURL =
  "https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/VATSpy.dat";
const firURL =
  "https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/FIRBoundaries.dat";

const vatSpyData = {
  countries: {},
  airports: [],
  firs: {},
  uirs: {},
};

request.get(vatSpyURL, function (err, res, body) {
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
      if (element[0] in vatSpyData.countries) {
        vatSpyData.countries[element[0]].push({
          abbreviation: element[1],
          type: element[2],
        });
      } else {
        vatSpyData.countries[element[0]] = [
          { abbreviation: element[1], type: element[2] },
        ];
      }
    }

    // Airports Array
    for (let i = indexes[1] + 1; i < indexes[2]; i++) {
      const element = body[i].split("|");
      vatSpyData.airports.push({
        icao: element[0],
        name: element[1],
        fir: element[5],
      });
    }

    // FIR Array
    for (let i = indexes[2] + 1; i < indexes[3]; i++) {
      const element = body[i].split("|");
      if (element[0] in vatSpyData.firs) {
        vatSpyData.firs[element[0]].positions.push({
          name: element[1],
          position: element[2],
        });
      } else {
        vatSpyData.firs[element[0]] = {
          positions: [{ name: element[1], position: element[2] }],
          coordinates: [],
        };
      }
    }
    // UIR Array
    for (let i = indexes[3] + 1; i < indexes[4]; i++) {
      const element = body[i].split("|");
      if (element[0] in vatSpyData.uirs) {
        vatSpyData.uirs[element[0]].push({
          name: element[1],
          fir: element[2].split(","),
        });
      } else {
        vatSpyData.uirs[element[0]] = [
          { name: element[1], fir: element[2].split(",") },
        ];
      }
    }

    request.get(firURL, function (err, res, body) {
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
              if (vatSpyData.firs[element[0]]) {
                vatSpyData.firs[element[0]].coordinates.push({
                  latitude: el[0],
                  longitude: el[1],
                });
              } else {
                // Workaround for Wien Radar sectors
                try {
                  const shortenedEl = element[0].split("-")[0];
                  const underscoreEl = element[0].replace("-", "_");
                  vatSpyData.firs[shortenedEl].positions
                    .find((val) => val.position == underscoreEl)
                    .coordinates.push({
                      latitude: el[0],
                      longitude: el[1],
                    });
                } catch (e) {
                  // nothing
                }
              }
            }
          }
        }
        const data = JSON.stringify(vatSpyData);
        fs.writeFileSync("data.json", data);
      }
    });
  }
});
