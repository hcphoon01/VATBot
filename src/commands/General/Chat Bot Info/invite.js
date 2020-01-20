const { Command } = require('klasa');

const link = 'https://discordapp.com/oauth2/authorize?client_id=630862807897997341&scope=bot&permissions=335916112';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: language => language.get('COMMAND_INVITE_DESCRIPTION')
		});
	}

	async run(message) {
		return message.channel.send(message.language.get('COMMAND_INVITE', link));
	}

	// async init() {
	// 	if (this.client.application && !this.client.application.botPublic) this.permissionLevel = 10;
	// }

};
