const serverModule = {
    async muteAllServers() {
        try {
            log('Récupération des serveurs...', 'info');
            const guilds = await discordFetch('/users/@me/guilds');
            
            log(`Mute de ${guilds.length} serveurs...`, 'info');
            
            for (const guild of guilds) {
                try {
                    await discordFetch(`/users/@me/guilds/${guild.id}/settings`, {
                        method: 'PATCH',
                        body: JSON.stringify({ muted: true })
                    });
                    log(`✓ ${guild.name} muté`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur pour ${guild.name}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Mute terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async unmuteAllServers() {
        try {
            log('Récupération des serveurs...', 'info');
            const guilds = await discordFetch('/users/@me/guilds');
            
            log(`Unmute de ${guilds.length} serveurs...`, 'info');
            
            for (const guild of guilds) {
                try {
                    await discordFetch(`/users/@me/guilds/${guild.id}/settings`, {
                        method: 'PATCH',
                        body: JSON.stringify({ muted: false })
                    });
                    log(`✓ ${guild.name} unmuté`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur pour ${guild.name}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Unmute terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
