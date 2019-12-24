const { Command } = require("klasa");

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      name: "Airport",
      description: "Get the activity for a given Airport ICAO code.",
      usage: "<ICAO:ICAO>",
      extendedHelp: "<> means an ICAO code is a required argument."
    });
  }

  async run(message, [airport]) {
    this.client.handler.getAirportInfo(airport.toUpperCase()).then(val => {
      if (val.length == 0) return message.send(`There is no activity at your requested airport: ${airport.toUpperCase()}`)
      val.forEach(user => {
        if (user.facility) {
          console.log("atc");
        } else if(user.plan) {
          console.log("pilot");
        }
      });
    });
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};
