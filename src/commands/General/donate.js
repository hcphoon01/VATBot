const { Command } = require("discord-akairo");

module.exports = class DonateCommand extends Command {
  constructor() {
    super("donate", {
      cooldown: 5,
      description: {
        content:
          "Show donation information for VATBot",
      },
      category: "General",
      aliases: ["donate"],
    });
  }
  exec(message) {
    return message.channel.send(
      "As VATBot is free to use, there is no source of income for maintaining the hardware and software required to run it.\nIf you would like to contribute to the development and upkeep of VATBot but do not know how to code you can help by donating.\nAny donations will go towards the development and maintance of VATBot and will be greatly appreciated\nThe link to donate is here: https://www.paypal.me/hcphoon01\n\nThank you to anyone who donates."
    );
  }
};
