const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const AsciiTable = require('ascii-table');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            cooldown: 5,
            description: 'Get an estimate of the ATC between 2 airports',
            usage: '<departure:icao> <arrival:icao>',
            usageDelim: ' ',
        });
    }

    async run(message, [...params]) {
        let departureList = [];
        let arrivalList = [];
        let enrouteList = [];

        const positions = [2, 3, 4, 5];
        
        //const airports = await this.client.providers.get('json').getAll('airports');
        const departureAirport = await this.client.providers.get('json').get('airports', params[0]);
        const arrivalAirport = await this.client.providers.get('json').get('airports', params[1]);
        // airports.forEach(airport => {
        //     if (airport.icao == params[0]) {
        //         departureAirport = airport;
        //     } else if (airport.icao == params[1]) {
        //         arrivalAirport = airport;
        //     }
        // });
        this.client.handler.getControllers().then(async val => {
            const line = {
                p1: {
                    x: departureAirport.longitude,
                    y: departureAirport.latitude
                },
                p2: {
                    x: arrivalAirport.longitude,
                    y: arrivalAirport.latitude
                }
            };
            val.forEach(result => {
                if (result.callsign.includes(params[0])) {
                    departureList.push(result);
                    return;
                } else if (result.callsign.includes(params[1])) {
                    arrivalList.push(result);
                    return;
                } else if (positions.includes(result.facilitytype)) {
                    return;
                }
                const circle = {
                    radius: result.range,
                    center: {
                        x: result.longitude,
                        y: result.latitude
                    }
                };
                if (this.circleDistFromLineSeg(circle, line) < 3) {
                    enrouteList.push(result);
                }
            });
            const display = new RichDisplay(new MessageEmbed()
                .setTitle(`Current ATC between ${params[0]} and ${params[1]}`)
                .setColor('#47970E')
                .setDescription(`Please remember that this is just a rough estimate using controllers range rings not defined FIRs`));
            
            display.addPage(template => {
                if (departureList.length > 0 ) {
                    template.addField('Departure Controllers', '```' + this.createTable(departureList) + '```');
                } else {
                    template.addField('Departure Controllers', `No Controllers at your Departure Airport: ${params[0]}`);
                }
                return template;
            });
            display.addPage(template => {
                if (enrouteList.length > 0 ) {
                    template.addField('En-Route Controllers', '```' + this.createTable(enrouteList) + '```');
                } else {
                    template.addField('En-Route Controllers', `There are no En-Route Controllers between your 2 Airports`);
                }
                return template;
            });
            display.addPage(template => {
                if (arrivalList.length > 0 ) {
                    template.addField('Arrival Controllers', '```' + this.createTable(arrivalList) + '```');
                } else {
                    template.addField('Arrival Controllers', `No Controllers at your Arrival Airport: ${params[1]}`);
                }
                return template;
            });

            return display.run(await message.send('Loading Controllers...'));
        });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

    createTable(list) {
        const table = new AsciiTable();
        table.setHeading('Callsign', 'Frequency', 'Position');
        list.forEach(controller => {
            table.addRow(controller.callsign, controller.frequency, this.parsePosition(controller.facilitytype, controller.callsign));
        });
        return table.toString();
    }
    
    parsePosition(position, callsign) {
        const pos = position.toString();
        switch (pos) {
            case '2':
            return 'Delivery';
            case '3':
            return 'Ground';
            case '5':
            return 'Approach';
            case '6':
            return 'Center';
            case '4':
            return this.parseTower(callsign);
            default:
            return this.parseTower(callsign);
        }
    }

    parseTower(callsign) {
        if (callsign.includes('ATIS')) {
            return 'ATIS';
        } else if (callsign.includes('TWR')) {
            return 'Tower';
        }
    }
      
    circleDistFromLineSeg(circle,line){
        var v1, v2, v3, u;
        v1 = {};
        v2 = {};
        v3 = {};
        v1.x = line.p2.x - line.p1.x;
        v1.y = line.p2.y - line.p1.y;
        v2.x = circle.center.x - line.p1.x;
        v2.y = circle.center.y - line.p1.y;
        u = (v2.x * v1.x + v2.y * v1.y) / (v1.y * v1.y + v1.x * v1.x); // unit dist of point on line
        if(u >= 0 && u <= 1){
            v3.x = (v1.x * u + line.p1.x) - circle.center.x;
            v3.y = (v1.y * u + line.p1.y) - circle.center.y;
            v3.x *= v3.x;
            v3.y *= v3.y;
            return Math.sqrt(v3.y + v3.x); // return distance from line
        } 
        // get distance from end points
        v3.x = circle.center.x - line.p2.x;
        v3.y = circle.center.y - line.p2.y;
        v3.x *= v3.x;  // square vectors
        v3.y *= v3.y;    
        v2.x *= v2.x;
        v2.y *= v2.y;
        return Math.min(Math.sqrt(v2.y + v2.x), Math.sqrt(v3.y + v3.x)); // return smaller of two distances as the result
    }
};
