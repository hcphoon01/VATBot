const { Command } = require("klasa");
const AsciiTable = require("ascii-table");

const request = require("request");
require("dotenv").config();

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "TAF",
      cooldown: 2,
      description: "Get the TAF for a given airport ICAO/given airport ICAOs",
      extendedHelp:
        "<> means an ICAO code is a required argument and [...] means multiple codes can be passed with the command",
      usage: "<ICAO:ICAO>",
      usageDelim: " "
    });
  }

  async run(message, [airport]) {
    if (airport.length == 0) return message.reply("you must specify an ICAO code");
    request(
      `https://api.checkwx.com/taf/${airport}`,
      { headers: { "X-API-Key": process.env.WX_API }, json: true },
      (err, res, body) => {
        if (err) {
          console.log(err);
        }
        if (body.results !== 0) {
          return message.channel.send(
            `The TAF for ${airport} is: ` + "`" + body.data[0] + "`"
          );
        } else {
          return message.reply(
            `a TAF is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
          );
        }
      }
    );
  }
};
