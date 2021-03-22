const { Command } = require("discord-akairo");
const { Menu } = require("discord.js-menu");
const { MessageEmbed } = require("discord.js");
const AsciiTable = require("ascii-table");
const turf = require("@turf/turf");

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
      channel: "guild",
    });
  }

  async exec(message, args) {
    let departureList = [];
    let arrivalList = [];
    let enrouteList = [];

    const positions = [2, 3, 4, 5];

    const depAirport = this.client.airports.items.get(args.departure);
    const arrAirport = this.client.airports.items.get(args.arrival);

    if (!depAirport) {
      return message.channel.send(`${args.departure} does not exist`);
    }

    if (!arrAirport) {
      return message.channel.send(`${args.arrival} does not exist`);
    }

    this.client.handler.getControllers().then(async (val) => {
      const depPoint = turf.point([depAirport.longitude, depAirport.latitude]);
      const arrPoint = turf.point([arrAirport.longitude, arrAirport.latitude]);

      const gcLine = turf.greatCircle(depPoint, arrPoint);

      val.forEach((result) => {
        if (result.callsign.includes(args.departure)) {
          departureList.push(result);
          return;
        } else if (result.callsign.includes(args.arrival)) {
          arrivalList.push(result);
          return;
        } else if (positions.includes(result.facility)) {
          return;
        }
        let fir = {
          coordinates: [],
        };
        if (result.callsign.split("_").length > 2) {
          const slice = result.callsign.split("_").slice(3);
          const joinedCallsign = slice.join("_");
          const controlPosition = this.client.positions.items.get(
            joinedCallsign[0]
          );
          if (!controlPosition) {
            const coordinates = this.client.firs.items.get(joinedCallsign[0]);
            if (coordinates) {
              fir.coordinates = coordinates;
            }
          } else {
            const coordinates = this.client.firs.items.get(controlPosition.fir);
            if (coordinates) {
              fir.coordinates = coordinates;
            }
          }
        } else {
          const split = result.callsign.split("_");
          const controlPosition = this.client.positions.items.get(split[0]);
          if (!controlPosition) {
            const coordinates = this.client.firs.items.get(split[0]);
            if (coordinates) {
              fir.coordinates = coordinates;
            }
          } else {
            const coordinates = this.client.firs.items.get(controlPosition.fir);
            if (coordinates) {
              fir.coordinates = coordinates;
            }
          }
        }
        const polyCoords = fir.coordinates.map((obj) => {
          return [obj.longitude, obj.latitude];
        });
        if (polyCoords[0]) {
          polyCoords.push(polyCoords[0]);
          let polygon;
          try {
            polygon = turf.polygon([polyCoords]);
          } catch (error) {
            console.log(polyCoords);
            console.log(error);
          }

          if (
            turf.booleanPointInPolygon(depPoint, polygon) ||
            turf.booleanPointInPolygon(arrPoint, polygon)
          ) {
            return enrouteList.push(result);
          }

          const intersects = turf.lineIntersect(gcLine, polygon);
          if (intersects.features.length > 0) {
            return enrouteList.push(result);
          }
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
              `This should be an accurate representation as it uses the VAT-SPY sector definitions`
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
        this.parsePosition(controller.facility, controller.callsign)
      );
    });
    return table.toString();
  }

  parsePosition(position, callsign) {
    const pos = position.toString();
    switch (pos) {
      case "1":
        return "Flight Service Station";
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
};
