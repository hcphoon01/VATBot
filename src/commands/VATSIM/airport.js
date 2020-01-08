const { Command } = require("klasa");
const AsciiTable = require('ascii-table');

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
      if (val.pilots.length == 0 && val.controllers.length == 0) return message.send(`There is no activity at your requested airport: ${airport.toUpperCase()}`);
      let departureTable;
      departureTable = new AsciiTable;
      departureTable.setHeading('Callsign', 'Aircraft', 'Departure', 'Arrival');
      let arrivalTable;
      arrivalTable = new AsciiTable;
      arrivalTable.setHeading('Callsign', 'Aircraft', 'Departure', 'Arrival');
      let controllerTable;
      controllerTable = new AsciiTable;
      controllerTable.setHeading('Callsign', 'Frequency', 'Position');
      val.controllers.forEach(controller => {
        console.log(controller);
        controllerTable.addRow(controller.callsign, this.parseFrequency(controller.frequency), this.parsePosition(controller.facility));
      });
      return message.channel.send('```' + controllerTable.toString() + '```');
    });
  }

  parseFrequency(frequency) {
    const freq = frequency.toString();
    const parsed = [freq.slice(0, 2), freq.slice(2)];
    parsed[0] = '1' + parsed[0];
    return `${parsed[0]}.${parsed[1]}`;
  }

  parsePosition(position) {
    const pos = position.toString();
    switch (pos) {
      case '4':
        return 'ATIS';
      case '2':
        return 'Delivery';
      case '3':
        return 'Ground';
      case '4':
        return 'Tower';
      case '5':
        return 'Approach';
      case '6':
        return 'Center';
    }
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};
