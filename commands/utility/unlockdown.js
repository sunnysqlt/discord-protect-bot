const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unlockdown',
    description: 'Désactive le mode lockdown du serveur',
    aliases: ['uld'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        try {
            const lockdownRole = message.guild.roles.cache.find(r => r.name === '🔒 LOCKDOWN');
            
            if (!lockdownRole) {
                return message.reply('❌ Aucun lockdown n\'est actuellement actif !');
            }

            // Retirer le rôle de tous les membres
            let membersUnmuted = 0;
            message.guild.members.cache.forEach(async member => {
                if (member.roles.cache.has(lockdownRole.id)) {
                    await member.roles.remove(lockdownRole);
                    membersUnmuted++;
                }
            });

            // Supprimer le rôle
            await lockdownRole.delete('Lockdown désactivé');

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ LOCKDOWN DÉSACTIVÉ')
                .setDescription('Le serveur n\'est plus en mode lockdown !')
                .addFields(
                    { name: '👥 Membres réactivés', value: `${membersUnmuted}`, inline: true },
                    { name: '👤 Désactivé par', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Le serveur est de nouveau sécurisé' });

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors du unlockdown:', error);
            message.reply('❌ Une erreur est survenue lors de la désactivation du lockdown !');
        }
    }
};
