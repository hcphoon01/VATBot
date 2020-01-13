const { Event } = require('klasa');

module.exports = class extends Event {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            enabled: true,
            name: 'activityUpdate',
            event: 'commandSuccess'
        });
    }

    async run(message, command, params, response) {
        this.client.updateActivity();
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
