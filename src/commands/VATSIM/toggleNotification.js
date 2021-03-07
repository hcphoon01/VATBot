const { Command } = require("discord-akairo");

module.exports = class ToggleNotificationCommand extends Command {
  constructor() {
    super("togglenotification", {
      aliases: [
        "togglenotification",
        "toggle-notification",
        "notification",
        "notify",
      ],
      description: {
        content:
          "Toggle the notifications for when controllers connect to VATSIM.",
        usage: "<enable|disable> [channel]",
        examples: ["enable #general", "disable"],
      },
      category: "VATSIM",
      channel: "guild",
      userPermissions: ["MANAGE_SERVER"],
    });
  }

  *args() {
    const type = yield { type: ["enable", "disable"] };

    if (type == "enable") {
      const channel = yield {
        type: "channel",
        prompt: {
          start: 'Please mention a valid channel',
          retry: 'You have not mentioned a valid channel'
        },
      };

      return { type, channel };
    } else {
      return { type };
    }
  }

  async exec(message, args) {
    if (args.type == "enable") {
      await this.client.settings.set(
        message.guild.id,
        "notifyChannel",
        args.channel.id
      );
      return message.reply(`Notifications enabled in ${args.channel}`);
    } else {
      await this.client.settings.delete(message.guild.id, "notifyChannel");
      return message.reply("Notifications disabled");
    }
  }
};
