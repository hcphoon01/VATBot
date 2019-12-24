const { Command } = require("klasa");
const AsciiTable = require("ascii-table");

const request = require("request");
require("dotenv").config();

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "METAR",
      cooldown: 2,
      description: "Get the METAR for a given airport ICAO/given airport ICAOs",
      extendedHelp:
        "<> means an ICAO code is a required argument and [...] means multiple codes can be passed with the command",
      usage: "<ICAO:ICAO>[...]",
      usageDelim: " "
    });
  }

  async run(message, [...airport]) {
    if (airport.length == 0) return message.reply("you must specify an ICAO code");
    if (airport.length == 1) {
      request(
        `https://api.checkwx.com/metar/${airport}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            return message.channel.send(
              `The METAR for ${airport} is: ` + "`" + body.data[0] + "`"
            );
          } else {
            return message.reply(
              `a METAR is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
            );
          }
        }
      );
    } else {
      request(
        `https://api.checkwx.com/metar/${airport.join(",")}`,
        { headers: { "X-API-Key": process.env.WX_API }, json: true },
        (err, res, body) => {
          if (err) {
            console.log(err);
          }
          if (body.results !== 0) {
            const table = new AsciiTable("METAR Results");
            table.setHeading("ICAO", "METAR");
            body.data.forEach(result => {
              table.addRow(result.substr(0, result.indexOf(" ")), result);
            });
            return message.channel.send("```" + table.toString() + "```");
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
