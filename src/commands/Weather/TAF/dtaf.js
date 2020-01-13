const { Command, RichDisplay } = require("klasa");
const { MessageEmbed } = require('discord.js');
const request = require("request");
const moment = require('moment');

const timeRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}[A-Z][0-9]{2}:[0-9]{2}:[0-9]{2}[A-Z])/;

module.exports = class extends Command {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      name: "Decoded TAF",
      aliases: ["dtaf"],
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
      async (err, res, body) => {
        if (err) {
          console.log(err);
        }
        if (body.results !== 0) {
          const display = new RichDisplay(new MessageEmbed()
            .setTitle(`Decoded TAF for ${airport}`)
            .setDescription('RAW TAF: ' + "`" + body.data[0].raw_text + "`")
            .setColor('#47970E')
            .addField('Forecast', `From: ${moment(body.data[0].timestamp.from).format('DD/MM/YYYY HH:mm')}z to: ${moment(body.data[0].timestamp.to).format('DD/MM/YYYY HH:mm')}z`)
          );

          var forecastArray = Object.values(body.data[0].forecast);
          forecastArray.forEach(forecast => {
            if (forecast.section_key == 0) return;
            console.log(forecast); 
            display.addPage(template => {
              template.addField(`${forecast.change.indicator.text}`, `${forecast.change.indicator.desc.replace(timeRegex, str => moment(str).format('DD/MM/YYYY HH:mm'))}`);
              try {
                if (forecast.wind.gust_kts) {
                  template.addField('Wind', `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour. Gusting  ${forecast.wind.gust_kts} Knots ${forecast.wind.gust_kts} Miles per Hour`, true);
                }
              } catch (e) {
                // Nothing
              }
              
              if (forecast.wind && !forecast.wind.gust_kts) {
                template.addField('Wind', `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour.`, true);
              } if (forecast.visibility) { 
                template.addField('Visibility', `${forecast.visibility.miles} Miles ${forecast.visibility.meters} Meters`, true);
              } if (forecast.clouds.length > 0) {
                forecast.clouds.forEach(cloud => {
                  template.addField('Clouds', `${cloud.text} ${cloud.base_feet_agl} Feet ${cloud.base_meters_agl} Meters`);
                });
              } if (forecast.conditions.length > 0) {
                forecast.conditions.forEach(condition => {
                  template.addField('Conditions', `${condition.text}`, true);
                });
              }
              return template;
            });
          });

          return display.run(await message.send('Loading TAF...'));
        }
        else {
          return message.reply(
            `a TAF is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
          );
        }
      }
    );
  }
};
