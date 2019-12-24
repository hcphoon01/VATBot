const { KlasaClient } = require("klasa");
const DataHandler = require('vatsim-data-handler');

require("dotenv").config();

const client = new KlasaClient({
  prefix: "!",
  commandEditing: true,
  typing: true,
  readyMessage: client =>
    `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`
});

client.handler = new DataHandler();

client.login(process.env.DISCORD_TOKEN);