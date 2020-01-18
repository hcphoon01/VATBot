const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            description: 'Get information for a given callsign',
            usage: '<callsign:string>',
        });
    }

    async run(message, [callsign]) {
        this.client.handler.getFlightInfo(callsign.toUpperCase()).then(async val => {
            if (!val) return message.send('There is no aircraft matching the requested callsign: `' + callsign.toUpperCase() + '`');
            const display = new RichDisplay(new MessageEmbed()
                .setTitle(val.callsign)
                .setColor('#47970E')
                .setAuthor(val.member.name)
            );
            display.addPage(template => {
                template.addField('Speed', val.speed, true)
                .addField('Altitude', val.altitude, true)
                .addField('Heading', val.heading, true);
                return template;
            });

            if (val.plan) {
                display.addPage(template => {
                    template.addField('Departure', val.plan.departure, true)
                    .addField('Arrival', val.plan.arrival, true);
                    if (val.plan.alternate) {
                        template.addField('Alternate', val.plan.alternate, true);
                    }
                    template.addField('Aircraft', val.plan.aircraft)
                    .addField('Route', val.plan.route);

                    return template;
                });
            }
            return display.run(await message.send('Loading Aircraft Information...'));
        });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
