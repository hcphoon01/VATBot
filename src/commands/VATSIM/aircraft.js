const { Command } = require("discord-akairo");
const { Menu } = require("discord.js-menu");
const { MessageEmbed } = require("discord.js");

module.exports = class AircraftCommand extends Command {
  constructor() {
    super("aircraft", {
      cooldown: 5,
      description: {
        content: "Get information for a given callsign",
        usage: '<callsign>',
        examples: ['BAW1', 'G-ETMCA']
      },
      category: 'VATSIM',
      aliases: ["aircraft"],
      args: [
        {
          id: "callsign",
          type: "string",
          prompt: {
            start: 'Please enter an aircraft callsign',
            retry: 'You must enter a valid aircraft callsign'
          }
        },
      ],
      channel: 'guild',
    });
  }

  exec(message, args) {
    this.client.handler
      .getFlightInfo(args.callsign.toUpperCase())
      .then(async (val) => {
        if (!val) {
          return message.channel.send(
            "There is no aircraft matching the requested callsign: `" +
              args.callsign.toUpperCase() +
              "`"
          );
        }
        const pages = [
          {
            name: "main",
            content: new MessageEmbed()
              .setTitle(val.callsign)
              .setColor("#47970E")
              .setAuthor(val.name)
              .addField("Speed", val.groundspeed, true)
              .addField("Altitude", val.altitude, true)
              .addField("Heading", val.heading, true),
            reactions: {
              "⬅️": "previous",
              "➡️": "next",
            },
          },
        ];

        if (val.flight_plan) {
          const pageContent = new MessageEmbed()
            .setTitle(val.callsign)
            .setColor("#47970E")
            .setAuthor(val.name)
            .addField("Departure", val.flight_plan.departure, true)
            .addField("Arrival", val.flight_plan.arrival, true);
          if (val.flight_plan.alternate) {
            pageContent.addField("Alternate", val.flight_plan.alternate, true);
          }
          pageContent
            .addField("Aircraft", val.flight_plan.aircraft_short)
            .addField("Route", val.flight_plan.route);
          pages.push({
            name: "airports",
            content: pageContent,
            reactions: {
              "⬅️": "previous",
              "➡️": "next",
            },
          });
        }

        const menu = new Menu(message.channel, message.author.id, pages);
        return menu.start();
      });
  }
};
