const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      cooldown: 2,
      description: "Get a decoded metar for a given ICAO Code",
      usage: "<ICAO:ICAO>"
    });
  }

  async run(message, [...params]) {
    // This is where you place the code you want to run for your command
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};
