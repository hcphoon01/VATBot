const { Listener } = require("discord-akairo");

module.exports = class UpdateActivityListener extends Listener {
  constructor() {
    super("updateActivity", {
      emitter: "commandHandler",
      event: "commandFinished",
    });
  }

  exec() {
    this.client.updateActivity();
  }
};
