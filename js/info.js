const infoModule = {
    async getUserInfo() {
        const userId = document.getElementById('info-search-id').value.trim();
        if (!userId) {
            alert('Please enter a user ID');
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
                title: '📋 User Information',
                thumbnail: getAvatarUrl(user, 96),
                fields: [
                    { name: 'Username', value: user.username },
                    user.global_name ? { name: 'Display Name', value: user.global_name } : null,
                    user.discriminator !== '0' ? { name: 'Discriminator', value: '#' + user.discriminator } : null,
                    { name: 'ID', value: user.id },
                    { name: 'Type', value: user.bot ? '🤖 Bot' : '👤 User' },
                    { name: 'Account created on', value: createdAt.toLocaleString('en-US') },
                    { name: 'Days since creation', value: `${daysSinceCreation} days` },
                    { name: 'Avatar', value: user.avatar ? '✅ Yes' : '❌ No' },
                    { name: 'Banner', value: user.banner ? '✅ Yes' : '❌ No' }
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
                title: '❌ Error',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    },

    async getServerInfo() {
        const serverId = document.getElementById('info-search-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }
        
        try {
            const guild = await discordFetch(`/guilds/${serverId}?with_counts=true`);
            const createdAt = getSnowflakeDate(guild.id);
            const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            const iconUrl = guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            const boostLevels = ['None', 'Level 1', 'Level 2', 'Level 3'];
            
            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: guild.name,
                    icon: iconUrl
                },
                title: '🏠 Server Information',
                thumbnail: iconUrl,
                fields: [
                    { name: 'Name', value: guild.name },
                    { name: 'ID', value: guild.id },
                    { name: 'Owner ID', value: guild.owner_id },
                    { name: 'Members', value: guild.approximate_member_count.toLocaleString() },
                    { name: 'Online', value: guild.approximate_presence_count.toLocaleString() },
                    { name: 'Boost Level', value: boostLevels[guild.premium_tier] },
                    { name: 'Number of Boosts', value: (guild.premium_subscription_count || 0).toString() },
                    { name: 'Created on', value: createdAt.toLocaleString('en-US') },
                    { name: 'Days since creation', value: `${daysSinceCreation} days` },
                    guild.description ? { name: 'Description', value: guild.description } : null,
                    guild.vanity_url_code ? { name: 'Vanity URL', value: `discord.gg/${guild.vanity_url_code}` } : null
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
                title: '❌ Error',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    },

    async getInviteInfo() {
        const inviteCode = document.getElementById('info-search-id').value.trim().split('/').pop();
        if (!inviteCode) {
            alert('Please enter an invite code');
            return;
        }
        
        try {
            const invite = await discordFetch(`/invites/${inviteCode}?with_counts=true&with_expiration=true`);
            
            const iconUrl = invite.guild?.icon 
                ? `https://cdn.discordapp.com/icons/${invite.guild.id}/${invite.guild.icon}.png?size=96`
                : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
            const channelTypes = {
                0: "Text Channel", 1: "DM", 2: "Voice Channel", 3: "Group", 4: "Category",
                5: "Announcement", 13: "Stage", 15: "Forum"
            };
            
            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: invite.guild?.name || 'Group',
                    icon: iconUrl
                },
                title: '📨 Invite Information',
                thumbnail: iconUrl,
                fields: [
                    { name: 'Code', value: invite.code },
                    { name: 'Link', value: `discord.gg/${invite.code}` },
                    invite.guild ? { name: 'Server', value: invite.guild.name } : null,
                    invite.guild ? { name: 'Server ID', value: invite.guild.id } : null,
                    { name: 'Channel', value: `#${invite.channel.name}` },
                    { name: 'Channel ID', value: invite.channel.id },
                    { name: 'Channel Type', value: channelTypes[invite.channel.type] || 'Unknown' },
                    invite.inviter ? { name: 'Inviter', value: `${invite.inviter.username}${invite.inviter.discriminator !== '0' ? '#' + invite.inviter.discriminator : ''}` } : null,
                    { name: 'Members', value: (invite.approximate_member_count || 0).toString() },
                    { name: 'Online', value: (invite.approximate_presence_count || 0).toString() },
                    { name: 'Expires', value: invite.expires_at ? new Date(invite.expires_at).toLocaleString('en-US') : 'Never' },
                    invite.guild?.vanity_url_code ? { name: 'Vanity URL', value: `discord.gg/${invite.guild.vanity_url_code}` } : null
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
                title: '❌ Error',
                description: error.message
            });
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(errorEmbed);
        }
    }
};
