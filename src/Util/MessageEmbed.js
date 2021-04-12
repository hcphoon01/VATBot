const { MessageEmbed } = require("discord.js");
const moment = require("moment");

module.exports = embed = (title, message, client) => {
  return new MessageEmbed()
    .setTitle(title)
    .setFooter(`Requested by ${message.author.username}`)
    .setTimestamp(message.createdAt)
    .setColor("#47970E")
    .setThumbnail(
      client.user.displayAvatarURL({ format: 'webp', size: 128 })
    );
};
