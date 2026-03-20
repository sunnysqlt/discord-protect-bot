const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antizalgo',
    description: 'Active ou désactive la protection anti-zalgo',
    aliases: ['anti-zalgo'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiZalgoHelp(message);
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
                await enableAntiZalgo(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiZalgo(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiZalgoStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiZalgo(message, serverConfig, guildId) {
    serverConfig[guildId].antiZalgo = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        punishment: 'delete'
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
        .setTitle('🌀 Anti-Zalgo Activé')
        .setDescription('La protection anti-zalgo est maintenant **activée** !')
        .addFields(
            { name: '🎯 Cible', value: 'Textes avec caractères zalgo', inline: true },
            { name: '⚡ Action', value: 'Suppression automatique', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiZalgo(message, serverConfig, guildId) {
    serverConfig[guildId].antiZalgo = {
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
        .setTitle('⚠️ Anti-Zalgo Désactivé')
        .setDescription('La protection anti-zalgo est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Les textes zalgo sont maintenant autorisés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiZalgoStatus(message, serverConfig, guildId) {
    const antiZalgoConfig = serverConfig[guildId]?.antiZalgo || { enabled: config.protection.antiZalgo.enabled };
    
    const status = antiZalgoConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiZalgoConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🌀 Statut Anti-Zalgo')
        .setDescription(`La protection anti-zalgo est actuellement ${status}`)
        .addFields(
            { name: '🎯 Textes bloqués', value: 'Caractères diacritiques combinés', inline: true },
            { name: '⚡ Action automatique', value: 'Suppression du message', inline: true },
            { name: '🔍 Détection', value: 'Textes anormaux', inline: true }
        );

    if (antiZalgoConfig.enabledBy) {
        const activator = await client.users.fetch(antiZalgoConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiZalgoConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antizalgo on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiZalgoHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🌀 Anti-Zalgo - Aide')
        .setDescription('Gérez la protection contre les textes zalgo')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antizalgo on` - Active la protection anti-zalgo\n' +
                       '`&antizalgo off` - Désactive la protection anti-zalgo\n' +
                       '`&antizalgo status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les caractères diacritiques combinés\n' +
                       '• Supprime automatiquement les textes zalgo\n' +
                       '• Protège contre le spam visuel\n' +
                       '• Envoie des logs détaillés',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Zalgo System' });

    await message.reply({ embeds: [embed] });
}
