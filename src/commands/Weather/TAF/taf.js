const { Command } = require("discord-akairo");
const MessageEmbed = require("../../../Util/MessageEmbed");

const request = require("request");
require("dotenv").config();

module.exports = class TafCommand extends Command {
  constructor(...args) {
    super("taf", {
      name: "taf",
      cooldown: 5,
      description: {
        content: "Get the TAF for a given airport ICAO/given airport ICAOs",
        usage: "<icao>",
        examples: ["EGLL", "KJFK"],
      },
      aliases: ["taf"],
      category: "Weather",
      args: [
        {
          id: "airport",
          type: "icao",
          match: "content",
          prompt: {
            start: "Enter a valid Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
      ],
    });
  }

  async exec(message, args) {
    const airport = args.airport.split(" ");
    if (airport.length == 0)
      return message.reply("you must specify an ICAO code");
    if (airport.length == 1) {
      request(
        `https://api.checkwx.com/taf/${airport}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            const embed = MessageEmbed(`RAW TAF for ${airport}`, message, this.client)
              .setDescription("```" + body.data[0] + "```");

            return message.channel.send(embed);
          } else {
            return message.reply(
              `a TAF is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
            );
          }
        }
      );
    } else {
      const formatAirport = airport.join(",");
      request(
        `https://api.checkwx.com/taf/${formatAirport}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            const embed = MessageEmbed(`TAF Results`, message, this.client);
            body.data.forEach((result, i) => {
              embed.addField(airport[i], "```" + result + "```");
            });
            return message.channel.send(embed);
          } else {
            return message.reply(
              `a TAF is not available for your requested airports ${airport.join(
                ","
              )}, please ensure you have entered a valid airport ICAO code`
            );
          }
        }
      );
    }
  }
};
