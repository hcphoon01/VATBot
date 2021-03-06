const { Command } = require("discord-akairo");
const MessageEmbed = require('../../Util/MessageEmbed');
const moment = require("moment");
const os = require('os');

module.exports = class StatCommand extends Command {
  constructor() {
    super("stats", {
      cooldown: 5,
      description: {
        content: "Display stats for VATBot",
      },
      category: "General",
      aliases: ["stats", "stat"],
    });
  }
  exec(message) {
    const now = moment(new Date);
    const start = Date.now() - (process.uptime() * 1000);
    return message.channel.send(
      MessageEmbed(`${this.client.user.username} Stats`, message, this.client)
        .addField(
          "Discord",
          [
            `**Servers**: ${this.client.guilds.cache.size}`,
            `**Channels**: ${this.client.channels.cache.size}`,
            `**Users**: ${this.client.users.cache.size}`
          ],
          true
        )
        .addField(
          "System",
          [
            `**Uptime**: ${moment.duration(now.diff(start)).humanize()}`,
            `**Memory**: ${(
              process.memoryUsage().heapUsed /
              1024 /
              1024
            ).toFixed(2)} MB`,
            `**NodeJS**: ${process.version}`,
            `**OS**: ${os.type()} ${os.arch()}`,
          ],
          true
        )
    );
  }
};
