const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Affiche la liste des commandes disponibles',
    aliases: [],
    permissions: [],
    cooldown: 3,
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor('#8B008B')
            .setTitle('Bot de Protection')
            .setDescription('Commandes disponibles pour protéger votre serveur')
            .setTimestamp()
            .setFooter({ text: 'Protection 24/7', iconURL: client.user.displayAvatarURL() });

        embed.addFields(
            {
                name: 'Protection du Serveur',
                value: '`&lockdown` - Active le mode lockdown\n`&unlockdown` - Désactive le mode lockdown\n`&status` - Affiche l\'état des protections\n`&owner` - Informations sur le propriétaire',
                inline: false
            },
            {
                name: 'Gestion des Logs',
                value: '`&logs create` - Crée les salons de logs\n`&logs delete` - Supprime tous les logs\n`&logs setup` - Configure automatiquement les logs',
                inline: false
            },
            {
                name: 'Rôles d\'Alerte',
                value: '`&banall add <raid|banall|nuke> @role` - Ajoute un rôle d\'alerte\n`&banall remove <type>` - Supprime un rôle d\'alerte\n`&banall list` - Affiche les rôles configurés',
                inline: false
            },
            {
                name: 'Configuration des Protections',
                value: '`&antiraid on/off/status` - Gère l\'anti-raid\n`&antibanall on/off/status` - Gère l\'anti-banall\n`&antinuke on/off/status` - Gère l\'anti-nuke\n`&antispam on/off/status` - Gère l\'anti-spam\n`&antilink on/off/status` - Gère l\'anti-link Discord',
                inline: false
            },
            {
                name: 'Protections Avancées',
                value: '`&antieveryone on/off/status` - Gère les mentions everyone/here\n`&antizalgo on/off/status` - Gère les textes zalgo\n`&antiemoji on/off/status` - Gère le spam d\'emojis\n`&antighostping on/off/status` - Gère les ghost pings\n`&antiimage on/off/status` - Gère le spam d\'images\n`&antinewaccount on/off/status` - Gère les nouveaux comptes\n`&antiselfbot on/off/status` - Gère les selfbots',
                inline: false
            }
        );

        embed.addFields(
            {
                name: 'Systèmes de Protection Actifs',
                value: 'Anti-Raid, Anti-Spam, Anti-Discord Links, Anti-Nuke, Anti-Banall, Anti-Role Spam, Anti-Mass Mention, Anti-Caps, Anti-Bad Words, Anti-Everyone, Anti-Zalgo, Anti-Emoji Spam, Anti-Ghost Ping, Anti-Image Spam, Anti-New Account, Anti-Selfbot',
                inline: false
            }
        );

        embed.addFields(
            {
                name: 'Utilisation',
                value: 'Utilisez `&logs create` pour créer les salons nécessaires. Le bot se configure automatiquement au démarrage.',
                inline: false
            }
        );

        await message.reply({ embeds: [embed] });
    }
};
