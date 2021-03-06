const { handler } = require('vatsim-data-handler');
const { AkairoClient, CommandHandler, ListenerHandler } = require('discord-akairo');
require('dotenv').config();

// const client = new KlasaClient({
//   prefix: "!",
//   commandEditing: true,
//   typing: true,
//   providers: {default: 'json'},
//   readyMessage: client =>
//     `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
// });

// Client.defaultGuildSchema.add('notify_channel', 'string');

class MyClient extends AkairoClient {
    constructor() {
        super({
            // Options for Akairo go here.
        }, {
            // Options for discord.js goes here.
        });

        this.commandHandler = new CommandHandler(this, {
            directory: './src/commands/',
            prefix: '!'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './src/listeners/'
        });

        this.listenerHandler.setEmitters({
            process: process,
        });

        this.commandHandler.loadAll();
        //this.listenerHandler.loadAll();
    }
}

const client = new MyClient();
client.login(process.env.DISCORD_TOKEN);

client.handler = handler;

client.on('ready', () => {
    client.handler.getCount('all').then(val => client.user.setActivity(`over ${val} users | !help`, { type: 'WATCHING' }));
    console.log(`Successfully initialized.`);
});