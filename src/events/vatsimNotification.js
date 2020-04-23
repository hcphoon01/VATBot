const Discord = require('discord.js');
const { KlasaClient, Event } = require('klasa');

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
        process.on('newController', async (data) => {
          const embed = new Discord.MessageEmbed()
              .setColor('#9BC10B')
              .setTitle('New Controller Notification')
              .setDescription('See below for new controller activity\n')
              .setThumbnail('https://cdn.discordapp.com/app-icons/630862807897997341/989f99692163a76a7b81f91f8b094f11.png');
          
          data.forEach(controller => {
              if (controller.callsign.includes('ATIS')) return;
              if (controller.facilitytype == 0) return;
              embed.addField(`Callsign: ${controller.callsign}`, `Frequency: ${controller.frequency}, Position: ${this.parsePosition(controller.facilitytype)}`);
          });
          if (embed.fields.length > 0) {
            await this.sendMessage(embed);
          }    
        });
        // process.on('newPilot', async (data) => {
        //   const embed = new Discord.MessageEmbed()
        //       .setColor('#9BC10B')
        //       .setTitle('New Pilot Notification')
        //       .setDescription('See below for new pilot activity\n')
        //       .setThumbnail('https://cdn.discordapp.com/app-icons/630862807897997341/989f99692163a76a7b81f91f8b094f11.png');
        //   data.forEach(pilot => {
        //       embed.addField(`Callsign: ${pilot.callsign}`, `Altitude: ${pilot.altitude}, Heading: ${pilot.heading}, Speed: ${pilot.groundspeed }`);
        //   });
        //   if (embed.fields.length > 1) {
        //     await this.sendMessage(embed);
        //   } 
        // });
    }

    async sendMessage(embed) {
      console.log(embed);
      const guildList = await this.client.providers.get('json').getAll('guilds');
      if (guildList.length > 0) {
        guildList.forEach(guild => {
          try {
            this.client.channels.cache.get(guild.notify_channel).send(embed);
          }
          catch (e) {
            console.log(e);
          }
        });
      }
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
