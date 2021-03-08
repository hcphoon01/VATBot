const { Listener } = require("discord-akairo");

module.exports = class InvalidChannelListener extends Listener {
  constructor() {
    super("commandBlocked", {
      emitter: "commandHandler",
      event: "commandBlocked",
    });
  }

  exec(message, reason) {
    if (reason == "guild") {
      return message.reply("You can only use that command in a server");
    }
  }
};
