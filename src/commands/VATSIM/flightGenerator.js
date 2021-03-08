const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

module.exports = class FlightGeneratorCommand extends Command {
  constructor() {
    super("flightGenerator", {
      cooldown: 5,
      description: {
        content: "Get a randomly generated flight",
        usage: "[distance in Nautical Miles]",
        examples: ["", "300"],
      },
      category: "VATSIM",
      aliases: ["flight", "flightgenerator", "flight-generator", "generate"],
      args: [
        {
          id: "distance",
          type: "integer",
          default: null,
        },
      ],
      channel: 'guild',
    });
  }

  exec(message, args) {
    this.client.handler.getPopularAirports().then(async (val) => {
      if (args.distance) {
        for (let i = 0; i < val.length; i++) {
          val[i].details = await this.client.airports.items.get(val[i].id);
        }
        const pairs = val.reduce((acc, curr, currIdx, arr) => {
          for (let i = currIdx + 1; i < arr.length; i++)
            acc.push([curr, arr[i]]);
          return acc;
        }, []);

        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i];
          pairs[i].distance = this.distance(
            pair[0].details.latitude,
            pair[0].details.longitude,
            pair[1].details.latitude,
            pair[1].details.longitude
          );
        }
        const closest = pairs.reduce((a, b) => {
          let aDiff = Math.abs(a.distance - args.distance);
          let bDiff = Math.abs(b.distance - args.distance);

          if (aDiff == bDiff) {
            // Choose largest vs smallest (> vs <)
            return a.distance > b.distance ? a.distance : b.distance;
          } else {
            return bDiff < aDiff ? b : a;
          }
        });

        const embed = new MessageEmbed()
          .setTitle("Random Flight")
          .setColor("#47970E")
          .addField(
            "Departure",
            `\`${closest[0].details.icao}\`, \`${closest[0].count}\` users`
          )
          .addField(
            "Arrival",
            `\`${closest[1].details.icao}\`, \`${closest[1].count}\` users`,
            true
          )
          .addField("Distance (nmi)", `\`${Math.round(closest.distance)}\``);

        return message.channel.send(embed);
      } else {
        const airports = this.getRandom(val, 2);
        const departure = await this.client.airports.items.get(airports[0].id);
        const arrival = await this.client.airports.items.get(airports[1].id);
        const distance = this.distance(
          departure.latitude,
          departure.longitude,
          arrival.latitude,
          arrival.longitude
        );

        const embed = new MessageEmbed()
          .setTitle("Random Flight")
          .setColor("#47970E")
          .addField(
            "Departure",
            `\`${departure.icao}\`, \`${airports[0].count}\` users`
          )
          .addField(
            "Arrival",
            `\`${arrival.icao}\`, \`${airports[1].count}\` users`,
            true
          )
          .addField("Distance (nmi)", `\`${Math.round(distance)}\``);

        return message.channel.send(embed);
      }
    });
  }

  getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  distance(lat1, lon1, lat2, lon2) {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    var dist = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; Result in km
    return dist * 0.6214; // Result in Nautical Miles
  }
};
