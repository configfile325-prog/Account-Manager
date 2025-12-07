const friendsModule = {
    async deleteAllFriends() {
        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUS vos amis ? Cette action est irréversible !')) {
            return;
        }
        
        try {
            log('Récupération de la liste des amis...', 'info');
            const relationships = await discordFetch('/users/@me/relationships');
            const friends = relationships.filter(r => r.type === 1);
            
            log(`${friends.length} amis trouvés`, 'info');
            
            for (const friend of friends) {
                try {
                    await discordFetch(`/users/@me/relationships/${friend.id}`, { method: 'DELETE' });
                    log(`✓ Ami supprimé: ${friend.user.username}#${friend.user.discriminator}`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur pour ${friend.user.username}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Suppression terminée', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showMessageModal() {
        ui.showModal(`
            <h2>📨 Message à tous les amis</h2>
            <textarea id="friend-message" rows="5" placeholder="Entrez votre message..."></textarea>
            <button onclick="friendsModule.sendMessageToAll()">Envoyer</button>
        `);
    },

    async sendMessageToAll() {
        const message = document.getElementById('friend-message').value.trim();
        if (!message) {
            alert('Veuillez entrer un message');
            return;
        }
        
        ui.closeModal();
        
        try {
            log('Récupération de la liste des amis...', 'info');
            const relationships = await discordFetch('/users/@me/relationships');
            const friends = relationships.filter(r => r.type === 1);
            
            log(`Envoi du message à ${friends.length} amis...`, 'info');
            
            for (const friend of friends) {
                try {
                    const dm = await discordFetch('/users/@me/channels', {
                        method: 'POST',
                        body: JSON.stringify({ recipient_id: friend.id })
                    });
                    
                    await discordFetch(`/channels/${dm.id}/messages`, {
                        method: 'POST',
                        body: JSON.stringify({ content: message })
                    });
                    
                    log(`✓ Message envoyé à ${friend.user.username}#${friend.user.discriminator}`, 'success');
                    await sleep(CONFIG.DELAYS.VERY_SLOW);
                } catch (error) {
                    log(`✗ Erreur pour ${friend.user.username}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Envoi terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
