const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'antibanall',
    description: 'Active ou désactive la protection anti-banall',
    aliases: ['anti-banall'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiBanallHelp(message);
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
                await enableAntiBanall(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiBanall(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiBanallStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiBanall(message, serverConfig, guildId) {
    serverConfig[guildId].antiBanall = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxBans: 3,
        timeWindow: 30000
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
        .setTitle('🔨 Anti-Banall Activé')
        .setDescription('La protection anti-banall est maintenant **activée** !')
        .addFields(
            { name: '📊 Limite', value: '3 bans en 30 secondes', inline: true },
            { name: '⚡ Action', value: 'Bannissement immédiat', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🔨-ban-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔨 Configuration Modifiée')
            .setDescription('**Anti-Banall** a été activé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function disableAntiBanall(message, serverConfig, guildId) {
    serverConfig[guildId].antiBanall = {
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
        .setTitle('⚠️ Anti-Banall Désactivé')
        .setDescription('La protection anti-banall est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Votre serveur est maintenant vulnérable aux banalls', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🔨-ban-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Configuration Modifiée')
            .setDescription('**Anti-Banall** a été désactivé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showAntiBanallStatus(message, serverConfig, guildId) {
    const antiBanallConfig = serverConfig[guildId]?.antiBanall || { enabled: config.protection.antiBan.enabled };
    
    const status = antiBanallConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiBanallConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🔨 Statut Anti-Banall')
        .setDescription(`La protection anti-banall est actuellement ${status}`)
        .addFields(
            { name: '📊 Limite de détection', value: antiBanallConfig.maxBans || '3 bans/30s', inline: true },
            { name: '⏱️ Fenêtre de temps', value: antiBanallConfig.timeWindow ? `${antiBanallConfig.timeWindow/1000}s` : '30s', inline: true },
            { name: '⚡ Action automatique', value: 'Bannissement + Lockdown', inline: true }
        );

    if (antiBanallConfig.enabledBy) {
        const activator = await client.users.fetch(antiBanallConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiBanallConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    if (antiBanallConfig.disabledBy) {
        const disabler = await client.users.fetch(antiBanallConfig.disabledBy).catch(() => null);
        if (disabler) {
            embed.addFields({
                name: '👤 Désactivé par', 
                value: `${disabler.tag} (<t:${Math.floor(antiBanallConfig.disabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez !antibanall on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiBanallHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔨 Anti-Banall - Aide')
        .setDescription('Gérez la protection contre les bannissements massifs')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!antibanall on` - Active la protection anti-banall\n' +
                       '`!antibanall off` - Désactive la protection anti-banall\n' +
                       '`!antibanall status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les bannissements massifs (3+ en 30s)\n' +
                       '• Bannit automatiquement l\'auteur\n' +
                       '• Active le lockdown du serveur\n' +
                       '• Envoie des alertes avec pings',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Limite: 3 bans en 30 secondes\n' +
                       '• Action: Bannissement immédiat\n' +
                       '• Protection: Lockdown automatique\n' +
                       '• Logs: Dans 🔨-ban-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Banall System' });

    await message.reply({ embeds: [embed] });
}
