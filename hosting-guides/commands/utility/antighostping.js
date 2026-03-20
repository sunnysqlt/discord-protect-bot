const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antighostping',
    description: 'Active ou désactive la détection de ghost pings',
    aliases: ['anti-ghostping', 'antighost'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiGhostPingHelp(message);
        }

        const guildId = message.guild.id;
        
        // Charger la configuration du serveur
        let serverConfig = {};
        try {
            if (fs.existsSync('./serverConfig.json')) {
                serverConfig = JSON.parse(fs.readFileSync('./serverConfig.json', 'utf8'));
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
        }

        if (!serverConfig[guildId]) {
            serverConfig[guildId] = {};
        }

        switch (action) {
            case 'on':
                await enableAntiGhostPing(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiGhostPing(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiGhostPingStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiGhostPing(message, serverConfig, guildId) {
    serverConfig[guildId].antiGhostPing = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        logGhostPings: true,
        punishment: 'warn'
    };

    // Sauvegarder la configuration
    try {
        fs.writeFileSync('./serverConfig.json', JSON.stringify(serverConfig, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return message.reply('❌ Une erreur est survenue lors de la sauvegarde de la configuration !');
    }

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('👻 Anti-Ghost Ping Activé')
        .setDescription('La détection de ghost pings est maintenant **activée** !')
        .addFields(
            { name: '🎯 Cible', value: 'Mentions supprimées rapidement', inline: true },
            { name: '⚡ Action', value: 'Logs + Avertissement', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiGhostPing(message, serverConfig, guildId) {
    serverConfig[guildId].antiGhostPing = {
        enabled: false,
        disabledBy: message.author.id,
        disabledAt: Date.now()
    };

    // Sauvegarder la configuration
    try {
        fs.writeFileSync('./serverConfig.json', JSON.stringify(serverConfig, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        return message.reply('❌ Une erreur est survenue lors de la sauvegarde de la configuration !');
    }

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('⚠️ Anti-Ghost Ping Désactivé')
        .setDescription('La détection de ghost pings est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Les ghost pings ne seront plus détectés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiGhostPingStatus(message, serverConfig, guildId) {
    const antiGhostPingConfig = serverConfig[guildId]?.antiGhostPing || { enabled: config.protection.antiGhostPing.enabled };
    
    const status = antiGhostPingConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiGhostPingConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('👻 Statut Anti-Ghost Ping')
        .setDescription(`La détection de ghost pings est actuellement ${status}`)
        .addFields(
            { name: '🎯 Détection', value: 'Mentions supprimées rapidement', inline: true },
            { name: '⚡ Action automatique', value: 'Logs + Avertissement', inline: true },
            { name: '📝 Logs', value: 'Activés', inline: true }
        );

    if (antiGhostPingConfig.enabledBy) {
        const activator = await client.users.fetch(antiGhostPingConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiGhostPingConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antighostping on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiGhostPingHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('👻 Anti-Ghost Ping - Aide')
        .setDescription('Gérez la détection de ghost pings')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antighostping on` - Active la détection de ghost pings\n' +
                       '`&antighostping off` - Désactive la détection de ghost pings\n' +
                       '`&antighostping status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '👻 **Qu\'est-ce qu\'un ghost ping ?**',
                value: '• Mentionner quelqu\'un\n' +
                       '• Supprimer le message immédiatement\n' +
                       '• La personne reçoit une notification inutile\n' +
                       '• Souvent utilisé pour harceler',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les mentions dans les messages supprimés\n' +
                       '• Enregistre qui a mentionné qui\n' +
                       '• Envoie des logs détaillés\n' +
                       '• Peut avertir l\'auteur',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Ghost Ping System' });

    await message.reply({ embeds: [embed] });
}
