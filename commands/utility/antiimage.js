const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antiimage',
    description: 'Active ou désactive la protection anti-image spam',
    aliases: ['anti-image', 'antiimagespam'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiImageHelp(message);
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
                await enableAntiImage(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiImage(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiImageStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiImage(message, serverConfig, guildId) {
    serverConfig[guildId].antiImageSpam = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        maxImages: 3,
        timeWindow: 10000,
        punishment: 'mute'
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
        .setTitle('🖼️ Anti-Image Spam Activé')
        .setDescription('La protection anti-image spam est maintenant **activée** !')
        .addFields(
            { name: '📊 Limite', value: '3 images en 10 secondes', inline: true },
            { name: '⚡ Action', value: 'Mute 5 minutes', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiImage(message, serverConfig, guildId) {
    serverConfig[guildId].antiImageSpam = {
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
        .setTitle('⚠️ Anti-Image Spam Désactivé')
        .setDescription('La protection anti-image spam est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Le spam d\'images est maintenant autorisé', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiImageStatus(message, serverConfig, guildId) {
    const antiImageConfig = serverConfig[guildId]?.antiImageSpam || { enabled: config.protection.antiImageSpam.enabled };
    
    const status = antiImageConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiImageConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🖼️ Statut Anti-Image Spam')
        .setDescription(`La protection anti-image spam est actuellement ${status}`)
        .addFields(
            { name: '📊 Limite de détection', value: `${antiImageConfig.maxImages || '3'} images/${antiImageConfig.timeWindow ? antiImageConfig.timeWindow/1000 : '10'}s`, inline: true },
            { name: '⚡ Action automatique', value: 'Mute 5 minutes', inline: true },
            { name: '🔍 Détection', value: 'Images, GIFs, stickers', inline: true }
        );

    if (antiImageConfig.enabledBy) {
        const activator = await client.users.fetch(antiImageConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiImageConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antiimage on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiImageHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🖼️ Anti-Image Spam - Aide')
        .setDescription('Gérez la protection contre le spam d\'images')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antiimage on` - Active la protection anti-image spam\n' +
                       '`&antiimage off` - Désactive la protection anti-image spam\n' +
                       '`&antiimage status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les envois massifs d\'images\n' +
                       '• Compte les images, GIFs et stickers\n' +
                       '• Mute automatiquement l\'utilisateur\n' +
                       '• Envoie des logs détaillés',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Limite: 3 images en 10 secondes\n' +
                       '• Action: Mute 5 minutes\n' +
                       '• Types: Images, GIFs, stickers\n' +
                       '• Logs: Dans 📢-spam-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Image Spam System' });

    await message.reply({ embeds: [embed] });
}
