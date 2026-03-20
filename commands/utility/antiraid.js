const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'antiraid',
    description: 'Active ou désactive la protection anti-raid',
    aliases: ['anti-raid'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiRaidHelp(message);
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
                await enableAntiRaid(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiRaid(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiRaidStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiRaid(message, serverConfig, guildId) {
    serverConfig[guildId].antiRaid = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxJoins: 5,
        timeWindow: 60000
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
        .setTitle('🛡️ Anti-Raid Activé')
        .setDescription('La protection anti-raid est maintenant **activée** !')
        .addFields(
            { name: '📊 Limite', value: '5 joins par minute', inline: true },
            { name: '⚡ Action', value: 'Lockdown + Bannissement', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🚨-raid-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🛡️ Configuration Modifiée')
            .setDescription('**Anti-Raid** a été activé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function disableAntiRaid(message, serverConfig, guildId) {
    serverConfig[guildId].antiRaid = {
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
        .setTitle('⚠️ Anti-Raid Désactivé')
        .setDescription('La protection anti-raid est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Votre serveur est maintenant vulnérable aux raids', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🚨-raid-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Configuration Modifiée')
            .setDescription('**Anti-Raid** a été désactivé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showAntiRaidStatus(message, serverConfig, guildId) {
    const antiRaidConfig = serverConfig[guildId]?.antiRaid || { enabled: config.protection.antiRaid.enabled };
    
    const status = antiRaidConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiRaidConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🛡️ Statut Anti-Raid')
        .setDescription(`La protection anti-raid est actuellement ${status}`)
        .addFields(
            { name: '📊 Limite de détection', value: antiRaidConfig.maxJoins || '5 joins/min', inline: true },
            { name: '⏱️ Fenêtre de temps', value: antiRaidConfig.timeWindow ? `${antiRaidConfig.timeWindow/1000}s` : '60s', inline: true },
            { name: '⚡ Action automatique', value: 'Lockdown + Bannissement', inline: true }
        );

    if (antiRaidConfig.enabledBy) {
        const activator = await client.users.fetch(antiRaidConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiRaidConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    if (antiRaidConfig.disabledBy) {
        const disabler = await client.users.fetch(antiRaidConfig.disabledBy).catch(() => null);
        if (disabler) {
            embed.addFields({
                name: '👤 Désactivé par', 
                value: `${disabler.tag} (<t:${Math.floor(antiRaidConfig.disabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez !antiraid on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiRaidHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🛡️ Anti-Raid - Aide')
        .setDescription('Gérez la protection contre les raids de votre serveur')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!antiraid on` - Active la protection anti-raid\n' +
                       '`!antiraid off` - Désactive la protection anti-raid\n' +
                       '`!antiraid status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les joins massifs (5+ en 1 minute)\n' +
                       '• Active automatiquement le lockdown\n' +
                       '• Bannit les utilisateurs suspects\n' +
                       '• Envoie des alertes aux administrateurs',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Limite: 5 joins par minute\n' +
                       '• Action: Lockdown immédiat\n' +
                       '• Punition: Bannissement automatique\n' +
                       '• Logs: Dans 🚨-raid-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Raid System' });

    await message.reply({ embeds: [embed] });
}
