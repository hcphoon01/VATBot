const { Listener } = require("discord-akairo");

class ReadyListener extends Listener {
  constructor() {
    super("ready", {
      emitter: "client",
      event: "ready",
    });
  }

  exec() {
    this.client.updateActivity();
  }
}

module.exports = ReadyListener;
