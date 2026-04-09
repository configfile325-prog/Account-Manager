const serverModule = {
    async muteAllServers() {
        try {
            log('Fetching servers...', 'info');
            const guilds = await discordFetch('/users/@me/guilds');
            
            log(`Muting ${guilds.length} servers...`, 'info');
            
            for (const guild of guilds) {
                try {
                    await discordFetch(`/users/@me/guilds/${guild.id}/settings`, {
                        method: 'PATCH',
                        body: JSON.stringify({ muted: true })
                    });
                    log(`✓ ${guild.name} muted`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error for ${guild.name}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Mute completed', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async unmuteAllServers() {
        try {
            log('Fetching servers...', 'info');
            const guilds = await discordFetch('/users/@me/guilds');
            
            log(`Unmuting ${guilds.length} servers...`, 'info');
            
            for (const guild of guilds) {
                try {
                    await discordFetch(`/users/@me/guilds/${guild.id}/settings`, {
                        method: 'PATCH',
                        body: JSON.stringify({ muted: false })
                    });
                    log(`✓ ${guild.name} unmuted`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error for ${guild.name}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Unmute completed', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
