const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antiemoji',
    description: 'Active ou désactive la protection anti-emoji spam',
    aliases: ['anti-emoji', 'antiemojispam'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiEmojiHelp(message);
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
                await enableAntiEmoji(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiEmoji(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiEmojiStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiEmoji(message, serverConfig, guildId) {
    serverConfig[guildId].antiEmojiSpam = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxEmojis: 10,
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
        .setTitle('😀 Anti-Emoji Spam Activé')
        .setDescription('La protection anti-emoji spam est maintenant **activée** !')
        .addFields(
            { name: '📊 Limite', value: '10 emojis par message', inline: true },
            { name: '⚡ Action', value: 'Suppression automatique', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiEmoji(message, serverConfig, guildId) {
    serverConfig[guildId].antiEmojiSpam = {
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
        .setTitle('⚠️ Anti-Emoji Spam Désactivé')
        .setDescription('La protection anti-emoji spam est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Le spam d\'emojis est maintenant autorisé', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiEmojiStatus(message, serverConfig, guildId) {
    const antiEmojiConfig = serverConfig[guildId]?.antiEmojiSpam || { enabled: config.protection.antiEmojiSpam.enabled };
    
    const status = antiEmojiConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiEmojiConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('😀 Statut Anti-Emoji Spam')
        .setDescription(`La protection anti-emoji spam est actuellement ${status}`)
        .addFields(
            { name: '📊 Limite de détection', value: `${antiEmojiConfig.maxEmojis || '10'} emojis/message`, inline: true },
            { name: '⚡ Action automatique', value: 'Suppression du message', inline: true },
            { name: '🔍 Détection', value: 'Messages avec trop d\'emojis', inline: true }
        );

    if (antiEmojiConfig.enabledBy) {
        const activator = await client.users.fetch(antiEmojiConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiEmojiConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antiemoji on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiEmojiHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('😀 Anti-Emoji Spam - Aide')
        .setDescription('Gérez la protection contre le spam d\'emojis')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antiemoji on` - Active la protection anti-emoji spam\n' +
                       '`&antiemoji off` - Désactive la protection anti-emoji spam\n' +
                       '`&antiemoji status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les messages avec trop d\'emojis\n' +
                       '• Supprime automatiquement les messages concernés\n' +
                       '• Limite par défaut : 10 emojis\n' +
                       '• Envoie des logs détaillés',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Emoji Spam System' });

    await message.reply({ embeds: [embed] });
}
