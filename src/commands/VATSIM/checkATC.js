const { Command } = require("discord-akairo");
const { Menu } = require("discord.js-menu");
const { MessageEmbed } = require("discord.js");
const AsciiTable = require("ascii-table");

module.exports = class AirportCommand extends Command {
  constructor() {
    super("checkatc", {
      cooldown: 5,
      description: {
        content: "Get an estimate of the ATC between 2 airports",
        usage: "<departure> <arrival>",
        examples: ["EGLL EHAM", "KJFK KSFO"],
      },
      category: "VATSIM",
      aliases: ["checkatc", "atc"],
      args: [
        {
          id: "departure",
          type: "icao",
          prompt: {
            start: "Enter a valid departure Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
        {
          id: "arrival",
          type: "icao",
          prompt: {
            start: "Enter a valid arrival Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
      ],
    });
  }

  async exec(message, args) {
    let departureList = [];
    let arrivalList = [];
    let enrouteList = [];

    const positions = [2, 3, 4, 5];

    const depAirport = this.client.airports.items.get(args.departure);
    const arrAirport = this.client.airports.items.get(args.arrival);

    this.client.handler.getControllers().then(async (val) => {
      const line = {
        p1: {
          x: depAirport.longitude,
          y: depAirport.latitude,
        },
        p2: {
          x: arrAirport.longitude,
          y: arrAirport.latitude,
        },
      };
      val.forEach((result) => {
        if (result.callsign.includes(args.departure)) {
          departureList.push(result);
          return;
        } else if (result.callsign.includes(args.arrival)) {
          arrivalList.push(result);
          return;
        } else if (positions.includes(result.facilitytype)) {
          return;
        }
        const circle = {
          radius: result.range,
          center: {
            x: result.longitude,
            y: result.latitude,
          },
        };
        if (this.circleDistFromLineSeg(circle, line) < 3) {
          enrouteList.push(result);
        }
      });

      const reactions = {
        "🏠": "main",
        "🛫": "departures",
        "✈️": "en-route",
        "🛬": "arrivals",
      };

      const pages = [
        {
          name: "main",
          content: new MessageEmbed()
            .setTitle(
              `Current ATC between ${args.departure} and ${args.arrival}`
            )
            .setColor("#47970E")
            .setDescription(
              `Please remember that this is just a rough estimate using controllers range rings not defined FIRs`
            )
            .addField("Departure Controllers 🛫", departureList.length)
            .addField("En-Route Controllers ✈️", enrouteList.length)
            .addField("Arrival Controllers 🛬", arrivalList.length),
          reactions: reactions,
        },
      ];

      // Departure
      pages.push({
        name: "departures",
        content: this.createContent("Departure", departureList, args.departure),
        reactions: reactions,
      });

      pages.push({
        name: "en-route",
        content: this.createContent("En-Route", enrouteList),
        reactions: reactions,
      });

      pages.push({
        name: "arrivals",
        content: this.createContent("Arrival", arrivalList, args.arrival),
        reactions: reactions,
      });

      const menu = new Menu(message.channel, message.author.id, pages);
      return menu.start();
    });
  }
  createTable(list) {
    const table = new AsciiTable();
    table.setHeading("Callsign", "Frequency", "Position");
    list.forEach((controller) => {
      table.addRow(
        controller.callsign,
        controller.frequency,
        this.parsePosition(controller.facilitytype, controller.callsign)
      );
    });
    return table.toString();
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

  createContent(type, data, airport = null) {
    let cont = new MessageEmbed().setColor("#47970E");

    if (data.length > 0) {
      cont.addField(
        `${type} Controllers`,
        "```" + this.createTable(data) + "```"
      );
    } else {
      if (type != "En-Route") {
        cont.addField(
          `${type} Controllers`,
          `No Controllers at your ${type} Airport: \`${airport}\``
        );
      } else {
        cont.addField(
          "En-Route Controllers",
          `There are no En-Route Controllers between your 2 Airports`
        );
      }
    }
    return cont;
  }

  circleDistFromLineSeg(circle, line) {
    var v1, v2, v3, u;
    v1 = {};
    v2 = {};
    v3 = {};
    v1.x = line.p2.x - line.p1.x;
    v1.y = line.p2.y - line.p1.y;
    v2.x = circle.center.x - line.p1.x;
    v2.y = circle.center.y - line.p1.y;
    u = (v2.x * v1.x + v2.y * v1.y) / (v1.y * v1.y + v1.x * v1.x); // unit dist of point on line
    if (u >= 0 && u <= 1) {
      v3.x = v1.x * u + line.p1.x - circle.center.x;
      v3.y = v1.y * u + line.p1.y - circle.center.y;
      v3.x *= v3.x;
      v3.y *= v3.y;
      return Math.sqrt(v3.y + v3.x); // return distance from line
    }
    // get distance from end points
    v3.x = circle.center.x - line.p2.x;
    v3.y = circle.center.y - line.p2.y;
    v3.x *= v3.x; // square vectors
    v3.y *= v3.y;
    v2.x *= v2.x;
    v2.y *= v2.y;
    return Math.min(Math.sqrt(v2.y + v2.x), Math.sqrt(v3.y + v3.x)); // return smaller of two distances as the result
  }
};
