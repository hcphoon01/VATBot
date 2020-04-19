const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: false,
            name: 'flight',
            description: 'Get a flight based on airport popularity',
            usage: '[distance:integer]',
        });
    }

    async run(message, [...params]) {
        this.client.handler.getPopularAirports().then(async val => {
            if (params[0]) {
                var distance = 0;
                while (distance > params[0]) {
                    const airports = this.getRandom(val, 2);
                    const departure = await this.client.providers.get('sqlite').get('airports', 'icao', airports[0].id);
                    const arrival = await this.client.providers.get('sqlite').get('airports', 'icao', airports[1].id);
                    distance = this.distance(departure.latitude, departure.longitude, arrival.latitude, arrival.longitude);
                    console.log(airports);
                }

            } else {
                const airports = this.getRandom(val, 2);
                const departure = await this.client.providers.get('sqlite').get('airports', 'icao', airports[0].id);
                const arrival = await this.client.providers.get('sqlite').get('airports', 'icao', airports[1].id);
                const distance = this.distance(departure.latitude, departure.longitude, arrival.latitude, arrival.longitude);

                const embed = new MessageEmbed();
                embed.setTitle('Random Flight')
                    .setColor('#47970E')
                    .addField('Departure', departure.icao)
                    .addField('Arrival', arrival.icao, true)
                    .addField('Distance', Math.round(distance));

                return message.send(embed);
            }
        });
    }

    getRandom(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError("getRandom: more elements taken than available");
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }

    distance(lat1, lon1, lat2, lon2) {
        var p = 0.017453292519943295;    // Math.PI / 180
        var c = Math.cos;
        var a = 0.5 - c((lat2 - lat1) * p)/2 + 
                c(lat1 * p) * c(lat2 * p) * 
                (1 - c((lon2 - lon1) * p))/2;
      
        var dist = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; Result in km
        return dist * 0.6214; // Result in Nautical Miles
      }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
