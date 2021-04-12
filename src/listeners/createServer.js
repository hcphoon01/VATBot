const { Listener } = require("discord-akairo");
const express = require('express');
const moment = require("moment");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

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
