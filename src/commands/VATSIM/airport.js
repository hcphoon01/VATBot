const { Command } = require("klasa");
const AsciiTable = require('ascii-table');

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      cooldown: 5,
      name: "Airport",
      description: "Get the activity for a given Airport ICAO code.",
      usage: "<ICAO:icao>",
      extendedHelp: "<> means an ICAO code is a required argument."
    });
  }

  async run(message, [airport]) {
    this.client.handler.getAirportInfo(airport).then(val => {
      if (val.pilots.length == 0 && val.controllers.length == 0) return message.send(`There is no activity at your requested airport: ${airport.toUpperCase()}`);
      var depArray = [];
      var arrArray = [];
      for (let i = 0; i < val.pilots.length; i++) {
        const pilot = val.pilots[i];
        if (pilot.planned_depairport == airport) {
          depArray.push(pilot);
        } else if (pilot.planned_destairport == airport) {
          arrArray.push(pilot);
        }
      }
      var depsTable = this.createPilotTable('Departures', depArray);
      var arrTable = this.createPilotTable('Arrivals', arrArray);
      var controllerTable = this.createControllerTable(val.controllers);
      var contentArray = [];
      if (depsTable.__rows.length > 0) {
        contentArray.push(depsTable.toString());
      }
      if (arrTable.__rows.length > 0) {
        contentArray.push(arrTable.toString());
      }
      if (controllerTable.__rows.length > 0) {
        contentArray.push(controllerTable.toString());
      }
      var content = contentArray.join('```\n```');
      console.log(content);
      return message.channel.send('```' + content + '```', {split: {char: '```\n```',prepend: '```', append: '```'}});
    });
  }

  createPilotTable(type, array) {
    const table = new AsciiTable;
    table.setTitle(`Active ${type}`);
    table.setHeading('Callsign', 'Aircraft', 'Departure', 'Arrival');
    array.forEach(pilot => {
      table.addRow(pilot.callsign, pilot.planned_aircraft, pilot.planned_depairport, pilot.planned_destairport);
    });
    return table;
  }

  createControllerTable(array) {
    const table = new AsciiTable;
    table.setTitle('Active Controllers');
    table.setHeading('Callsign', 'Frequency', 'Position');
    array.forEach(controller => {
      table.addRow(controller.callsign, controller.frequency, this.parsePosition(controller.facilitytype, controller.callsign));
    });
    return table;
  }

  parsePosition(position, callsign) {
    const pos = position.toString();
    switch (pos) {
      case '2':
        return 'Delivery';
      case '3':
        return 'Ground';
      case '5':
        return 'Approach';
      case '6':
        return 'Center';
      case '4':
        return this.parseTower(callsign);
      default:
        return this.parseTower(callsign);
    }
  }

  parseTower(callsign) {
    if (callsign.includes('ATIS')) {
      return 'ATIS';
    } else if (callsign.includes('TWR')) {
      return 'Tower';
    }
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};
