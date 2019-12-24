const { Argument } = require("klasa");
const regex = /[A-Z]{4}/i;

module.exports = class extends Argument {
  run(arg, possible, message) {
    const result = regex.exec(arg);
    if (result) return arg.toUpperCase();
    throw message.language.get('INVALID_ICAO_CODE', arg)
  }
};
