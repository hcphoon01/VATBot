const { Command } = require('klasa');
const { MessageEmbed} = require('discord.js');

const id = '136184427318476800';

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            description: 'Display information for reporting bugs',
        });
    }

    async run(message, [...params]) {
        return message.channel.send(message.language.get('BUG_INFO'));
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
