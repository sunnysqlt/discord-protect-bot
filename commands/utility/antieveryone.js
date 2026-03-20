const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antieveryone',
    description: 'Active ou désactive la protection anti-everyone/here',
    aliases: ['anti-everyone', 'antihere'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiEveryoneHelp(message);
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
                await enableAntiEveryone(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiEveryone(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiEveryoneStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiEveryone(message, serverConfig, guildId) {
    serverConfig[guildId].antiEveryone = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        allowedRoles: ['Admin', 'Modérateur'],
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
        .setTitle('📢 Anti-Everyone Activé')
        .setDescription('La protection anti-everyone/here est maintenant **activée** !')
        .addFields(
            { name: '🎯 Cible', value: '@everyone et @here', inline: true },
            { name: '⚡ Action', value: 'Suppression automatique', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiEveryone(message, serverConfig, guildId) {
    serverConfig[guildId].antiEveryone = {
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
        .setTitle('⚠️ Anti-Everyone Désactivé')
        .setDescription('La protection anti-everyone/here est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: '@everyone et @here sont maintenant autorisés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiEveryoneStatus(message, serverConfig, guildId) {
    const antiEveryoneConfig = serverConfig[guildId]?.antiEveryone || { enabled: config.protection.antiEveryone.enabled };
    
    const status = antiEveryoneConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiEveryoneConfig.enabled ? '#00FF00' : '#FF0000';

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('📢 Statut Anti-Everyone')
        .setDescription(`La protection anti-everyone/here est actuellement ${status}`)
        .addFields(
            { name: '🎯 Mentions bloquées', value: '@everyone, @here', inline: true },
            { name: '⚡ Action automatique', value: 'Suppression du message', inline: true },
            { name: '🔓 Exceptions', value: 'Admins et Modérateurs', inline: true }
        );

    if (antiEveryoneConfig.enabledBy) {
        const activator = await client.users.fetch(antiEveryoneConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiEveryoneConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antiraid on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiEveryoneHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📢 Anti-Everyone - Aide')
        .setDescription('Gérez la protection contre les mentions everyone/here')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antiraid on` - Active la protection anti-everyone\n' +
                       '`&antiraid off` - Désactive la protection anti-everyone\n' +
                       '`&antiraid status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les mentions @everyone et @here\n' +
                       '• Supprime automatiquement le message\n' +
                       '• Ignore les admins et modérateurs\n' +
                       '• Envoie des logs détaillés',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-Everyone System' });

    await message.reply({ embeds: [embed] });
}
