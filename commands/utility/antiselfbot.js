const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antiselfbot',
    description: 'Active ou désactive la protection anti-selfbot',
    aliases: ['anti-selfbot', 'antiself'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiSelfBotHelp(message);
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
                await enableAntiSelfBot(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiSelfBot(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiSelfBotStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiSelfBot(message, serverConfig, guildId) {
    serverConfig[guildId].antiSelfBot = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        detectWebhooks: true,
        detectSuspicious: true,
        punishment: 'ban'
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
        .setTitle('🤖 Anti-Selfbot Activé')
        .setDescription('La protection anti-selfbot est maintenant **activée** !')
        .addFields(
            { name: '🎯 Cibles', value: 'Selfbots et webhooks suspects', inline: true },
            { name: '⚡ Action', value: 'Bannissement immédiat', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiSelfBot(message, serverConfig, guildId) {
    serverConfig[guildId].antiSelfBot = {
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
        .setTitle('⚠️ Anti-Selfbot Désactivé')
        .setDescription('La protection anti-selfbot est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Les selfbots ne seront plus détectés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiSelfBotStatus(message, serverConfig, guildId) {
    const antiSelfBotConfig = serverConfig[guildId]?.antiSelfBot || { enabled: config.protection.antiSelfBot.enabled };
    
    const status = antiSelfBotConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiSelfBotConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🤖 Statut Anti-Selfbot')
        .setDescription(`La protection anti-selfbot est actuellement ${status}`)
        .addFields(
            { name: '🎯 Détection', value: 'Selfbots et webhooks', inline: true },
            { name: '⚡ Action automatique', value: 'Bannissement immédiat', inline: true },
            { name: '🔍 Analyse', value: 'Comportements suspects', inline: true }
        );

    if (antiSelfBotConfig.enabledBy) {
        const activator = await client.users.fetch(antiSelfBotConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiSelfBotConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antiselfbot on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiSelfBotHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🤖 Anti-Selfbot - Aide')
        .setDescription('Gérez la protection contre les selfbots')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antiselfbot on` - Active la protection anti-selfbot\n' +
                       '`&antiselfbot off` - Désactive la protection anti-selfbot\n' +
                       '`&antiselfbot status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🤖 **Qu\'est-ce qu\'un selfbot ?**',
                value: '• Compte utilisateur avec un bot\n' +
                       '• Contre les termes de service Discord\n' +
                       '• Peut causer du spam et des raids\n' +
                       '• Difficile à détecter normalement',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Analyse les comportements suspects\n' +
                       '• Détecte les webhooks non autorisés\n' +
                       '• Surveille les activités anormales\n' +
                       '• Bannit automatiquement les menaces',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Détection: Selfbots et webhooks\n' +
                       '• Action: Bannissement immédiat\n' +
                       '• Analyse: Comportements suspects\n' +
                       '• Logs: Dans tous les salons de logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Selfbot System' });

    await message.reply({ embeds: [embed] });
}
