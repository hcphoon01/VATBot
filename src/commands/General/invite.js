const { Command } = require("discord-akairo");

const link =
  "https://discordapp.com/oauth2/authorize?client_id=630862807897997341&scope=bot&permissions=76864";

module.exports = class InviteCommand extends Command {
  constructor() {
    super("invite", {
      cooldown: 5,
      description: {
        content:
          "Displays the invite link of the bot, to invite it to your guild.",
      },
      category: "General",
      aliases: ["invite"],
    });
  }

  exec(message) {
    return message.channel.send(
      `To add ${this.client.user.username} to your discord guild: <${link}>
      \`\`\`The above link is generated requesting the minimum permissions required to use every command currently.\nI know not all permissions are right for every guild, so don't be afraid to uncheck any of the boxes.\nIf you try to use a command that requires more permissions than the bot is granted, it will let you know.\`\`\`\nIf you require any support with VATBot or want to suggest features you can join the official VATBot Discord Server here: https://discord.gg/Htzybqa
      `
    );
  }
};
