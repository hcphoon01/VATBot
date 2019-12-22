const { Client } = require('klasa');

require('dotenv').config();

new Client({
  prefix: '!',
  commandEditing: true,
  typing: true,
  readyMessage: (client) => `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`
}).login(process.env.DISCORD_TOKEN);