const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            description: 'Some useful links and instructions for getting started on VATSIM',
        });
    }

    async run(message, [...params]) {
        return message.channel.send(message.language.get('VATSIM_HELP'));
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
