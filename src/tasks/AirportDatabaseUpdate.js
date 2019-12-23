const { Task } = require("klasa");
const csv = require("csv-parser");
var fs = require("fs");

module.exports = class extends Task {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, { enabled: true });
  }

  async run(data) {
    const file = "http://ourairports.com/data/airports.csv";
    fs.createReadStream(file)
      .pipe(csv())
      .on("data", row => {
        console.log(row);
      });
  }

  async init() {
    const provider = this.client.providers.get("sqlite");
    const hasTable = await provider.hasTable("airports");
    if (!hasTable) await provider.createTable("airports");
  }
};
