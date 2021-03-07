const { Command } = require("discord-akairo");

class PrefixCommand extends Command {
  constructor() {
    super("prefix", {
      aliases: ["prefix"],
      description: {
        content: "Change the bot prefix",
        usage: "<prefix>",
        examples: [".", "?"],
      },
      category: "Settings",
      args: [
        {
          id: "prefix",
          default: "!",
        },
      ],
      channel: "guild",
      userPermissions: ["MANAGE_SERVER"],
    });
  }

  async exec(message, args) {

    const oldPrefix = this.client.settings.get(message.guild.id, "prefix", "!");

    await this.client.settings.set(message.guild.id, "prefix", args.prefix);
    return message.reply(
      `Prefix changed from \`${oldPrefix}\` to \`${args.prefix}\``
    );
  }
}

module.exports = PrefixCommand;
