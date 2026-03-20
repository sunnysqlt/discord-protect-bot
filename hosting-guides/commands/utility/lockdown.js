const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'lockdown',
    description: 'Active le mode lockdown du serveur',
    aliases: ['ld'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        try {
            // Créer ou mettre à jour le rôle de lockdown
            let lockdownRole = message.guild.roles.cache.find(r => r.name === '🔒 LOCKDOWN');
            if (!lockdownRole) {
                lockdownRole = await message.guild.roles.create({
                    name: '🔒 LOCKDOWN',
                    color: '#FF0000',
                    permissions: [],
                    reason: 'Lockdown role créé'
                });
            }

            // Positionner le rôle en haut
            await lockdownRole.setPosition(message.guild.roles.cache.size - 1);

            // Appliquer les restrictions à tous les salons
            let channelsUpdated = 0;
            message.guild.channels.cache.forEach(async channel => {
                if (channel.isTextBased()) {
                    await channel.permissionOverwrites.edit(lockdownRole, {
                        SendMessages: false,
                        AddReactions: false,
                        Speak: false,
                        Connect: false
                    });
                    channelsUpdated++;
                }
            });

            // Donner le rôle à tous les membres (sauf admins)
            let membersMuted = 0;
            message.guild.members.cache.forEach(async member => {
                if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && 
                    !member.roles.cache.has(lockdownRole.id)) {
                    await member.roles.add(lockdownRole);
                    membersMuted++;
                }
            });

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚨 LOCKDOWN ACTIVÉ 🚨')
                .setDescription('Le serveur est maintenant en mode lockdown !')
                .addFields(
                    { name: '🔒 Salons protégés', value: `${channelsUpdated}`, inline: true },
                    { name: '👥 Membres restreints', value: `${membersMuted}`, inline: true },
                    { name: '👤 Activé par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Utilisez !unlockdown pour désactiver' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors du lockdown:', error);
            message.reply('❌ Une erreur est survenue lors de l\'activation du lockdown !');
        }
    }
};
