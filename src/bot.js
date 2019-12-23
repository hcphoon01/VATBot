const { KlasaClient, Schema } = require("klasa");

require("dotenv").config();

const client = new KlasaClient({
  prefix: "!",
  commandEditing: true,
  typing: true,
  readyMessage: client =>
    `Successfully initialized. Ready to serve ${client.guilds.size} guilds.`
});

/*client.gateways.register("airports", {
  provider: "sqlite",
  schema: new Schema()
    .add("ICAO", "String")
    .add("latitude", "Integer")
    .add("longitude", "Integer")
});*/

client.login(process.env.DISCORD_TOKEN);