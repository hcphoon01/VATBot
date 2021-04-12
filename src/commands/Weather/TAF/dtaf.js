const { Command } = require("discord-akairo");
const MessageEmbed = require('../../../Util/MessageEmbed');
const { Menu } = require("discord.js-menu");
const moment = require("moment");
const request = require("request");
require("dotenv").config();

const timeRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}[A-Z][0-9]{2}:[0-9]{2}:[0-9]{2}[A-Z])/;

module.exports = class DtafCommand extends Command {
  constructor(...args) {
    super("dtaf", {
      name: "dtaf",
      cooldown: 5,
      description: {
        content: "Get a decoded TAF for a given ICAO Code",
        usage: "<icao>",
        examples: ["EGLL", "KJFK"],
      },
      aliases: ["dtaf"],
      category: "Weather",
      args: [
        {
          id: "airport",
          type: "icao",
          prompt: {
            start: "Enter a valid Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
      ],
    });
  }

  async exec(message, args) {
    const airport = args.airport;
    if (airport.length == 0)
      return message.reply("you must specify an ICAO code");
    request(
      `https://api.checkwx.com/taf/${airport}/decoded`,
      { headers: { "X-API-Key": process.env.WX_API }, json: true },
      async (err, res, body) => {
        if (err) {
          console.log(err);
        }
        if (body.results !== 0) {
          const reactions = {
            "⏪": "first",
            "⬅️": "previous",
            "➡️": "next",
            "⏩": "last",
            "⏹️": "stop",
          };

          const pages = [
            {
              name: "main",
              reactions: reactions,
              content: MessageEmbed(`Decoded TAF for ${airport}`, message, this.client)
                .setDescription("RAW TAF: " + "`" + body.data[0].raw_text + "`")
                .addField(
                  "Forecast",
                  `From: ${moment(body.data[0].timestamp.from).format(
                    "MM/DD/YYYY HH:mm"
                  )}z to: ${moment(body.data[0].timestamp.to).format(
                    "MM/DD/YYYY HH:mm"
                  )}z`
                ),
            },
          ];

          var forecastArray = Object.values(body.data[0].forecast);

          for (let i = 0; i < forecastArray.length; i++) {
            const forecast = forecastArray[i];
            const content = MessageEmbed(`Decoded TAF for ${airport}`, message, this.client)
              .setDescription("RAW TAF: " + "`" + body.data[0].raw_text + "`");
            if (i != 0) {
              content.addField(
                `${forecast.change.indicator.text}`,
                `${forecast.change.indicator.desc.replace(timeRegex, (str) =>
                  moment(str).format("MM/DD/YYYY HH:mm")
                )}`
              );
            }
            try {
              if (forecast.wind.gust_kts) {
                content.addField(
                  "Wind",
                  `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour. Gusting  ${forecast.wind.gust_kts} Knots ${forecast.wind.gust_kts} Miles per Hour`,
                  true
                );
              }
            } catch (e) {
              // Nothing
            }

            if (forecast.wind && !forecast.wind.gust_kts) {
              content.addField(
                "Wind",
                `${forecast.wind.degrees} Degrees ${forecast.wind.speed_kts} Knots ${forecast.wind.speed_mph} Miles per Hour.`,
                true
              );
            }
            if (forecast.visibility) {
              content.addField(
                "Visibility",
                `${forecast.visibility.meters} Meters`,
                true
              );
            }
            if (forecast.clouds.length > 0) {
              forecast.clouds.forEach((cloud) => {
                if (cloud.code == "NSC") {
                  content.addField("Clouds", `${cloud.text}`);
                } else {
                  content.addField(
                    "Clouds",
                    `${cloud.text} ${cloud.base_feet_agl} Feet ${cloud.base_meters_agl} Meters`
                  );
                }
              });
            }
            if (forecast.conditions.length > 0) {
              forecast.conditions.forEach((condition) => {
                content.addField("Conditions", `${condition.text}`, true);
              });
            }
            const page = {
              name: `forecast${i}`,
              content: content,
              reactions: reactions,
            };

            pages.push(page);
          }

          const display = new Menu(message.channel, message.author.id, pages);

          return display.start();
        } else {
          return message.reply(
            `a TAF is not available for your requested airport ${airport}, please ensure you have entered a valid airport ICAO code`
          );
        }
      }
    );
  }
};
