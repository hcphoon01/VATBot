const { Command } = require("discord-akairo");
const { Menu } = require("discord.js-menu");
const MessageEmbed = require("../../Util/MessageEmbed");

module.exports = class AirportCommand extends Command {
  constructor() {
    super("airport", {
      cooldown: 5,
      description: {
        content: "Get the activity for a given Airport ICAO code.",
        usage: '<airport>',
        examples: ['EGLL', 'KJFK']
      },
      category: 'VATSIM',
      aliases: ["airport"],
      args: [
        {
          id: "airport",
          type: 'icao',
          prompt: {
            start: "Enter a valid Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
      ],
      channel: 'guild',
    });
  }

  async exec(message, args) {
    const airport = args.airport;
    this.client.handler.getAirportInfo(airport).then((val) => {
      if (val.pilots.length == 0 && val.controllers.length == 0)
        return message.channel.send(
          "There is no activity at your requested airport: `" +
            airport.toUpperCase() +
            "`"
        );
      var depArray = [];
      var arrArray = [];
      for (let i = 0; i < val.pilots.length; i++) {
        const pilot = val.pilots[i];
        if (pilot.flight_plan && pilot.flight_plan.departure == airport) {
          depArray.push(pilot);
        } else if (pilot.flight_plan && pilot.flight_plan.arrival == airport) {
          arrArray.push(pilot);
        }
      }

      const reactions = {
        "🛫": "departures",
        "🛬": "arrivals",
        "📡": "controllers",
        "⏪": "first",
        "⬅️": "previous",
        "➡️": "next",
        "⏩": "last",
        "⏹️": "stop"
      };

      const pages = [
        {
          name: "main",
          content: MessageEmbed(`Airport Details for ${airport}`, message, this.client)
            .addField("Departures 🛫", depArray.length)
            .addField("Arrivals 🛬", arrArray.length)
            .addField("Controllers 📡", val.controllers.length),
          reactions: reactions,
        },
      ];

      // Departure pages

      const depChunks = this.chunk(depArray, 10);

      for (let i = 0; i < depChunks.length; i++) {
        const element = depChunks[i];
        if (i == 0) {
          pages.push({
            name: "departures",
            content: this.createAircraftEmbed("Departure", element, airport, message),
            reactions: reactions,
          });
        } else {
          pages.push({
            name: `departures${i}`,
            content: this.createAircraftEmbed("Departure", element, airport, message),
            reactions: reactions,
          });
        }
      }

      // Arrival pages

      const arrChunks = this.chunk(arrArray, 10);

      for (let i = 0; i < arrChunks.length; i++) {
        const element = arrChunks[i];
        if (i == 0) {
          pages.push({
            name: "arrivals",
            content: this.createAircraftEmbed("Arrival", element, airport, message),
            reactions: reactions,
          });
        } else {
          pages.push({
            name: `arrivals${i}`,
            content: this.createAircraftEmbed("Arrival", element, airport, message),
            reactions: reactions,
          });
        }
      }

      // Controller pages

      const controlChunks = this.chunk(val.controllers, 10);

      for (let i = 0; i < controlChunks.length; i++) {
        const element = controlChunks[i];
        if (i == 0) {
          pages.push({
            name: "controllers",
            content: this.createControllerEmbed(element, airport, message),
            reactions: reactions,
          });
        } else {
          pages.push({
            name: `controllers${i}`,
            content: this.createControllerEmbed(element, airport, message),
            reactions: reactions,
          });
        }
      }

      const menu = new Menu(message.channel, message.author.id, pages);

      return menu.start();
    });
  }

  createAircraftEmbed(type, array, airport, message) {
    const embed = MessageEmbed(`${type} details for ${airport}`, message, this.client)
      .setDescription("Aircraft, Departure, Arrival");
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      embed.addField(
        element.callsign,
        `\`${element.flight_plan.aircraft_short}\`, \`${element.flight_plan.departure}\`, \`${element.flight_plan.arrival}\``
      );
    }
    return embed;
  }

  createControllerEmbed(array, airport, message) {
    const embed = MessageEmbed(`Controller details for ${airport}`, message, this.client);
    for (let i = 0; i < array.length; i++) {
      const element = array[i];
      embed.addField(
        element.callsign,
        `Frequency: \`${element.frequency}\`, Position: \`${this.parsePosition(
          element.facility,
          element.callsign
        )}\``
      );
    }
    return embed;
  }

  // Split up array
  chunk(arr, chunkSize) {
    if (chunkSize <= 0) throw "Invalid chunk size";
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  }

  parsePosition(position, callsign) {
    const pos = position.toString();
    switch (pos) {
      case "2":
        return "Delivery";
      case "3":
        return "Ground";
      case "5":
        return "Approach";
      case "6":
        return "Center";
      case "4":
        return this.parseTower(callsign);
      default:
        return this.parseTower(callsign);
    }
  }

  parseTower(callsign) {
    if (callsign.includes("ATIS")) {
      return "ATIS";
    } else if (callsign.includes("TWR")) {
      return "Tower";
    }
  }
};
