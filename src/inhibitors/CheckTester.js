const { Inhibitor } = require("klasa");
require("dotenv").config();

module.exports = class extends Inhibitor {
  constructor(...args) {
    /**
     * Any default options can be omitted completely.
     * if all options are default, you can omit the constructor completely
     */
    super(...args, {
      enabled: true,
      spamProtection: false
    });
  }

  async run(message, command) {
    if (process.env.APP_ENV != "beta") return;
    if (!message.member.roles.find(r => r.name === "Tester")) {
      throw message.send("You are not a Tester");
    }
  }
};
