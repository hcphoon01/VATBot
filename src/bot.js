require('log-timestamp');
const { handler } = require("vatsim-data-handler");
const {
  AkairoClient,
  CommandHandler,
  ListenerHandler,
  SQLiteProvider,
} = require("discord-akairo");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
require("dotenv").config();

class MyClient extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: "136184427318476800",
      },
      {
        // Options for discord.js goes here.
      }
    );

    this.commandHandler = new CommandHandler(this, {
      directory: "./src/commands/",
      prefix: (message) => {
        if (message.guild) {
          return this.settings.get(message.guild.id, "prefix", "!");
        }

        return "!";
      },
    });

    this.commandHandler.resolver.addType("icao", (message, phrase) => {
      if (!phrase) return null;
      const result = /[A-Z]{4}/i.exec(phrase);
      if (result) return phrase.toUpperCase();
      return null;
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: "./src/listeners/",
    });

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      process: process,
    });

    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();

    this.settings = new SQLiteProvider(
      sqlite.open({
        filename: path.join(__dirname + "/bwd/sqlite/db.sqlite"),
        driver: sqlite3.Database,
      }),
      "guild_settings",
      {
        idColumn: "guild_id",
        dataColumn: "settings",
      }
    );

    this.airports = new SQLiteProvider(
      sqlite.open({
        filename: path.join(__dirname + "/bwd/sqlite/db.sqlite"),
        driver: sqlite3.Database,
      }),
      "airports",
      {
        idColumn: "icao",
      }
    );
  }
  async _init() {
    await this.settings.init();
    await this.airports.init();
  }
}

const client = new MyClient();
client._init();
client.login(process.env.DISCORD_TOKEN);

client.handler = handler;

client.updateActivity = function () {
  client.handler
    .getCount("all")
    .then((val) =>
      client.user.setActivity(`over ${val} users | !help`, { type: "WATCHING" })
    );
};

client.on("ready", () => {
  console.log(`Successfully initialized.`);
});
