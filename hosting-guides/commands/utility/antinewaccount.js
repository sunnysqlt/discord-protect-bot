const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'antinewaccount',
    description: 'Active ou désactive la protection anti-nouveaux comptes',
    aliases: ['anti-newaccount', 'antinew'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const action = args[0]?.toLowerCase();

        if (!action || !['on', 'off', 'status'].includes(action)) {
            return showAntiNewAccountHelp(message);
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
                await enableAntiNewAccount(message, serverConfig, guildId);
                break;
            case 'off':
                await disableAntiNewAccount(message, serverConfig, guildId);
                break;
            case 'status':
                await showAntiNewAccountStatus(message, serverConfig, guildId);
                break;
        }
    }
};

async function enableAntiNewAccount(message, serverConfig, guildId) {
    serverConfig[guildId].antiNewAccount = {
        enabled: true,
        enabledBy: message.author.id,
        enabledAt: Date.now(),
        minAccountAge: 86400000, // 24 heures
        action: 'monitor'
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
        .setTitle('🆕 Anti-New Account Activé')
        .setDescription('La protection anti-nouveaux comptes est maintenant **activée** !')
        .addFields(
            { name: '📊 Âge minimum', value: '24 heures', inline: true },
            { name: '⚡ Action', value: 'Monitoring et alertes', inline: true },
            { name: '👤 Activé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function disableAntiNewAccount(message, serverConfig, guildId) {
    serverConfig[guildId].antiNewAccount = {
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
        .setTitle('⚠️ Anti-New Account Désactivé')
        .setDescription('La protection anti-nouveaux comptes est maintenant **désactivée** !')
        .addFields(
            { name: '⚠️ Attention', value: 'Les nouveaux comptes ne seront plus surveillés', inline: true },
            { name: '👤 Désactivé par', value: message.author.tag, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7' });

    await message.reply({ embeds: [embed] });
}

async function showAntiNewAccountStatus(message, serverConfig, guildId) {
    const antiNewAccountConfig = serverConfig[guildId]?.antiNewAccount || { enabled: config.protection.antiNewAccount.enabled };
    
    const status = antiNewAccountConfig.enabled ? '✅ **Activé**' : '❌ **Désactivé**';
    const statusColor = antiNewAccountConfig.enabled ? '#00FF00' : '#FF0000';

    const minAge = antiNewAccountConfig.minAccountAge || 86400000;
    const minAgeHours = Math.floor(minAge / 3600000);
    const minAgeDays = Math.floor(minAge / 86400000);

    const embed = new EmbedBuilder()
        .setColor(statusColor)
        .setTitle('🆕 Statut Anti-New Account')
        .setDescription(`La protection anti-nouveaux comptes est actuellement ${status}`)
        .addFields(
            { name: '📊 Âge minimum requis', value: `${minAgeDays}j ${minAgeHours % 24}h`, inline: true },
            { name: '⚡ Action automatique', value: 'Monitoring et alertes', inline: true },
            { name: '🔍 Détection', value: 'Comptes récents', inline: true }
        );

    if (antiNewAccountConfig.enabledBy) {
        const activator = await client.users.fetch(antiNewAccountConfig.enabledBy).catch(() => null);
        if (activator) {
            embed.addFields({
                name: '👤 Activé par', 
                value: `${activator.tag} (<t:${Math.floor(antiNewAccountConfig.enabledAt/1000)}:R>)`,
                inline: false
            });
        }
    }

    embed.setTimestamp()
        .setFooter({ text: 'Utilisez &antinewaccount on/off pour modifier' });

    await message.reply({ embeds: [embed] });
}

async function showAntiNewAccountHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🆕 Anti-New Account - Aide')
        .setDescription('Gérez la protection contre les nouveaux comptes')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`&antinewaccount on` - Active la protection anti-nouveaux comptes\n' +
                       '`&antinewaccount off` - Désactive la protection anti-nouveaux comptes\n' +
                       '`&antinewaccount status` - Affiche l\'état actuel',
                inline: false
            },
            {
                name: '🛡️ **Comment ça marche ?**',
                value: '• Détecte les comptes de moins de 24h\n' +
                       '• Surveille leurs activités\n' +
                       '• Envoie des alertes aux administrateurs\n' +
                       '• Peut appliquer des restrictions',
                inline: false
            },
            {
                name: '⚙️ **Configuration**',
                value: '• Âge minimum: 24 heures\n' +
                       '• Action: Monitoring et alertes\n' +
                       '• Détection: À l\'arrivée du membre\n' +
                       '• Logs: Dans 🚨-raid-logs',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Protection 24/7 - Anti-New Account System' });

    await message.reply({ embeds: [embed] });
}
