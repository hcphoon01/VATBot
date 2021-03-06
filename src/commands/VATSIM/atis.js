const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

module.exports = class ATISCommand extends Command {
  constructor() {
    super("atis", {
      cooldown: 5,
      description: {
        content: "Fetch the ATIS for a given airport",
        usage: '<airport>',
        examples: ['EGLL', 'KJFK']
      },
      category: 'VATSIM',
      aliases: ["atis"],
      args: [
        {
          id: "airport",
          type: 'icao',
          prompt: {
            start: "Enter a valid Airport ICAO code",
            retry: "That is an invalid ICAO code, try again",
          },
        },
      ],
    });
  }

  exec(message, args) {
    const airport = args.airport;
    this.client.handler.getAirportInfo(airport).then((val) => {
      let atis;
      val.controllers.forEach((controller) => {
        if (controller.callsign.includes("ATIS")) atis = controller;
      });
      if (atis) {
        atis.atis_message = atis.atis_message.replace(/\^§/g, " ");
        const embed = new MessageEmbed()
          .setTitle(`ATIS for ${airport}`)
          .setColor("#47970E")
          .setDescription("```" + atis.atis_message + "```");
        return message.channel.send(embed);
      } else {
        return message.channel.send(
          "No ATIS has been found for your selected airport `" +
            airport.toUpperCase() +
            "`"
        );
      }
    });
  }
};
