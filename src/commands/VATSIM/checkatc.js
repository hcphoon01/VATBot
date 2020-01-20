const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            cooldown: 5,
            description: 'Get an estimate of the ATC between 2 airports',
            usage: '<departure:icao> <arrival:icao>',
            usageDelim: ' ',
            enabled: false,
        });
    }

    async run(message, [...params]) {
        let controllerList = [];
        let departureAirport;
        let arrivalAirport;

        const positions = [2, 3, 4, 5];
        
        const airports = await this.client.providers.get('sqlite').getAll('airports');
        airports.forEach(airport => {
            if (airport.icao == params[0]) {
                departureAirport = airport;
            } else if (airport.icao == params[1]) {
                arrivalAirport = airport;
            }
        });
        this.client.handler.getControllers().then(val => {
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
                if (result.callsign.includes(params[0]) || result.callsign.includes(params[1])) {
                    controllerList.push(result);
                    return;
                } else if (positions.includes(result.facility)) {
                    return;
                }
                const circle = {
                    radius: result.range,
                    center: {
                        x: result.longitude,
                        y: result.latitude
                    }
                };
                if (this.circleDistFromLineSeg(circle, line) < 1) {
                    controllerList.push(result);
                }
            });
            console.log(controllerList);
        });
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
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
