const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'status',
    description: 'Affiche l\'état complet des protections',
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Vous devez être administrateur pour utiliser cette commande.');
        }

        const guild = message.guild;
        
        // Charger les rôles d'alerte
        let banallRoles = {};
        try {
            if (require('fs').existsSync('./banallRoles.json')) {
                banallRoles = JSON.parse(require('fs').readFileSync('./banallRoles.json', 'utf8'));
            }
        } catch (error) {
            console.error('Erreur lors du chargement des rôles d\'alerte:', error);
        }

        const guildRoles = banallRoles[guild.id] || {};

        // Vérifier les salons de logs
        const logChannels = {
            raid: guild.channels.cache.find(ch => ch.name === 'raid-logs'),
            ban: guild.channels.cache.find(ch => ch.name === 'ban-logs'),
            nuke: guild.channels.cache.find(ch => ch.name === 'nuke-logs'),
            spam: guild.channels.cache.find(ch => ch.name === 'spam-logs'),
            link: guild.channels.cache.find(ch => ch.name === 'link-logs'),
            role: guild.channels.cache.find(ch => ch.name === 'role-logs'),
            mention: guild.channels.cache.find(ch => ch.name === 'mention-logs'),
            moderation: guild.channels.cache.find(ch => ch.name === 'moderation-logs'),
            alerts: guild.channels.cache.find(ch => ch.name === 'alerts')
        };

        const embed = new EmbedBuilder()
            .setColor('#8B008B')
            .setTitle('État des Protections')
            .setTimestamp()
            .setFooter({ text: 'Protection 24/7' });

        // État des protections
        const protections = [
            { name: 'Anti-Raid', enabled: config.protection.antiRaid.enabled },
            { name: 'Anti-Spam', enabled: config.protection.antiSpam.enabled },
            { name: 'Anti-Link', enabled: config.protection.antiLink.enabled },
            { name: 'Anti-Nuke', enabled: config.protection.antiNuke.enabled },
            { name: 'Anti-Ban', enabled: config.protection.antiBan.enabled },
            { name: 'Anti-Role', enabled: config.protection.antiRole.enabled },
            { name: 'Anti-Mass Mention', enabled: config.protection.antiMassMention.enabled },
            { name: 'Anti-Caps', enabled: config.protection.antiCaps.enabled },
            { name: 'Anti-Bad Words', enabled: config.protection.antiBadWords.enabled },
            { name: 'Anti-Everyone', enabled: config.protection.antiEveryone.enabled },
            { name: 'Anti-Zalgo', enabled: config.protection.antiZalgo.enabled },
            { name: 'Anti-Emoji Spam', enabled: config.protection.antiEmojiSpam.enabled },
            { name: 'Anti-Ghost Ping', enabled: config.protection.antiGhostPing.enabled },
            { name: 'Anti-Image Spam', enabled: config.protection.antiImageSpam.enabled },
            { name: 'Anti-New Account', enabled: config.protection.antiNewAccount.enabled },
            { name: 'Anti-Selfbot', enabled: config.protection.antiSelfBot.enabled }
        ];

        embed.addFields({
            name: 'Protections',
            value: protections.map(p => `${p.enabled ? '✅' : '❌'} ${p.name}`).join('\n'),
            inline: true
        });

        // Rôles d'alerte
        const alertRoles = [];
        if (guildRoles.raidRole) {
            const role = guild.roles.cache.get(guildRoles.raidRole);
            if (role) alertRoles.push(`Raid: ${role.name}`);
        }
        if (guildRoles.banallRole) {
            const role = guild.roles.cache.get(guildRoles.banallRole);
            if (role) alertRoles.push(`Banall: ${role.name}`);
        }
        if (guildRoles.nukeRole) {
            const role = guild.roles.cache.get(guildRoles.nukeRole);
            if (role) alertRoles.push(`Nuke: ${role.name}`);
        }

        embed.addFields({
            name: 'Rôles d\'Alerte',
            value: alertRoles.length > 0 ? alertRoles.join('\n') : 'Aucun rôle configuré',
            inline: true
        });

        const uptime = Math.floor(client.uptime / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;

        embed.addFields({
            name: 'Performance du Bot',
            value: `Uptime: ${hours}h ${minutes}m ${seconds}s\nLatence: ${Date.now() - message.createdTimestamp}ms\nMémoire: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            inline: false
        });

        await message.reply({ embeds: [embed] });
    }
};
