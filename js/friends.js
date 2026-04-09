const friendsModule = {
    async deleteAllFriends() {
        if (!confirm('⚠️ Are you sure you want to delete ALL your friends? This action is irreversible!')) {
            return;
        }
        
        try {
            log('Fetching friend list...', 'info');
            const relationships = await discordFetch('/users/@me/relationships');
            const friends = relationships.filter(r => r.type === 1);
            
            log(`${friends.length} friends found`, 'info');
            
            for (const friend of friends) {
                try {
                    await discordFetch(`/users/@me/relationships/${friend.id}`, { method: 'DELETE' });
                    log(`✓ Friend deleted: ${friend.user.username}#${friend.user.discriminator}`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error for ${friend.user.username}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Deletion finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showMessageModal() {
        ui.showModal(`
            <h2>📨 Message to all friends</h2>
            <textarea id="friend-message" rows="5" placeholder="Enter your message..."></textarea>
            <button onclick="friendsModule.sendMessageToAll()">Send</button>
        `);
    },

    async sendMessageToAll() {
        const message = document.getElementById('friend-message').value.trim();
        if (!message) {
            alert('Please enter a message');
            return;
        }
        
        ui.closeModal();
        
        try {
            log('Fetching friend list...', 'info');
            const relationships = await discordFetch('/users/@me/relationships');
            const friends = relationships.filter(r => r.type === 1);
            
            log(`Sending message to ${friends.length} friends...`, 'info');
            
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
                    
                    log(`✓ Message sent to ${friend.user.username}#${friend.user.discriminator}`, 'success');
                    await sleep(CONFIG.DELAYS.VERY_SLOW);
                } catch (error) {
                    log(`✗ Error for ${friend.user.username}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Sending finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
