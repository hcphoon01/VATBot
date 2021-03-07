const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
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
    console.log(this.client.users.cache.get(this.client.ownerID).avatarURL);
    return message.channel.send(
      new MessageEmbed()
        .setTitle(`${this.client.user.username} Stats`)
        .setThumbnail(this.client.user.displayAvatarURL({ format: 'webp', size: 128 }))
        .setAuthor(this.client.users.cache.get(this.client.ownerID).username)
        .setColor("#47970E")
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
