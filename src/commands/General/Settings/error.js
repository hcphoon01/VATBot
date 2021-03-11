const { Command } = require("discord-akairo");

module.exports = class ErrorNotificationCommand extends Command {
  constructor() {
    super("error", {
      aliases: ["error"],
      description: {
        content: "Change error notification preferences - Server Owner Only",
        usage: "<enable|disable>",
        examples: ["enable", "enable"],
        hideHelp: true,
      },
      category: "Settings",
      args: [
        {
          id: "type",
          type: ["enable", "disable"],
          default: "disable",
        },
      ],
      channel: "guild",
    });
  }

  async exec(message, args) {
    if (message.author.id != message.guild.owner.id) {
      return message.reply("Only the Server Owner can use this command");
    } else {
      switch (args.type) {
        case "enable":
          this.client.settings.delete(message.guild.id, "disableError");
          return message.reply("Error notifications have enabled");
        case "disable":
          this.client.settings.set(message.guild.id, "disableError", true);
          return message.reply("Error notifications have disabled");
        default:
          this.client.settings.set(message.guild.id, "disableError", true);
          return message.reply("Error notifications have disabled");
      }
    }
  }
};
