const { Listener } = require("discord-akairo");
const express = require('express');
const moment = require("moment");
const app = express();
const port = 3000;

app.use(express.json());
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://homestead.test');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

class CreateServer extends Listener {
    constructor() {
        super("createServer", {
            emitter: "client",
            event: "ready",
        });
    }

    exec() {
        app.get('/details', (req, res) => {
            const now = moment(new Date);
            const start = Date.now() - (process.uptime() * 1000);

            return res.send({
                servers: this.client.guilds.cache.size,
                users: this.client.users.cache.size,
                uptime: capitalize(moment.duration(now.diff(start)).humanize()),
                latency: this.client.ws.ping.toFixed(0)
            });
        });

        app.listen(port, () => {
            console.log(`Server listening on ${port}`);
        });
    }
}

function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

module.exports = CreateServer;
