const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const request = require("request");

require("dotenv").config();

module.exports = class MetarCommand extends Command {
  constructor(...args) {
    super("metar", {
      name: "metar",
      cooldown: 5,
      description: {
        content: "Get the METAR for a given airport ICAO/given airport ICAOs",
        usage: "<icao>",
        examples: ["EGLL", "KJFK"],
      },
      aliases: ["metar"],
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
        `https://api.checkwx.com/metar/${airport}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            const embed = new MessageEmbed()
              .setTitle(`RAW METAR for ${airport}`)
              .setColor("#47970E")
              .setDescription("```" + body.data[0] + "```");

            return message.channel.send(embed);
          } else {
            return message.reply(
              `a METAR is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
            );
          }
        }
      );
    } else {
      const formatAirport = airport.join(",");
      request(
        `https://api.checkwx.com/metar/${formatAirport}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            const embed = new MessageEmbed()
              .setTitle(`METAR Results`)
              .setColor("#47970E");
            body.data.forEach((result, i) => {
              embed.addField(airport[i], "```" + result + "```");
            });
            return message.channel.send(embed);
          } else {
            return message.reply(
              `a METAR is not available for your requested airports ${airport.join(
                ","
              )}, please ensure you have entered a valid airport ICAO code`
            );
          }
        }
      );
    }
  }
};
