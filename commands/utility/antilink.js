const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'antilink',
    description: 'Active ou désactive la protection anti-link Discord',
    aliases: ['anti-link'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiLinkHelp(message);
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
                await enableAntiLink(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiLink(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiLinkStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiLink(message, serverConfig, guildId) {
    serverConfig[guildId].antiLink = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        allowedRoles: ['Admin', 'Modérateur'],
        punishment: 'delete',
        warningMessage: true
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
        .setTitle('🔗 Anti-Link Discord Activé')
        .setDescription('La protection anti-link Discord est maintenant **activée** !')
        .addFields(
            { name: '🎯 Cible', value: 'Liens Discord uniquement', inline: true },
            { name: '⚡ Action', value: 'Suppression + Avertissement', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .addFields(
            { name: '📋 Liens bloqués', value: 'discord.gg, discord.io, discord.me, discord.com, discord.app, discord.net', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🔗-link-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🔗 Configuration Modifiée')
            .setDescription('**Anti-Link Discord** a été activé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function disableAntiLink(message, serverConfig, guildId) {
    serverConfig[guildId].antiLink = {
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
        .setTitle('⚠️ Anti-Link Discord Désactivé')
        .setDescription('La protection anti-link Discord est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Les liens Discord sont maintenant autorisés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '🔗-link-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Configuration Modifiée')
            .setDescription('**Anti-Link Discord** a été désactivé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showAntiLinkStatus(message, serverConfig, guildId) {
    const antiLinkConfig = serverConfig[guildId]?.antiLink || { enabled: config.protection.antiLink.enabled };
    
    const status = antiLinkConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiLinkConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🔗 Statut Anti-Link Discord')
        .setDescription(`La protection anti-link Discord est actuellement ${status}`)
        .addFields(
            { name: '🎯 Type de liens bloqués', value: 'Liens Discord uniquement', inline: true },
            { name: '⚡ Action automatique', value: 'Suppression + Avertissement', inline: true },
            { name: '🔓 Exceptions', value: 'Admins et Modérateurs', inline: true }
        )
        .addFields(
            { name: '📋 Domaines bloqués', value: 'discord.gg, discord.io, discord.me, discord.com, discord.app, discord.net', inline: false }
        );

    if (antiLinkConfig.enabledBy) {
        const activator = await client.users.fetch(antiLinkConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiLinkConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    if (antiLinkConfig.disabledBy) {
        const disabler = await client.users.fetch(antiLinkConfig.disabledBy).catch(() => null);
        if (disabler) {
            embed.addFields({
                name: '👤 Désactivé par', 
                value: `${disabler.tag} (<t:${Math.floor(antiLinkConfig.disabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez !antilink on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiLinkHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🔗 Anti-Link Discord - Aide')
        .setDescription('Gérez la protection contre les liens Discord')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!antilink on` - Active la protection anti-link Discord\n' +
                       '`!antilink off` - Désactive la protection anti-link Discord\n' +
                       '`!antilink status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte seulement les liens Discord\n' +
                       '• Supprime automatiquement le message\n' +
                       '• Envoie un avertissement à l\'utilisateur\n' +
                       '• Ignore les admins et modérateurs',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Cible: Liens Discord uniquement\n' +
                       '• Action: Suppression + Avertissement\n' +
                       '• Exceptions: Admins et Modérateurs\n' +
                       '• Logs: Dans 🔗-link-logs',
                inline: false
            },
            {
                name: '📋 **Domaines bloqués**',
                value: '• discord.gg\n• discord.io\n• discord.me\n• discord.com\n• discord.app\n• discord.net',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Link Discord System' });

    await message.reply({ embeds: [embed] });
}
