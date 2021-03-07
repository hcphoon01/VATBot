const { Command, PrefixSupplier } = require('discord-akairo');
const { Message, MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = class HelpCommand extends Command {
    constructor() {
        super('help', {
            aliases: ['help'],
            description: {
                content: 'Displays a list of available command, or detailed information for a specific command.',
                usage: '[command]'
            },
            category: 'General',
            clientPermissions: ['EMBED_LINKS'],
            ratelimit: 2,
            args: [
                {
                    id: 'command',
                    type: 'commandAlias'
                }
            ]
        });
    }

    async exec(message, { command }) {
        const prefix = this.client.settings.get(message.guild.id, "prefix", "!");
        if (!command) {
            const embed = new MessageEmbed()
                .setColor('#47970E')
                .addField('❯ Commands', stripIndents`A list of available commands.
                    For additional info on a command, type \`${prefix}help <command>\`
                `);

            for (const category of this.handler.categories.values()) {
                embed.addField(`❯ ${category.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`, `${category.filter((cmd) => cmd.aliases.length > 0).map((cmd) => `\`${cmd.aliases[0]}\``).join(' ')}`);
            }

            return message.channel.send(embed);
        }

        const embed = new MessageEmbed()
            .setColor('47970E')
            .setTitle(`\`${command.aliases[0]} ${command.description.usage ? command.description.usage : ''}\``)
            .addField('❯ Description', `${command.description.content ? command.description.content : ''} ${command.description.ownerOnly ? '\n**[Owner Only]**': ''}`);

        if (command.aliases.length > 1) embed.addField('❯ Aliases', `\`${command.aliases.join('` `')}\``, true);
        if (command.description.examples && command.description.examples.length) embed.addField('❯ Examples', `\`${prefix}${command.aliases[0]} ${command.description.examples.join(`\`\n\`${prefix}${command.aliases[0]} `)}\``, true);

        return message.channel.send(embed);
    }
};