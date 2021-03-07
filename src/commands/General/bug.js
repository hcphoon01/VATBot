const { Command } = require("discord-akairo");

module.exports = class BugCommand extends Command {
  constructor() {
    super("bug", {
      cooldown: 5,
      description: {
        content:
          "Display information for reporting bugs",
      },
      category: "General",
      aliases: ["bug"],
    });
  }
  exec(message) {
    return message.channel.send(
      "To report a bug you first need to join the VATBot Discord Server: https://discord.gg/Htzybqa\nThen head to the #tickets channel, click the reaction on the message, go to the created channel which should be #ticket-xxxx where `xxxx` is the number of your ticket, and report your bug."
    );
  }
};
