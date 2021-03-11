const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

module.exports = class CommandErrorListener extends Listener {
  constructor() {
    super("commandError", {
      emitter: "commandHandler",
      event: "error",
    });
  }

  exec(error, message, command) {
    if (
      error.httpStatus == 403 &&
      !this.client.settings.get(message.guild.id, "disableError")
    ) {
      const embed = new MessageEmbed()
        .setColor("#47970E")
        .setTitle("Command Error")
        .setDescription(
          "A command has failed to run on your server due to missing permissions, see below for details"
        )
        .setFooter(
          "This message can be disabled by running !error disable in your server(s)"
        )
        .addField(
          "Command Details",
          `User: \`${message.author.username}\`, Command: \`${command.aliases[0]}\``
        )
        .addField(
          "Required Permissions",
          "`Read Messages`, `Send Messages`, `Manage Messages`, `Read Message History`, `Add Reactions`"
        );
      return message.guild.owner.send(embed);
    }
  }
};
