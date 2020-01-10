const Discord = require('discord.js');
const { KlasaClient, Event } = require('klasa');

//const channel = '549538230610165765';

module.exports = class extends Event {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            once: false,
            event: 'klasaReady'
        });
    }

    async run() {
        this.client.handler.on('newController', async (data) => {
            const embed = new Discord.MessageEmbed()
                .setColor('#9BC10B')
                .setTitle('New Controller Notification')
                .setDescription('See below for new controller activity\n')
                .setThumbnail('https://cdn.discordapp.com/app-icons/630862807897997341/989f99692163a76a7b81f91f8b094f11.png');
            
            data.forEach(controller => {
                if (controller.callsign.includes('ATIS')) return;
                if (controller.callsign.includes('OBS')) return;
                if (!controller.callsign.match(/([A-Z]{4})(_)(.*)/)) return;
                embed.addField(`Callsign: ${controller.callsign}`, `Frequency: ${this.parseFrequency(controller.frequency)}, Position: ${this.parsePosition(controller.facility)}`);
            });
            if (embed.fields.length > 1) {
                const guildList = await this.client.providers.get('sqlite').getAll('guilds');
                guildList.forEach(guild => {
                  this.client.channels.get(guild.notify_channel).send(embed);
                });
            }    
        });
    }

    parseFrequency(frequency) {
        const freq = frequency.toString();
        const parsed = [freq.slice(0, 2), freq.slice(2)];
        parsed[0] = '1' + parsed[0];
        return `${parsed[0]}.${parsed[1]}`;
      }
    
      parsePosition(position) {
        const pos = position.toString();
        switch (pos) {
          case '2':
            return 'Delivery';
          case '3':
            return 'Ground';
          case '4':
            return 'Tower';
          case '5':
            return 'Approach';
          case '6':
            return 'Center';
          default:
            return 'Not yet known';
        }
      }

    async init() {

    }

};
