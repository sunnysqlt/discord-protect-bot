const { EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'logs',
    description: 'Gère les salons de logs de protection',
    aliases: ['log'],
    permissions: [PermissionsBitField.Flags.Administrator],
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Vous devez être administrateur pour utiliser cette commande !');
        }

        const subCommand = args[0]?.toLowerCase();

        switch (subCommand) {
            case 'create':
                await createLogsCategory(message);
                break;
            case 'delete':
                await deleteLogsCategory(message);
                break;
            case 'setup':
                await setupLogs(message);
                break;
            default:
                await showLogsHelp(message);
                break;
        }
    }
};

async function createLogsCategory(message) {
    try {
        // Vérifier si la catégorie existe déjà
        const existingCategory = message.guild.channels.cache.find(c => 
            c.name === '🛡️ LOGS DE PROTECTION' && c.type === ChannelType.GuildCategory
        );

        if (existingCategory) {
            return message.reply('❌ La catégorie de logs existe déjà !');
        }

        // Créer la catégorie
        const category = await message.guild.channels.create({
            name: '🛡️ LOGS DE PROTECTION',
            type: ChannelType.GuildCategory,
            position: 0,
            reason: 'Création des logs de protection'
        });

        // Créer les salons de logs
        const channels = [
            { name: '🚨-raid-logs', description: 'Logs des tentatives de raid' },
            { name: '🔨-ban-logs', description: 'Logs des bannissements' },
            { name: '💥-nuke-logs', description: 'Logs des tentatives de nuke' },
            { name: '📢-spam-logs', description: 'Logs du spam et messages' },
            { name: '🔗-link-logs', description: 'Logs des liens interdits' },
            { name: '🎭-role-logs', description: 'Logs des créations de rôles' },
            { name: '📢-mention-logs', description: 'Logs des mentions massives' },
            { name: '🔤-moderation-logs', description: 'Logs de modération générale' },
            { name: '🔔-alerts', description: 'Alertes importantes et lockdowns' }
        ];

        const createdChannels = [];
        
        for (const channelData of channels) {
            const channel = await message.guild.channels.create({
                name: channelData.name,
                type: ChannelType.GuildText,
                parent: category.id,
                topic: channelData.description,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: message.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.SendMessages],
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ],
                reason: 'Création des logs de protection'
            });
            createdChannels.push(channel);
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Catégorie de logs créée')
            .setDescription(`La catégorie **🛡️ LOGS DE PROTECTION** et ${createdChannels.length} salons ont été créés avec succès !`)
            .addFields(
                { name: '📋 Salons créés', value: createdChannels.map(c => c.toString()).join('\n'), inline: false },
                { name: '👤 Créé par', value: message.author.tag, inline: true },
                { name: '⚙️ Configuration', value: 'Les logs sont maintenant actifs !', inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erreur lors de la création des logs:', error);
        message.reply('❌ Une erreur est survenue lors de la création des logs !');
    }
}

async function deleteLogsCategory(message) {
    try {
        const category = message.guild.channels.cache.find(c => 
            c.name === '🛡️ LOGS DE PROTECTION' && c.type === ChannelType.GuildCategory
        );

        if (!category) {
            return message.reply('❌ Aucune catégorie de logs trouvée !');
        }

        // Supprimer tous les salons de la catégorie
        const channelsToDelete = category.children.cache;
        let deletedCount = 0;

        for (const channel of channelsToDelete.values()) {
            await channel.delete('Suppression des logs de protection');
            deletedCount++;
        }

        // Supprimer la catégorie
        await category.delete('Suppression des logs de protection');

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🗑️ Catégorie de logs supprimée')
            .setDescription(`La catégorie et ${deletedCount} salons ont été supprimés avec succès !`)
            .addFields(
                { name: '📋 Salons supprimés', value: deletedCount.toString(), inline: true },
                { name: '👤 Supprimé par', value: message.author.tag, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Erreur lors de la suppression des logs:', error);
        message.reply('❌ Une erreur est survenue lors de la suppression des logs !');
    }
}

async function setupLogs(message) {
    try {
        // Vérifier si la configuration existe déjà
        const existingCategory = message.guild.channels.cache.find(c => 
            c.name === '🛡️ LOGS DE PROTECTION' && c.type === ChannelType.GuildCategory
        );

        if (existingCategory) {
            return message.reply('❌ Les logs sont déjà configurés ! Utilisez `!logs delete` pour supprimer d\'abord.');
        }

        await createLogsCategory(message);

    } catch (error) {
        console.error('Erreur lors du setup des logs:', error);
        message.reply('❌ Une erreur est survenue lors du setup !');
    }
}

async function showLogsHelp(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📋 Gestion des Logs de Protection')
        .setDescription('Commandes disponibles pour gérer les logs de protection')
        .addFields(
            {
                name: '🔧 **Commandes**',
                value: '`!logs create` - Crée la catégorie et tous les salons de logs\n' +
                       '`!logs delete` - Supprime toute la catégorie de logs\n' +
                       '`!logs setup` - Configure les logs (alias de create)',
                inline: false
            },
            {
                name: '📝 **Salons créés**',
                value: '🚨 **raid-logs** - Tentatives de raid\n' +
                       '🔨 **ban-logs** - Bannissements massifs\n' +
                       '💥 **nuke-logs** - Tentatives de nuke\n' +
                       '📢 **spam-logs** - Spam et messages\n' +
                       '🔗 **link-logs** - Liens interdits\n' +
                       '🎭 **role-logs** - Créations de rôles\n' +
                       '📢 **mention-logs** - Mentions massives\n' +
                       '🔤 **moderation-logs** - Modération générale\n' +
                       '🔔 **alerts** - Alertes importantes',
                inline: false
            },
            {
                name: '⚠️ **Permissions**',
                value: 'Les salons de logs sont en lecture seule pour les membres.\n' +
                       'Seuls les administrateurs peuvent écrire dans les alertes.',
                inline: false
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Utilisez !logs create pour commencer' });

    await message.reply({ embeds: [embed] });
}
