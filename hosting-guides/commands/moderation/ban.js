const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Bannir un utilisateur du serveur',
    aliases: ['b'],
    permissions: [PermissionsBitField.Flags.BanMembers],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de bannir des membres !');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à bannir !');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas sur le serveur !');
        }

        if (!member.bannable) {
            return message.reply('❌ Je ne peux pas bannir cet utilisateur !');
        }

        const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

        try {
            await member.ban({ reason });
            
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔨 Utilisateur Banni')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
                    { name: 'Raison', value: reason, inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            message.reply({ embeds: [embed] });

            // Log
            const logChannel = message.guild.channels.cache.find(ch => ch.name === 'logs');
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(error);
            message.reply('❌ Une erreur est survenue lors du bannissement !');
        }
    }
};
