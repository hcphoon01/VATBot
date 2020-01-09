const { Command } = require('klasa');

module.exports = class extends Command {

    constructor(...args) {
        /**
         * Any default options can be omitted completely.
         * if all options are default, you can omit the constructor completely
         */
        super(...args, {
            name: "Notification",
            cooldown: 10,
            requiredPermissions: 'ADMINISTRATOR',
            subcommands: true,
            description: 'Toggle the notifications for when controllers connect to VATSIM.',
            usage: '<enable|disable> (Channel:channel)',
            usageDelim: ' '
        });
    }

    async enable(message, [channel]) {
        await message.guild.settings.update('notification', channel, message.guild);
        console.log('updated');
        console.log(await this.client.providers.get('sqlite').getALL('guilds'));
    }

    async disable(message) {

    }

    async run(message, [...params]) {
        // This is where you place the code you want to run for your command
        ;
    }

    async init() {
        /*
         * You can optionally define this method which will be run when the bot starts
         * (after login, so discord data is available via this.client)
         */
    }

};
