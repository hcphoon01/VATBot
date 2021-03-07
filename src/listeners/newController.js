const { Listener } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

module.exports = class NewControllerListener extends Listener {
  constructor() {
    super("newController", {
      emitter: "process",
      event: "newController",
    });
  }

  async exec(data) {
    const embed = new MessageEmbed()
      .setColor("#47970E")
      .setTitle("New Controller Notification")
      .setDescription("See below for new controller activity\n")
      .setThumbnail(
        "https://cdn.discordapp.com/app-icons/630862807897997341/989f99692163a76a7b81f91f8b094f11.png"
      );

    data.forEach((controller) => {
      if (controller.callsign.includes("ATIS")) return;
      if (controller.facilitytype == 0) return;
      embed.addField(
        `Callsign: ${controller.callsign}`,
        `Frequency: \`${controller.frequency}\`, Position: \`${this.parsePosition(
          controller.facilitytype
        )}\``
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
