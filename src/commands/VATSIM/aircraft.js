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
              .setAuthor(val.realname)
              .addField("Speed", val.groundspeed, true)
              .addField("Altitude", val.altitude, true)
              .addField("Heading", val.heading, true),
            reactions: {
              "⬅️": "previous",
              "➡️": "next",
            },
          },
        ];

        if (val.planned_aircraft) {
          const pageContent = new MessageEmbed()
            .setTitle(val.callsign)
            .setColor("#47970E")
            .setAuthor(val.realname)
            .addField("Departure", val.planned_depairport, true)
            .addField("Arrival", val.planned_destairport, true);
          if (val.planned_altairport) {
            pageContent.addField("Alternate", val.planned_altairport, true);
          }
          pageContent
            .addField("Aircraft", val.planned_aircraft)
            .addField("Route", val.planned_route);
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
