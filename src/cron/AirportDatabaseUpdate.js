const csv = require('csv-parser');
const request = require("request");
const fs = require('fs');
const path = require("path");

class AirportDatabaseUpdate {
  constructor(filePath) {
    this.filePath = filePath;
    if (!fs.existsSync(filePath)){
      fs.mkdirSync(filePath);
    }
  }

  async update() {
    const file = "http://ourairports.com/data/airports.csv";
    var index = 0;
    request(file)
      .pipe(csv())
      .on('data', (row) => {
        let data = JSON.stringify(row);
        fs.writeFileSync(`${this.filePath}/${row.ident}.json`, data);
        index++;
      })
      .on('end', () => {
        console.log(`Inserted ${index} entries`);
      });
  }
}

const DBUpdate = new AirportDatabaseUpdate(
  path.resolve(__dirname, "../bwd/provider/json/airports")
);
DBUpdate.update();

