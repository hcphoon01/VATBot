const { KlasaClient, Client } = require("klasa");
const DataHandler = require('vatsim-data-handler');

require("dotenv").config();

const client = new KlasaClient({
  prefix: "!",
  commandEditing: true,
  typing: true,
  provider: { engine: 'sqlite' },
  readyMessage: client =>
    `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`,
});

Client.defaultGuildSchema.add('notification', notifyFolder => {
  notifyFolder.add('channel', 'channel');
});

client.handler = new DataHandler();

client.login(process.env.DISCORD_TOKEN);