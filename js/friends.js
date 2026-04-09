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
                    // Fix: Ensure we use the correct ID path
                    const friendId = friend.id || (friend.user ? friend.user.id : null);
                    if (!friendId) continue;

                    await discordFetch(`/users/@me/relationships/${friendId}`, { method: 'DELETE' });
                    log(`✓ Friend deleted: ${friend.user?.username || 'Unknown'}`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error for ${friend.user?.username || 'Unknown'}: ${error.message}`, 'error');
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
        const messageInput = document.getElementById('friend-message');
        if (!messageInput) return;

        const message = messageInput.value.trim();
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
                    // Fix: Reliable ID check to prevent "Invalid JSON" on body
                    const friendId = friend.id || (friend.user ? friend.user.id : null);
                    
                    if (!friendId) {
                        log(`✗ Missing ID for a friend entry`, 'error');
                        continue;
                    }

                    // Step 1: Create or Get DM Channel
                    const dm = await discordFetch('/users/@me/channels', {
                        method: 'POST',
                        // Fix: Explicitly structured JSON body
                        body: JSON.stringify({ recipient_id: friendId })
                    });
                    
                    if (!dm || !dm.id) {
                        throw new Error('Could not create DM channel');
                    }

                    // Step 2: Send Message
                    await discordFetch(`/channels/${dm.id}/messages`, {
                        method: 'POST',
                        // Fix: Explicitly structured JSON body
                        body: JSON.stringify({ 
                            content: message,
                            tts: false 
                        })
                    });
                    
                    log(`✓ Message sent to ${friend.user?.username || friendId}`, 'success');
                    await sleep(CONFIG.DELAYS.VERY_SLOW);
                } catch (error) {
                    log(`✗ Error for ${friend.user?.username || 'Unknown'}: ${error.message}`, 'error');
                }
            }
            
            log('✅ Sending finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};

