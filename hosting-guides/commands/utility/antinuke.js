const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

module.exports = {
    name: 'antinuke',
    description: 'Active ou désactive la protection anti-nuke',
    aliases: ['anti-nuke'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiNukeHelp(message);
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
                await enableAntiNuke(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiNuke(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiNukeStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiNuke(message, serverConfig, guildId) {
    serverConfig[guildId].antiNuke = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxChannelDeletions: 3,
        maxRoleDeletions: 5,
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
        .setTitle('💥 Anti-Nuke Activé')
        .setDescription('La protection anti-nuke est maintenant **activée** !')
        .addFields(
            { name: '📊 Limites', value: '3 salons/5 rôles en 30s', inline: true },
            { name: '⚡ Action', value: 'Bannissement + Lockdown', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '💥-nuke-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('💥 Configuration Modifiée')
            .setDescription('**Anti-Nuke** a été activé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function disableAntiNuke(message, serverConfig, guildId) {
    serverConfig[guildId].antiNuke = {
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
        .setTitle('⚠️ Anti-Nuke Désactivé')
        .setDescription('La protection anti-nuke est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Votre serveur est maintenant vulnérable aux nukes', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });

    // Envoyer dans les logs si configurés
    const logChannel = message.guild.channels.cache.find(ch => ch.name === '💥-nuke-logs');
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Configuration Modifiée')
            .setDescription('**Anti-Nuke** a été désactivé')
            .addFields(
                { name: '👤 Par', value: message.author.tag },
                { name: '⏰ À', value: new Date().toLocaleString('fr-FR') }
            )
            .setTimestamp();
        await logChannel.send({ embeds: [logEmbed] });
    }
}

async function showAntiNukeStatus(message, serverConfig, guildId) {
    const antiNukeConfig = serverConfig[guildId]?.antiNuke || { enabled: config.protection.antiNuke.enabled };
    
    const status = antiNukeConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiNukeConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('💥 Statut Anti-Nuke')
        .setDescription(`La protection anti-nuke est actuellement ${status}`)
        .addFields(
            { name: '📊 Limites de détection', value: `${antiNukeConfig.maxChannelDeletions || '3'} salons/${antiNukeConfig.maxRoleDeletions || '5'} rôles en 30s`, inline: true },
            { name: '⏱️ Fenêtre de temps', value: antiNukeConfig.timeWindow ? `${antiNukeConfig.timeWindow/1000}s` : '30s', inline: true },
            { name: '⚡ Action automatique', value: 'Bannissement + Lockdown', inline: true }
        );

    if (antiNukeConfig.enabledBy) {
        const activator = await client.users.fetch(antiNukeConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiNukeConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    if (antiNukeConfig.disabledBy) {
        const disabler = await client.users.fetch(antiNukeConfig.disabledBy).catch(() => null);
        if (disabler) {
            embed.addFields({
                name: '👤 Désactivé par', 
                value: `${disabler.tag} (<t:${Math.floor(antiNukeConfig.disabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez !antinuke on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiNukeHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('💥 Anti-Nuke - Aide')
        .setDescription('Gérez la protection contre les tentatives de nuke')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!antinuke on` - Active la protection anti-nuke\n' +
                       '`!antinuke off` - Désactive la protection anti-nuke\n' +
                       '`!antinuke status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les suppressions massives de salons\n' +
                       '• Détecte les suppressions massives de rôles\n' +
                       '• Bannit automatiquement l\'auteur\n' +
                       '• Active le lockdown immédiat',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Limites: 3 salons/5 rôles en 30s\n' +
                       '• Action: Bannissement immédiat\n' +
                       '• Protection: Lockdown automatique\n' +
                       '• Logs: Dans 💥-nuke-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Nuke System' });

    await message.reply({ embeds: [embed] });
}
