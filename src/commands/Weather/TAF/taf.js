const { Command } = require("klasa");
const { MessageEmbed } = require('discord.js');

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
      usage: "<ICAO:icao>",
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
          const embed = new MessageEmbed()
            .setTitle(`RAW TAF for ${airport}`)
            .setColor('#47970E')
            .setDescription('```' + body.data[0] + "```");
          
          return message.channel.send(embed);

        } else {
          return message.reply(
            `a TAF is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
          );
        }
      }
    );
  }
};
