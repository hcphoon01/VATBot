const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            cooldown: 5,
            description: 'Fetch the ATIS for a given airport',
            usage: '<ICAO:icao>',
        });
    }

    async run(message, [airport]) {
        this.client.handler.getAirportInfo(airport).then(val => {
            let atis;
            val.controllers.forEach(controller => {
                if (controller.callsign.includes('ATIS')) atis = controller;
            });
            if (atis) {
                atis.atis_message = atis.atis_message.replace(/\^§/g, ' ');
                const embed = new MessageEmbed()
                    .setTitle(`ATIS for ${airport}`)
                    .setColor('#47970E')
                    .setDescription('```' + atis.atis_message + '```');
                return message.channel.send(embed);
            } else {
                return message.channel.send('No ATIS has been found for your selected airport `' + airport.toUpperCase() + '`');
            }
        });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
