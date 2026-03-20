const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, PermissionsBitField, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const dotenv = require('dotenv');
const express = require('express');

// Serveur web pour hébergement gratuit
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot de Protection est en ligne !');
});

app.listen(port, () => {
    console.log(`[SERVER] Serveur web démarré sur le port ${port}`);
});

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();
client.protection = {
    antiRaid: new Map(),
    antiSpam: new Map(),
    antiNuke: new Map(),
    antiBan: new Map(),
    antiChannel: new Map(),
    antiRole: new Map(),
    antiWebhook: new Map(),
    antiLink: new Map(),
    imageSpam: new Map()
};

// Augmenter la limite des listeners pour éviter les avertissements
client.setMaxListeners(20);

// Charger les commandes
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

// ANTI-RAID PROTECTION
client.on(Events.GuildMemberAdd, async member => {
    if (!config.protection.antiRaid.enabled) return;
    
    const now = Date.now();
    const guildId = member.guild.id;
    
    if (!client.protection.antiRaid.has(guildId)) {
        client.protection.antiRaid.set(guildId, []);
    }
    
    const joins = client.protection.antiRaid.get(guildId);
    joins.push({ time: now, user: member.user });
    
    // Nettoyer les anciennes entrées (plus d'une minute)
    const recentJoins = joins.filter(join => now - join.time < 60000);
    client.protection.antiRaid.set(guildId, recentJoins);
    
    if (recentJoins.length >= config.protection.antiRaid.maxJoinsPerMinute) {
        console.log(`[RAID] RAID détecté sur ${member.guild.name} ! ${recentJoins.length} utilisateurs en 1 minute`);
        
        // Activer le mode lockdown
        await activateLockdown(member.guild, 'RAID');
        
        // Bannir tous les nouveaux arrivants
        for (const join of recentJoins) {
            try {
                await member.guild.members.ban(join.user.id, { reason: 'Anti-Raid Protection' });
            } catch (error) {
                console.log(`[RAID] Impossible de bannir ${join.user.tag}`);
            }
        }
        
        await sendProtectionLog(member.guild, 'RAID', {
            count: recentJoins.length,
            users: recentJoins.map(j => j.user.tag).join(', ')
        });
    }
});

// ANTI-SPAM PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiSpam.enabled || message.author.bot || !message.guild) return;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    const key = `${guildId}-${userId}`;
    
    if (!client.protection.antiSpam.has(key)) {
        client.protection.antiSpam.set(key, []);
    }
    
    const messages = client.protection.antiSpam.get(key);
    messages.push({ time: Date.now(), content: message.content });
    
    // Nettoyer les anciens messages
    const recentMessages = messages.filter(msg => Date.now() - msg.time < config.protection.antiSpam.timeWindow);
    client.protection.antiSpam.set(key, recentMessages);
    
    if (recentMessages.length >= config.protection.antiSpam.maxMessages) {
        console.log(`[SPAM] SPAM détecté de ${message.author.tag}`);
        
        // Supprimer les messages
        const messagesToDelete = await message.channel.messages.fetch({ limit: recentMessages.length });
        await message.channel.bulkDelete(messagesToDelete).catch(() => {});
        
        // Punir l'utilisateur
        const member = message.guild.members.cache.get(userId);
        if (member) {
            if (config.protection.antiSpam.punishment === 'mute') {
                await member.timeout(config.protection.antiSpam.muteDuration, 'Anti-Spam Protection');
            } else if (config.protection.antiSpam.punishment === 'kick') {
                await member.kick('Anti-Spam Protection');
            }
        }
        
        await sendProtectionLog(message.guild, 'SPAM', {
            user: message.author.tag,
            count: recentMessages.length
        });
    }
});

// ANTI-LINK PROTECTION (Discord seulement)
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiLink.enabled || message.author.bot || !message.guild) return;
    
    // Regex pour détecter seulement les liens Discord
    const discordLinkRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|com|app|net)\/[^\s]+)/gi;
    if (discordLinkRegex.test(message.content)) {
        const member = message.guild.members.cache.get(message.author.id);
        
        // Vérifier si l'utilisateur a la permission de poster des liens
        if (member && member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;
        
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} Les liens Discord sont interdits ici !`).then(msg => 
            setTimeout(() => msg.delete(), 5000)
        );
        
        await sendProtectionLog(message.guild, 'LINK', {
            user: message.author.tag,
            content: message.content.substring(0, 100) + '...'
        });
    }
});

// ANTI-NUKE PROTECTION
client.on(Events.ChannelDelete, async channel => {
    if (!config.protection.antiNuke.enabled) return;
    
    const guildId = channel.guild.id;
    const now = Date.now();
    
    if (!client.protection.antiNuke.has(guildId)) {
        client.protection.antiNuke.set(guildId, []);
    }
    
    const deletions = client.protection.antiNuke.get(guildId);
    deletions.push({ time: now, channel: channel.name });
    
    const recentDeletions = deletions.filter(del => now - del.time < 30000); // 30 secondes
    client.protection.antiNuke.set(guildId, recentDeletions);
    
    if (recentDeletions.length >= config.protection.antiNuke.maxChannelDeletions) {
        console.log(`[NUKE] NUKE détecté sur ${channel.guild.name} !`);
        
        // Récupérer les logs pour trouver le coupable
        const auditLogs = await channel.guild.fetchAuditLogs({ 
            type: 72, // CHANNEL_DELETE
            limit: 10 
        });
        
        const log = auditLogs.entries.first();
        if (log && log.executor) {
            const executor = log.executor;
            const member = channel.guild.members.cache.get(executor.id);
            
            if (member && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.ban({ reason: 'Anti-Nuke Protection' });
                await sendProtectionLog(channel.guild, 'NUKE', {
                    user: executor.tag,
                    channels: recentDeletions.map(d => d.channel).join(', ')
                });
            }
        }
        
        await activateLockdown(channel.guild, 'NUKE');
    }
});

console.log('[START] Démarrage du bot...');
console.log('[TOKEN] Token chargé:', process.env.TOKEN ? 'OK' : 'MANQUANT');

client.once(Events.ClientReady, () => {
    console.log(`[PROTECTION] ${client.user.username} - Bot de Protection est en ligne !`);
    console.log(`[PROTECTION] Protège ${client.guilds.cache.size} serveurs`);
    console.log(`[PROTECTION] ${client.users.cache.size} utilisateurs protégés`);
    
    client.user.setActivity(`${config.prefix}help | Protection 24/7`, { type: ActivityType.Watching });
});

client.on(Events.GuildBanAdd, async ban => {
    if (!config.protection.antiBan.enabled) return;
    
    const guildId = ban.guild.id;
    const now = Date.now();
    
    if (!client.protection.antiBan.has(guildId)) {
        client.protection.antiBan.set(guildId, []);
    }
    
    const bans = client.protection.antiBan.get(guildId);
    bans.push({ time: now, user: ban.user });
    
    const recentBans = bans.filter(b => now - b.time < 30000); // 30 secondes
    client.protection.antiBan.set(guildId, recentBans);
    
    if (recentBans.length >= config.protection.antiBan.maxBans) {
        console.log(`[BANALL] BANALL détecté sur ${ban.guild.name} !`);
        
        const auditLogs = await ban.guild.fetchAuditLogs({ 
            type: 22, // GUILD_BAN_ADD
            limit: 10 
        });
        
        const log = auditLogs.entries.first();
        if (log && log.executor) {
            const executor = log.executor;
            const member = ban.guild.members.cache.get(executor.id);
            
            if (member && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.ban({ reason: 'Anti-Banall Protection' });
                await sendProtectionLog(ban.guild, 'BANALL', {
                    user: executor.tag,
                    bannedUsers: recentBans.map(b => b.user.tag).join(', ')
                });
            }
        }
        
        await activateLockdown(ban.guild, 'BANALL');
    }
});

// ANTI-ROLE PROTECTION
client.on(Events.GuildRoleCreate, async role => {
    if (!config.protection.antiRole.enabled) return;
    
    const guildId = role.guild.id;
    const now = Date.now();
    
    if (!client.protection.antiRole.has(guildId)) {
        client.protection.antiRole.set(guildId, []);
    }
    
    const creations = client.protection.antiRole.get(guildId);
    creations.push({ time: now, role: role.name });
    
    const recentCreations = creations.filter(c => now - c.time < 30000);
    client.protection.antiRole.set(guildId, recentCreations);
    
    if (recentCreations.length >= config.protection.antiRole.maxRoleCreations) {
        console.log(`[ROLE_SPAM] ROLE SPAM détecté sur ${role.guild.name} !`);
        
        const auditLogs = await role.guild.fetchAuditLogs({ 
            type: 30, // GUILD_ROLE_CREATE
            limit: 10 
        });
        
        const log = auditLogs.entries.first();
        if (log && log.executor) {
            const executor = log.executor;
            const member = role.guild.members.cache.get(executor.id);
            
            if (member && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.ban({ reason: 'Anti-Role Spam Protection' });
                await sendProtectionLog(role.guild, 'ROLE_SPAM', {
                    user: executor.tag,
                    roles: recentCreations.map(c => c.role).join(', ')
                });
            }
        }
    }
});

// Fonctions de protection
async function activateLockdown(guild, reason) {
    try {
        // Créer ou mettre à jour le rôle de lockdown
        let lockdownRole = guild.roles.cache.find(r => r.name === 'LOCKDOWN');
        if (!lockdownRole) {
            lockdownRole = await guild.roles.create({
                name: 'LOCKDOWN',
                color: '#8B008B',
                permissions: []
            });
        }
        
        // Appliquer le rôle à tous les canaux
        guild.channels.cache.forEach(async channel => {
            if (channel.isTextBased()) {
                await channel.permissionOverwrites.edit(lockdownRole, {
                    SendMessages: false,
                    AddReactions: false,
                    Connect: false
                });
            }
        });
        
        // Donner le rôle à tous les membres (sauf admins)
        guild.members.cache.forEach(async member => {
            if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.roles.add(lockdownRole);
            }
        });
        
        // Envoyer une alerte
        const alertChannel = guild.channels.cache.find(ch => ch.name === 'alerts') || guild.systemChannel;
        if (alertChannel) {
            const embed = new EmbedBuilder()
                .setColor('#8B008B')
                .setTitle('[LOCKDOWN] Lockdown activé')
                .setDescription(`Le serveur est en lockdown pour cause de **${reason}** !\n\nLes administrateurs peuvent désactiver le lockdown avec la commande \`${config.prefix}unlockdown\``)
                .setTimestamp();
            
            await alertChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Erreur lors du lockdown:', error);
    }
}

async function sendProtectionLog(guild, type, data) {
    if (!config.protection.logs.enabled) return;
    
    // Charger les rôles d'alerte
    const banallRoles = require('./commands/utility/banall.js').getBanallRoles();
    const guildRoles = banallRoles[guild.id] || {};
    
    let logChannel;
    let alertRole = null;
    
    // Déterminer le salon de log et le rôle d'alerte selon le type
    switch (type) {
        case 'RAID':
            logChannel = guild.channels.cache.find(ch => ch.name === 'raid-logs');
            alertRole = guildRoles.raidRole ? guild.roles.cache.get(guildRoles.raidRole) : null;
            break;
        case 'BANALL':
            logChannel = guild.channels.cache.find(ch => ch.name === 'ban-logs');
            alertRole = guildRoles.banallRole ? guild.roles.cache.get(guildRoles.banallRole) : null;
            break;
        case 'NUKE':
            logChannel = guild.channels.cache.find(ch => ch.name === 'nuke-logs');
            alertRole = guildRoles.nukeRole ? guild.roles.cache.get(guildRoles.nukeRole) : null;
            break;
        case 'SPAM':
            logChannel = guild.channels.cache.find(ch => ch.name === 'spam-logs');
            break;
        case 'LINK':
            logChannel = guild.channels.cache.find(ch => ch.name === 'link-logs');
            break;
        case 'ROLE_SPAM':
            logChannel = guild.channels.cache.find(ch => ch.name === 'role-logs');
            break;
        case 'MASS_MENTION':
            logChannel = guild.channels.cache.find(ch => ch.name === 'mention-logs');
            break;
        case 'CAPS':
        case 'BAD_WORD':
            logChannel = guild.channels.cache.find(ch => ch.name === 'moderation-logs');
            break;
        case 'WEBHOOK_SPAM':
            logChannel = guild.channels.cache.find(ch => ch.name === 'role-logs');
            break;
        default:
            logChannel = guild.channels.cache.find(ch => ch.name === 'moderation-logs');
    }
    
    // Si aucun salon de log spécifique, utiliser le salon d'alertes
    if (!logChannel) {
        logChannel = guild.channels.cache.find(ch => ch.name === 'alerts');
    }
    
    if (!logChannel) return;
    
    const colors = {
        RAID: '#8B008B',
        SPAM: '#8B008B',
        LINK: '#8B008B',
        NUKE: '#8B008B',
        BANALL: '#8B008B',
        ROLE_SPAM: '#8B008B',
        MASS_MENTION: '#8B008B',
        CAPS: '#8B008B',
        BAD_WORD: '#8B008B',
        WEBHOOK_SPAM: '#8B008B',
        EVERYONE_MENTION: '#8B008B',
        ZALGO: '#8B008B',
        EMOJI_SPAM: '#8B008B',
        GHOST_PING: '#8B008B',
        IMAGE_SPAM: '#8B008B',
        NEW_ACCOUNT: '#8B008B',
        SELFBOT: '#8B008B'
    };
    
    const embed = new EmbedBuilder()
        .setColor(colors[type] || '#8B008B')
        .setTitle(`[PROTECTION] ${type} DÉTECTÉ`)
        .setTimestamp()
        .setFooter({ text: 'Système de Protection' });
    
    switch (type) {
        case 'RAID':
            embed.setDescription(`**${data.count}** utilisateurs ont rejoint en 1 minute !`)
                .addFields({ name: 'Utilisateurs', value: data.users });
            break;
        case 'SPAM':
            embed.setDescription(`**${data.user}** a envoyé **${data.count}** messages en peu de temps !`);
            break;
        case 'LINK':
            embed.setDescription(`**${data.user}** a posté un lien Discord interdit !`)
                .addFields({ name: 'Contenu', value: data.content });
            break;
        case 'NUKE':
            embed.setDescription(`**${data.user}** a supprimé plusieurs salons !`)
                .addFields({ name: 'Salons supprimés', value: data.channels });
            break;
        case 'BANALL':
            embed.setDescription(`**${data.user}** a banni plusieurs utilisateurs !`)
                .addFields({ name: 'Utilisateurs bannis', value: data.bannedUsers });
            break;
        case 'ROLE_SPAM':
            embed.setDescription(`**${data.user}** a créé plusieurs rôles !`)
                .addFields({ name: 'Rôles créés', value: data.roles });
            break;
        case 'MASS_MENTION':
            embed.setDescription(`**${data.user}** a mentionné **${data.count}** utilisateurs/rôles !`);
            break;
        case 'CAPS':
            embed.setDescription(`**${data.user}** a utilisé **${data.percentage}%** de majuscules !`);
            break;
        case 'BAD_WORD':
            embed.setDescription(`**${data.user}** a utilisé un mot interdit : **${data.word}**`);
            break;
        case 'WEBHOOK_SPAM':
            embed.setDescription(`**${data.user}** a créé plusieurs webhooks !`)
                .addFields({ name: 'Salons affectés', value: data.channels });
            break;
    }
    
    // Ajouter le ping du rôle d'alerte si configuré pour les types critiques
    let content = '';
    if (alertRole && ['RAID', 'BANALL', 'NUKE'].includes(type)) {
        content = `${alertRole.toString()} [ALERTE CRITIQUE]`;
    }
    
    await logChannel.send({ content, embeds: [embed] });
}

// ANTI-MASS MENTION PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiMassMention.enabled || message.author.bot || !message.guild) return;
    
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    
    if (mentionCount >= config.protection.antiMassMention.maxMentions) {
        console.log(`[MASS_MENTION] MASS MENTION détecté de ${message.author.tag}`);
        
        await message.delete().catch(() => {});
        
        const member = message.guild.members.cache.get(message.author.id);
        if (member) {
            await member.timeout(config.protection.antiMassMention.timeoutDuration || 300000, 'Anti-Mass Mention Protection');
        }
        
        await sendProtectionLog(message.guild, 'MASS_MENTION', {
            user: message.author.tag,
            count: mentionCount
        });
    }
});

// ANTI-CAPS PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiCaps.enabled || message.author.bot || !message.guild) return;
    
    if (message.content.length < config.protection.antiCaps.minLength) return;
    
    const capsCount = (message.content.match(/[A-Z]/g) || []).length;
    const capsPercentage = (capsCount / message.content.length) * 100;
    
    if (capsPercentage >= config.protection.antiCaps.threshold) {
        console.log(`[CAPS] CAPS détecté de ${message.author.tag}`);
        
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} Merci de ne pas abuser des majuscules !`).then(msg => 
            setTimeout(() => msg.delete(), 5000)
        );
        
        await sendProtectionLog(message.guild, 'CAPS', {
            user: message.author.tag,
            percentage: capsPercentage.toFixed(1)
        });
    }
});

// ANTI-BAD WORDS PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiBadWords.enabled || message.author.bot || !message.guild) return;
    
    const content = message.content.toLowerCase();
    const badWords = config.protection.antiBadWords.words;
    
    const foundBadWord = badWords.find(word => content.includes(word.toLowerCase()));
    
    if (foundBadWord) {
        console.log(`[BAD_WORD] BAD WORD détecté de ${message.author.tag}: ${foundBadWord}`);
        
        await message.delete().catch(() => {});
        
        const member = message.guild.members.cache.get(message.author.id);
        if (member) {
            await member.timeout(config.protection.antiBadWords.timeoutDuration || 600000, 'Anti-Bad Words Protection');
        }
        
        await sendProtectionLog(message.guild, 'BAD_WORD', {
            user: message.author.tag,
            word: foundBadWord
        });
    }
});

// ANTI-EVERYONE PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiEveryone.enabled || message.author.bot || !message.guild) return;
    
    const member = message.guild.members.cache.get(message.author.id);
    
    // Vérifier si l'utilisateur a la permission de mentionner everyone
    if (member && member.permissions.has(PermissionsBitField.Flags.MentionEveryone)) return;
    
    if (message.content.includes('@everyone') || message.content.includes('@here')) {
        console.log(`[EVERYONE] EVERYONE MENTION détecté de ${message.author.tag}`);
        
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} Les mentions @everyone/@here sont interdites !`).then(msg => 
            setTimeout(() => msg.delete(), 5000)
        );
        
        await sendProtectionLog(message.guild, 'EVERYONE_MENTION', {
            user: message.author.tag,
            content: message.content.substring(0, 100)
        });
    }
});

// ANTI-ZALGO PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiZalgo.enabled || message.author.bot || !message.guild) return;
    
    // Détecter les caractères zalgo (caractères diacritiques combinés)
    const zalgoRegex = /[\u0300-\u036F\u0483-\u0489\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/g;
    const zalgoMatches = message.content.match(zalgoRegex);
    
    if (zalgoMatches && zalgoMatches.length > 5) {
        console.log(`[ZALGO] ZALGO détecté de ${message.author.tag}`);
        
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} Les textes zalgo sont interdits !`).then(msg => 
            setTimeout(() => msg.delete(), 5000)
        );
        
        await sendProtectionLog(message.guild, 'ZALGO', {
            user: message.author.tag,
            content: message.content.substring(0, 50) + '...'
        });
    }
});

// ANTI-EMOJI SPAM PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiEmojiSpam.enabled || message.author.bot || !message.guild) return;
    
    // Compter les emojis dans le message
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = message.content.match(emojiRegex) || [];
    
    if (emojis.length >= config.protection.antiEmojiSpam.maxEmojis) {
        console.log(`[EMOJI_SPAM] EMOJI SPAM détecté de ${message.author.tag} (${emojis.length} emojis)`);
        
        await message.delete().catch(() => {});
        await message.channel.send(`${message.author} Le spam d\'emojis est interdit !`).then(msg => 
            setTimeout(() => msg.delete(), 5000)
        );
        
        await sendProtectionLog(message.guild, 'EMOJI_SPAM', {
            user: message.author.tag,
            count: emojis.length
        });
    }
});

// ANTI-GHOST PING PROTECTION
const ghostPingTracker = new Map();

client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiGhostPing.enabled || message.author.bot || !message.guild) return;
    
    // Vérifier si le message contient des mentions
    if (message.mentions.users.size > 0 || message.mentions.roles.size > 0) {
        ghostPingTracker.set(message.id, {
            author: message.author.tag,
            content: message.content,
            mentions: {
                users: [...message.mentions.users.values()].map(u => u.tag),
                roles: [...message.mentions.roles.values()].map(r => r.name)
            },
            timestamp: Date.now()
        });
    }
});

client.on(Events.MessageDelete, async message => {
    if (!config.protection.antiGhostPing.enabled || !message.guild) return;
    
    const ghostPing = ghostPingTracker.get(message.id);
    if (ghostPing) {
        const timeDiff = Date.now() - ghostPing.timestamp;
        
        // Si le message a été supprimé rapidement (moins de 10 secondes)
        if (timeDiff < 10000) {
            console.log(`[GHOST_PING] GHOST PING détecté de ${ghostPing.author}`);
            
            await sendProtectionLog(message.guild, 'GHOST_PING', {
                user: ghostPing.author,
                mentions: ghostPing.mentions,
                timeDiff: timeDiff
            });
        }
        
        ghostPingTracker.delete(message.id);
    }
});

// ANTI-IMAGE SPAM PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiImageSpam.enabled || message.author.bot || !message.guild) return;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    const key = `${guildId}-${userId}`;
    
    // Compter les images/GIFs/stickers dans le message
    let mediaCount = 0;
    if (message.attachments.size > 0) mediaCount += message.attachments.size;
    if (message.stickers.size > 0) mediaCount += message.stickers.size;
    
    if (mediaCount === 0) return;
    
    if (!client.protection.imageSpam) {
        client.protection.imageSpam = new Map();
    }
    
    if (!client.protection.imageSpam.has(key)) {
        client.protection.imageSpam.set(key, []);
    }
    
    const images = client.protection.imageSpam.get(key);
    images.push({ time: Date.now(), count: mediaCount });
    
    // Nettoyer les anciennes entrées
    const recentImages = images.filter(img => Date.now() - img.time < config.protection.antiImageSpam.timeWindow);
    client.protection.imageSpam.set(key, recentImages);
    
    const totalImages = recentImages.reduce((sum, img) => sum + img.count, 0);
    
    if (totalImages >= config.protection.antiImageSpam.maxImages) {
        console.log(`[IMAGE_SPAM] IMAGE SPAM détecté de ${message.author.tag} (${totalImages} images)`);
        
        // Supprimer les messages
        const messagesToDelete = await message.channel.messages.fetch({ limit: 10 });
        await message.channel.bulkDelete(messagesToDelete).catch(() => {});
        
        // Muter l'utilisateur
        const member = message.guild.members.cache.get(userId);
        if (member) {
            await member.timeout(config.protection.antiImageSpam.muteDuration || 300000, 'Anti-Image Spam Protection');
        }
        
        await sendProtectionLog(message.guild, 'IMAGE_SPAM', {
            user: message.author.tag,
            count: totalImages
        });
    }
});

// ANTI-NEW ACCOUNT PROTECTION
client.on(Events.GuildMemberAdd, async member => {
    if (!config.protection.antiNewAccount.enabled) return;
    
    const accountAge = Date.now() - member.user.createdTimestamp;
    const minAge = config.protection.antiNewAccount.minAccountAge;
    
    if (accountAge < minAge) {
        console.log(`[NEW_ACCOUNT] NOUVEAU COMPTE détecté: ${member.user.tag} (${Math.floor(accountAge / 3600000)}h)`);
        
        await sendProtectionLog(member.guild, 'NEW_ACCOUNT', {
            user: member.user.tag,
            accountAge: Math.floor(accountAge / 3600000),
            id: member.user.id
        });
        
        // Envoyer une alerte dans le salon d'alertes
        const alertChannel = member.guild.channels.cache.find(ch => ch.name === '-alerts');
        if (alertChannel) {
            const embed = new EmbedBuilder()
                .setColor('#8B008B')
                .setTitle('[NOUVEAU COMPTE] Compte récent détecté')
                .setDescription(`**${member.user.tag}** a rejoint le serveur`)
                .addFields(
                    { name: 'Age du compte', value: `${Math.floor(accountAge / 3600000)} heures`, inline: true },
                    { name: 'Créé le', value: `<t:${Math.floor(member.user.createdTimestamp/1000)}:F>`, inline: true },
                    { name: 'ID', value: member.user.id, inline: true }
                )
                .setThumbnail(member.user.displayAvatarURL())
                .setTimestamp();
            
            await alertChannel.send({ embeds: [embed] });
        }
    }
});

// ANTI-SELFBOT PROTECTION
client.on(Events.MessageCreate, async message => {
    if (!config.protection.antiSelfBot.enabled || message.author.bot || !message.guild) return;
    
    const member = message.guild.members.cache.get(message.author.id);
    
    // Détecter les comportements suspects de selfbot
    const suspiciousPatterns = [
        /discord\.com\/api\/webhooks/i,
        /webhook/i,
        /token/i,
        /bot.*token/i,
        /selfbot/i
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(message.content.toLowerCase()));
    
    if (isSuspicious) {
        console.log(`[SELFBOT] SELFBOT suspect détecté de ${message.author.tag}`);
        
        await message.delete().catch(() => {});
        
        // Bannir l'utilisateur
        if (member) {
            await member.ban({ reason: 'Anti-Selfbot Protection' });
        }
        
        await sendProtectionLog(message.guild, 'SELFBOT', {
            user: message.author.tag,
            content: message.content.substring(0, 100)
        });
    }
});
client.on(Events.WebhooksUpdate, async channel => {
    if (!config.protection.antiWebhook.enabled) return;
    
    const guildId = channel.guild.id;
    const now = Date.now();
    
    if (!client.protection.antiWebhook.has(guildId)) {
        client.protection.antiWebhook.set(guildId, []);
    }
    
    const webhooks = client.protection.antiWebhook.get(guildId);
    webhooks.push({ time: now, channel: channel.name });
    
    const recentWebhooks = webhooks.filter(w => now - w.time < 30000);
    client.protection.antiWebhook.set(guildId, recentWebhooks);
    
    if (recentWebhooks.length >= config.protection.antiWebhook.maxWebhooks) {
        console.log(`🚨 WEBHOOK SPAM DÉTECTÉ sur ${channel.guild.name} !`);
        
        const auditLogs = await channel.guild.fetchAuditLogs({ 
            type: 50, // WEBHOOK_CREATE
            limit: 10 
        });
        
        const log = auditLogs.entries.first();
        if (log && log.executor) {
            const executor = log.executor;
            const member = channel.guild.members.cache.get(executor.id);
            
            if (member && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                await member.ban({ reason: 'Anti-Webhook Spam Protection' });
                await sendProtectionLog(channel.guild, 'WEBHOOK_SPAM', {
                    user: executor.tag,
                    channels: recentWebhooks.map(w => w.channel).join(', ')
                });
            }
        }
    }
});

// Gestion des commandes
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;

    const prefix = config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Permissions
    if (command.permissions && message.member) {
        const hasPermission = command.permissions.every(permission => 
            message.member.permissions.has(permission)
        );
        if (!hasPermission) {
            return message.reply('❌ Vous n\'avez pas la permission d\'utiliser cette commande !');
        }
    }

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('❌ Une erreur est survenue lors de l\'exécution de cette commande !');
    }
});

console.log('[LOGIN] Tentative de connexion à Discord...');
client.login(process.env.TOKEN || config.token);
