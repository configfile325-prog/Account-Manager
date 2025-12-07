const infoModule = {
    async getUserInfo() {
        const userId = document.getElementById('info-search-id').value.trim();
        if (!userId) {
            alert('Veuillez entrer un ID d\'utilisateur');
            return;
        }
        
        try {
            const user = await discordFetch(`/users/${userId}`);
            const createdAt = getSnowflakeDate(user.id);
            const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: `${user.username}${user.discriminator !== '0' ? '#' + user.discriminator : ''}`,
                    icon: getAvatarUrl(user, 96)
                },
                title: '📋 Informations de l\'utilisateur',
                thumbnail: getAvatarUrl(user, 96),
                fields: [
                    { name: 'Nom d\'utilisateur', value: user.username },
                    user.global_name ? { name: 'Nom d\'affichage', value: user.global_name } : null,
                    user.discriminator !== '0' ? { name: 'Discriminateur', value: '#' + user.discriminator } : null,
                    { name: 'ID', value: user.id },
                    { name: 'Type', value: user.bot ? '🤖 Bot' : '👤 Utilisateur' },
                    { name: 'Compte créé le', value: createdAt.toLocaleString('fr-FR') },
                    { name: 'Jours depuis création', value: `${daysSinceCreation} jours` },
                    { name: 'Avatar', value: user.avatar ? '✅ Oui' : '❌ Non' },
                    { name: 'Bannière', value: user.banner ? '✅ Oui' : '❌ Non' }
                ].filter(f => f !== null),
                footer: {
                    text: `ID: ${user.id}`
                }
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        } catch (error) {
            const errorEmbed = createEmbed({
                color: '#ff4757',
                title: '❌ Erreur',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    },

    async getServerInfo() {
        const serverId = document.getElementById('info-search-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }
        
        try {
            const guild = await discordFetch(`/guilds/${serverId}?with_counts=true`);
            const createdAt = getSnowflakeDate(guild.id);
            const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            const iconUrl = guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            const boostLevels = ['Aucun', 'Niveau 1', 'Niveau 2', 'Niveau 3'];
            
            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: guild.name,
                    icon: iconUrl
                },
                title: '🏠 Informations du serveur',
                thumbnail: iconUrl,
                fields: [
                    { name: 'Nom', value: guild.name },
                    { name: 'ID', value: guild.id },
                    { name: 'Propriétaire ID', value: guild.owner_id },
                    { name: 'Membres', value: guild.approximate_member_count.toLocaleString() },
                    { name: 'En ligne', value: guild.approximate_presence_count.toLocaleString() },
                    { name: 'Niveau de boost', value: boostLevels[guild.premium_tier] },
                    { name: 'Nombre de boosts', value: (guild.premium_subscription_count || 0).toString() },
                    { name: 'Créé le', value: createdAt.toLocaleString('fr-FR') },
                    { name: 'Jours depuis création', value: `${daysSinceCreation} jours` },
                    guild.description ? { name: 'Description', value: guild.description } : null,
                    guild.vanity_url_code ? { name: 'URL Personnalisée', value: `discord.gg/${guild.vanity_url_code}` } : null
                ].filter(f => f !== null),
                footer: {
                    text: `ID: ${guild.id}`
                }
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        } catch (error) {
            const errorEmbed = createEmbed({
                color: '#ff4757',
                title: '❌ Erreur',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    },

    async getInviteInfo() {
        const inviteCode = document.getElementById('info-search-id').value.trim().split('/').pop();
        if (!inviteCode) {
            alert('Veuillez entrer un code d\'invitation');
            return;
        }
        
        try {
            const invite = await discordFetch(`/invites/${inviteCode}?with_counts=true&with_expiration=true`);
            
            const iconUrl = invite.guild?.icon 
                ? `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.png?size=96`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            const channelTypes = {
                0: "Salon Textuel", 1: "DM", 2: "Salon Vocal", 3: "Groupe", 4: "Catégorie",
                5: "Annonce", 13: "Conférence", 15: "Forum"
            };
            
            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: invite.guild?.name || 'Groupe',
                    icon: iconUrl
                },
                title: '📨 Informations de l\'invitation',
                thumbnail: iconUrl,
                fields: [
                    { name: 'Code', value: invite.code },
                    { name: 'Lien', value: `discord.gg/${invite.code}` },
                    invite.guild ? { name: 'Serveur', value: invite.guild.name } : null,
                    invite.guild ? { name: 'ID du serveur', value: invite.guild.id } : null,
                    { name: 'Salon', value: `#${invite.channel.name}` },
                    { name: 'ID du salon', value: invite.channel.id },
                    { name: 'Type de salon', value: channelTypes[invite.channel.type] || 'Inconnu' },
                    invite.inviter ? { name: 'Inviteur', value: `${invite.inviter.username}${invite.inviter.discriminator !== '0' ? '#' + invite.inviter.discriminator : ''}` } : null,
                    { name: 'Membres', value: (invite.approximate_member_count || 0).toString() },
                    { name: 'En ligne', value: (invite.approximate_presence_count || 0).toString() },
                    { name: 'Expire', value: invite.expires_at ? new Date(invite.expires_at).toLocaleString('fr-FR') : 'Jamais' },
                    invite.guild?.vanity_url_code ? { name: 'URL Personnalisée', value: `discord.gg/${invite.guild.vanity_url_code}` } : null
                ].filter(f => f !== null),
                footer: {
                    text: `Code: ${invite.code}`
                }
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        } catch (error) {
            const errorEmbed = createEmbed({
                color: '#ff4757',
                title: '❌ Erreur',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    }
};
