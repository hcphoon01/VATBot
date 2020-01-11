const { Command } = require("klasa");
const request = require("request");

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
      `https://api.checkwx.com/TAF/${airport}/decoded`,
      { headers: { "X-API-Key": process.env.WX_API }, json: true },
      (err, res, body) => {
        if (err) {
          console.log(err);
        }
        if (body.results !== 0) {
          const embed = {
            embed: {
              title: `Decoded TAF for ${airport}`,
              description: `RAW TAF: ` + "`" + body.data[0].raw_text + "`",
              color: 4691726,
              fields: [
                {
                  name: "Wind",
                  value: body.data[0].wind
                    ? `${body.data[0].wind.degrees} Degrees ${body.data[0].wind.speed_kts} Knots ${body.data[0].wind.speed_mph} miles per hour`
                    : `Wind Calm`
                },
                {
                  name: "Visibility",
                  value: `${body.data[0].visibility.miles} miles ${body.data[0].visibility.meters} meters`,
                  inline: true
                },
                {
                  name: "Clouds",
                  value: body.data[0].feet_agl
                    ? `${body.data[0].ceiling.text} ${body.data[0].ceiling.feet_agl} feet ${body.data[0].ceiling.meters_agl} meters`
                    : body.data[0].clouds[0]
                    ? body.data[0].clouds[0].text
                    : `Unknown Details`,
                  inline: true
                },
                {
                  name: "Temperature",
                  value: `${body.data[0].temperature.celsius}°C ${body.data[0].temperature.fahrenheit}°F`,
                  inline: true
                },
                {
                  name: "Dewpoint",
                  value: `${body.data[0].dewpoint.celsius}°C ${body.data[0].dewpoint.fahrenheit}°F`,
                  inline: true
                },
                {
                  name: "Barometer (QNH)",
                  value: `${body.data[0].barometer.hpa} hPa ${body.data[0].barometer.hg} hg`,
                  inline: true
                },
                {
                  name: "Humidity",
                  value: `${body.data[0].humidity.percent}%`,
                  inline: true
                }
              ]
            }
          };
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
