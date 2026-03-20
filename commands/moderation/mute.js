const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'mute',
    description: 'Rendre muet un utilisateur',
    aliases: ['silence'],
    permissions: [PermissionsBitField.Flags.ModerateMembers],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.reply('❌ Vous n\'avez pas la permission de rendre muet des membres !');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('❌ Veuillez mentionner un utilisateur à rendre muet !');
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            return message.reply('❌ Cet utilisateur n\'est pas sur le serveur !');
        }

        if (!member.moderatable) {
            return message.reply('❌ Je ne peux pas rendre muet cet utilisateur !');
        }

        const duration = args[1];
        if (!duration) {
            return message.reply('❌ Veuillez spécifier une durée (ex: 10m, 1h, 1d) !');
        }

        const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

        // Convertir la durée en millisecondes
        let ms = 0;
        const timeMatch = duration.match(/^(\d+)([smhd])$/);
        if (!timeMatch) {
            return message.reply('❌ Format de durée invalide ! Utilisez: nombre + s/m/h/d (ex: 10m)');
        }

        const [, amount, unit] = timeMatch;
        switch (unit) {
            case 's': ms = amount * 1000; break;
            case 'm': ms = amount * 60 * 1000; break;
            case 'h': ms = amount * 60 * 60 * 1000; break;
            case 'd': ms = amount * 24 * 60 * 60 * 1000; break;
        }

        try {
            await member.timeout(ms, reason);
            
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('🔇 Utilisateur Rendu Muet')
                .addFields(
                    { name: 'Utilisateur', value: `${user.tag} (${user.id})`, inline: true },
                    { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
                    { name: 'Durée', value: duration, inline: true },
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
            message.reply('❌ Une erreur est survenue lors du mute !');
        }
    }
};
