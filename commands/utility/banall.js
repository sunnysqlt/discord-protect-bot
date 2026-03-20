const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

// Stockage des données (en production, utiliser une base de données)
let banallRoles = {};

// Charger les données depuis un fichier
function loadBanallRoles() {
    try {
        if (fs.existsSync('./banallRoles.json')) {
            banallRoles = JSON.parse(fs.readFileSync('./banallRoles.json', 'utf8'));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des rôles banall:', error);
    }
}

// Sauvegarder les données dans un fichier
function saveBanallRoles() {
    try {
        fs.writeFileSync('./banallRoles.json', JSON.stringify(banallRoles, null, 2));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des rôles banall:', error);
    }
}

module.exports = {
    name: 'banall',
    description: 'Gère les rôles à ping pour les alertes de banall/raid',
    aliases: ['alertrole'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        // Charger les données
        loadBanallRoles();

        const subCommand = args[0]?.toLowerCase();
        const guildId = message.guild.id;

        // Initialiser le serveur si nécessaire
        if (!banallRoles[guildId]) {
            banallRoles[guildId] = {
                raidRole: null,
                banallRole: null,
                nukeRole: null
            };
        }

        switch (subCommand) {
            case 'add':
                await addRole(message, args, guildId);
                break;
            case 'remove':
                await removeRole(message, args, guildId);
                break;
            case 'list':
                await listRoles(message, guildId);
                break;
            case 'clear':
                await clearRoles(message, guildId);
                break;
            default:
                await showBanallHelp(message);
                break;
        }
    }
};

async function addRole(message, args, guildId) {
    const type = args[1]?.toLowerCase();
    const role = message.mentions.roles.first();

    if (!type || !role) {
        return message.reply('❌ Usage: `!banall add <raid|banall|nuke> @role`');
    }

    const validTypes = ['raid', 'banall', 'nuke'];
    if (!validTypes.includes(type)) {
        return message.reply('❌ Types valides: raid, banall, nuke');
    }

    // Ajouter le rôle
    banallRoles[guildId][`${type}Role`] = role.id;
    saveBanallRoles();

    const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ Rôle d\'alerte ajouté')
        .setDescription(`Le rôle ${role} sera maintenant ping pour les alertes de **${type.toUpperCase()}** !`)
        .addFields(
            { name: '🎭 Rôle', value: role.toString(), inline: true },
            { name: '🚨 Type d\'alerte', value: type.toUpperCase(), inline: true },
            { name: '👤 Ajouté par', value: message.author.tag, inline: true }
        )
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function removeRole(message, args, guildId) {
    const type = args[1]?.toLowerCase();

    if (!type) {
        return message.reply('❌ Usage: `!banall remove <raid|banall|nuke>`');
    }

    const validTypes = ['raid', 'banall', 'nuke'];
    if (!validTypes.includes(type)) {
        return message.reply('❌ Types valides: raid, banall, nuke');
    }

    const roleId = banallRoles[guildId][`${type}Role`];
    if (!roleId) {
        return message.reply(`❌ Aucun rôle n'est configuré pour les alertes de ${type} !`);
    }

    // Supprimer le rôle
    banallRoles[guildId][`${type}Role`] = null;
    saveBanallRoles();

    const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🗑️ Rôle d\'alerte supprimé')
        .setDescription(`Le rôle pour les alertes de **${type.toUpperCase()}** a été supprimé !`)
        .addFields(
            { name: '🚨 Type d\'alerte', value: type.toUpperCase(), inline: true },
            { name: '👤 Supprimé par', value: message.author.tag, inline: true }
        )
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function listRoles(message, guildId) {
    const serverRoles = banallRoles[guildId];
    
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Rôles d\'alerte configurés')
        .setDescription('Voici les rôles actuellement configurés pour recevoir les alertes')
        .setTimestamp();

    const fields = [];
    
    for (const [type, roleId] of Object.entries(serverRoles)) {
        const role = roleId ? message.guild.roles.cache.get(roleId) : null;
        fields.push({
            name: `🚨 ${type.toUpperCase()}`,
            value: role ? role.toString() : '❌ Non configuré',
            inline: true
        });
    }

    if (fields.length > 0) {
        embed.addFields(fields);
    }

    await message.reply({ embeds: [embed] });
}

async function clearRoles(message, guildId) {
    // Supprimer tous les rôles
    banallRoles[guildId] = {
        raidRole: null,
        banallRole: null,
        nukeRole: null
    };
    saveBanallRoles();

    const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🗑️ Tous les rôles d\'alerte supprimés')
        .setDescription('Tous les rôles configurés pour les alertes ont été supprimés !')
        .addFields(
            { name: '👤 Supprimé par', value: message.author.tag, inline: true }
        )
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function showBanallHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('🚨 Gestion des Rôles d\'Alerte')
        .setDescription('Configure les rôles à ping lors des alertes de sécurité')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!banall add <raid|banall|nuke> @role` - Ajoute un rôle d\'alerte\n' +
                       '`!banall remove <raid|banall|nuke>` - Supprime un rôle d\'alerte\n' +
                       '`!banall list` - Affiche les rôles configurés\n' +
                       '`!banall clear` - Supprime tous les rôles d\'alerte',
                inline: false
            },
            {
                name: '📋 **Types d\'alertes**',
                value: '🚨 **RAID** - Tentatives de raid massif\n' +
                       '🔨 **BANALL** - Bannissements massifs\n' +
                       '💥 **NUKE** - Tentatives de destruction du serveur',
                inline: false
            },
            {
                name: '💡 **Exemple**',
                value: '`!banall add raid @Modérateurs`\n`!banall add banall @Admins`',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Les rôles seront ping automatiquement lors des alertes' });

    await message.reply({ embeds: [embed] });
}

// Exporter les fonctions pour les utiliser dans d'autres fichiers
module.exports.loadBanallRoles = loadBanallRoles;
module.exports.getBanallRoles = () => banallRoles;
