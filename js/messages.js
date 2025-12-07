const messagesModule = {
    async deleteAllMessages() {
        const channelId = document.getElementById('channel-id').value.trim();
        if (!channelId) {
            alert('Veuillez entrer un ID de salon');
            return;
        }
        
        if (!confirm('⚠️ Supprimer tous vos messages de ce salon ?')) {
            return;
        }
        
        try {
            log('Recherche des messages...', 'info');
            let deletedCount = 0;
            let lastMessageId = null;
            
            while (true) {
                const url = lastMessageId 
                    ? `/channels/${channelId}/messages?before=${lastMessageId}&limit=100`
                    : `/channels/${channelId}/messages?limit=100`;
                
                const messages = await discordFetch(url);
                
                if (messages.length === 0) break;
                
                const myMessages = messages.filter(m => m.author.id === userData.id);
                
                if (myMessages.length === 0) {
                    lastMessageId = messages[messages.length - 1].id;
                    continue;
                }
                
                for (const msg of myMessages) {
                    try {
                        await discordFetch(`/channels/${channelId}/messages/${msg.id}`, { method: 'DELETE' });
                        deletedCount++;
                        log(`✓ Message supprimé (${deletedCount})`, 'success');
                        await sleep(CONFIG.DELAYS.SLOW);
                    } catch (error) {
                        log(`✗ Erreur: ${error.message}`, 'error');
                    }
                }
                
                lastMessageId = messages[messages.length - 1].id;
                await sleep(CONFIG.DELAYS.VERY_SLOW);
            }
            
            log(`✅ Suppression terminée: ${deletedCount} messages supprimés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async saveMessages() {
        const channelId = document.getElementById('channel-id').value.trim();
        if (!channelId) {
            alert('Veuillez entrer un ID de salon');
            return;
        }
        
        try {
            log('Récupération des informations du salon...', 'info');
            const channel = await discordFetch(`/channels/${channelId}`);
            
            log('Récupération des messages...', 'info');
            let allMessages = [];
            let lastMessageId = null;
            
            while (true) {
                const url = lastMessageId 
                    ? `/channels/${channelId}/messages?before=${lastMessageId}&limit=100`
                    : `/channels/${channelId}/messages?limit=100`;
                
                const messages = await discordFetch(url);
                
                if (messages.length === 0) break;
                
                allMessages = allMessages.concat(messages);
                lastMessageId = messages[messages.length - 1].id;
                log(`${allMessages.length} messages récupérés...`, 'info');
                await sleep(CONFIG.DELAYS.SLOW);
            }
            
            allMessages.reverse();
            
            log('Génération du fichier HTML...', 'info');
            const html = htmlGenerator.generateDiscordHTML(allMessages, channel);
            
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${channel.name || 'conversation'}-${Date.now()}.html`;
            a.click();
            
            log(`✅ ${allMessages.length} messages sauvegardés en HTML`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
