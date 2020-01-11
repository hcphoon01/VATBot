const { Command } = require("klasa");
const Discord = require('discord.js');
const request = require("request");
const moment = require('moment');

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      name: "Decoded TAF",
      aliases: ["dtaf"],
      enabled: false,
      cooldown: 2,
      description: "Get a decoded TAF for a given ICAO Code",
      usage: "<ICAO:icao>",
      extendedHelp: "<> means an ICAO code is a required argument."
    });
  }

  async run(message, [airport]) {
    if (airport.length == 0) return message.reply("you must specify an ICAO code");
    request(
      `https://api.checkwx.com/taf/${airport}/decoded`,
      { headers: { "X-API-Key": process.env.WX_API }, json: true },
      (err, res, body) => {
        if (err) {
          console.log(err);
        }
        if (body.results !== 0) {
          const embed = new Discord.MessageEmbed();
          embed.setTitle(`Decoded TAF for ${airport}`)
            .setDescription('RAW TAF: ' + "`" + body.data[0].raw_text + "`")
            .setColor('#47970E')
            .addBlankField()
            .addField('Forecast', `From: ${moment(body.data[0].timestamp.from).format('DD/MM/YYYY HH:mm')}z to: ${moment(body.data[0].timestamp.to).format('DD/MM/YYYY HH:mm')}`);

          body.data[0].forecast.forEach(forecast => {
            if (forecast.section_key == 0) return; 
            console.log(forecast);
            embed.addBlankField()
              .addField(`${forecast.change.indicator.text}`, `${forecast.change.indicator.description}`);
            if (forecast.wind.gust_kts) {
              embed.addField('Wind', `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour. Gusting  ${forecast.wind.gust_kts} Knots ${forecast.wind.gust_kts} Miles per Hour`, true);
            } else if (forecast.wind && !forecast.wind.gust_kts) {
              embed.addField('Wind', `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour.`, true);
            } else if (forecast.visibility) { 
              embed.addField('Visibility', `${forecast.visibility.miles} Miles ${forecast.visibility.meters} Meters`, true);
            } else if (forecast.clouds) {
              embed.addField('Clouds', `${forecast.clouds.text} ${forecast.clouds.base_feet_agl} Feet ${forecast.clouds.base_meters_agl} Meters`);
            } else if (forecast.conditions.length > 0) {
              forecast.conditions.forEach(condition => {
                embed.addField('Conditions', `${condition.text}`, true);
              });
            }
          });
          //     fields: [
          //       {
          //         name: "Clouds",
          //         value: body.data[0].feet_agl
          //           ? `${body.data[0].ceiling.text} ${body.data[0].ceiling.feet_agl} feet ${body.data[0].ceiling.meters_agl} meters`
          //           : body.data[0].clouds[0]
          //           ? body.data[0].clouds[0].text
          //           : `Unknown Details`,
          //         inline: true
          //       },
          //       {
          //         name: "Temperature",
          //         value: `${body.data[0].temperature.celsius}°C ${body.data[0].temperature.fahrenheit}°F`,
          //         inline: true
          //       },
          //       {
          //         name: "Dewpoint",
          //         value: `${body.data[0].dewpoint.celsius}°C ${body.data[0].dewpoint.fahrenheit}°F`,
          //         inline: true
          //       },
          //       {
          //         name: "Barometer (QNH)",
          //         value: `${body.data[0].barometer.hpa} hPa ${body.data[0].barometer.hg} hg`,
          //         inline: true
          //       },
          //       {
          //         name: "Humidity",
          //         value: `${body.data[0].humidity.percent}%`,
          //         inline: true
          //       }
          //     ]
          //   }
          // };
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
