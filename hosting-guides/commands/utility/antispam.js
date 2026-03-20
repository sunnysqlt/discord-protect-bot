const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'antispam',
    description: 'Active ou désactive la protection anti-spam',
    aliases: ['anti-spam'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiSpamHelp(message);
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
                await enableAntiSpam(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiSpam(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiSpamStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiSpam(message, serverConfig, guildId) {
    serverConfig[guildId].antiSpam = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxMessages: 5,
        timeWindow: 5000,
        punishment: 'mute',
        muteDuration: 300000
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
        .setTitle('📢 Anti-Spam Activé')
        .setDescription('La protection anti-spam est maintenant **activée** !')
        .addFields(
            { name: '📊 Limite', value: '5 messages en 5 secondes', inline: true },
            { name: '⚡ Action', value: 'Mute 5 minutes + Suppression', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '📢-spam-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('📢 Configuration Modifiée')
            .setDescription('**Anti-Spam** a été activé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function disableAntiSpam(message, serverConfig, guildId) {
    serverConfig[guildId].antiSpam = {
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
        .setTitle('⚠️ Anti-Spam Désactivé')
        .setDescription('La protection anti-spam est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Votre serveur est maintenant vulnérable au spam', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '📢-spam-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Configuration Modifiée')
            .setDescription('**Anti-Spam** a été désactivé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showAntiSpamStatus(message, serverConfig, guildId) {
    const antiSpamConfig = serverConfig[guildId]?.antiSpam || { enabled: config.protection.antiSpam.enabled };
    
    const status = antiSpamConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiSpamConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('📢 Statut Anti-Spam')
        .setDescription(`La protection anti-spam est actuellement ${status}`)
        .addFields(
            { name: '📊 Limite de détection', value: `${antiSpamConfig.maxMessages || '5'} msgs/${antiSpamConfig.timeWindow ? antiSpamConfig.timeWindow/1000 : '5'}s`, inline: true },
            { name: '⚡ Action automatique', value: antiSpamConfig.punishment || 'Mute 5min', inline: true },
            { name: '🗑️ Suppression', value: 'Messages supprimés', inline: true }
        );

    if (antiSpamConfig.enabledBy) {
        const activator = await client.users.fetch(antiSpamConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiSpamConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    if (antiSpamConfig.disabledBy) {
        const disabler = await client.users.fetch(antiSpamConfig.disabledBy).catch(() => null);
        if (disabler) {
            embed.addFields({
                name: '👤 Désactivé par', 
                value: `${disabler.tag} (<t:${Math.floor(antiSpamConfig.disabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez !antispam on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiSpamHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📢 Anti-Spam - Aide')
        .setDescription('Gérez la protection contre le spam de messages')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!antispam on` - Active la protection anti-spam\n' +
                       '`!antispam off` - Désactive la protection anti-spam\n' +
                       '`!antispam status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les messages répétés (5+ en 5s)\n' +
                       '• Supprime automatiquement les messages\n' +
                       '• Mute l\'utilisateur pendant 5 minutes\n' +
                       '• Envoie des logs détaillés',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Limite: 5 messages en 5 secondes\n' +
                       '• Action: Mute 5 minutes\n' +
                       '• Suppression: Messages concernés\n' +
                       '• Logs: Dans 📢-spam-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Spam System' });

    await message.reply({ embeds: [embed] });
}
