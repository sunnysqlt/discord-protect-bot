const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'owner',
    description: 'Affiche les informations sur le propriétaire du bot',
    async execute(message, args, client) {
        const ownerId = config.ownerId;
        const isOwner = message.author.id === ownerId;
        
        const embed = new EmbedBuilder()
            .setColor('#8B008B')
            .setTitle('Informations du Propriétaire')
            .setTimestamp()
            .setFooter({ text: 'Protection 24/7' });

        if (isOwner) {
            embed.addFields({
                name: 'Statistiques du Bot',
                value: `Serveurs: ${client.guilds.cache.size}\nUtilisateurs: ${client.users.cache.size}\nSalons: ${client.channels.cache.size}\nUptime: ${Math.floor(client.uptime / 1000 / 60)} minutes`,
                inline: false
            });
        }

        embed.addFields({
            name: 'Propriétaire',
            value: `<@${ownerId}> (ID: ${ownerId})`,
            inline: true
        });

        embed.addFields({
            name: 'Permissions',
            value: isOwner ? 'Propriétaire - Accès complet' : 'Utilisateur - Accès limité',
            inline: true
        });

        await message.reply({ embeds: [embed] });
    }
};
