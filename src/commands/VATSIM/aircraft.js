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
                .setAuthor(val.realname)
            );
            display.addPage(template => {
                template.addField('Speed', val.groundspeed, true)
                .addField('Altitude', val.altitude, true)
                .addField('Heading', val.heading, true);
                return template;
            });

            if (val.planned_aircraft) {
                display.addPage(template => {
                    template.addField('Departure', val.planned_depairport, true)
                    .addField('Arrival', val.planned_destairport, true);
                    if (val.planned_altairport) {
                        template.addField('Alternate', val.planned_altairport, true);
                    }
                    template.addField('Aircraft', val.planned_aircraft)
                    .addField('Route', val.planned_route);

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
