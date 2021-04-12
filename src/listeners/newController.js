const { Listener } = require("discord-akairo");
const MessageEmbed = require("../Util/MessageEmbed");

module.exports = class NewControllerListener extends Listener {
  constructor() {
    super("newController", {
      emitter: "process",
      event: "newController",
    });
  }

  async exec(data) {
    const embed = MessageEmbed()
      .setColor("#47970E")
      .setTitle("New Controller Notification")
      .setDescription("See below for new controller activity\n")
      .setThumbnail(
        client.user.displayAvatarURL({ format: "webp", size: 128 })
      );

    data.forEach((controller) => {
      if (controller.callsign.includes("ATIS")) return;
      if (controller.facility == 0) return;
      embed.addField(
        `Callsign: ${controller.callsign}`,
        `Frequency: \`${
          controller.frequency
        }\`, Position: \`${this.parsePosition(controller.facility)}\``
      );
    });
    if (embed.fields.length > 0) {
      await this.sendMessage(embed);
    }
  }

  async sendMessage(embed) {
    const guildList = await this.client.settings.items;
    guildList.map((guild) => {
      try {
        this.client.channels.cache.get(guild.notifyChannel).send(embed);
      } catch (e) {
        //
      }
    });
  }

  parsePosition(position) {
    const pos = position.toString();
    switch (pos) {
      case "2":
        return "Delivery";
      case "3":
        return "Ground";
      case "4":
        return "Tower";
      case "5":
        return "Approach";
      case "6":
        return "Center";
      default:
        return "Not yet known";
    }
  }
};
