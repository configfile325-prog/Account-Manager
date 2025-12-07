const toolsModule = {
    async createFriendLink() {
        try {
            log('Création du lien d\'ami...', 'info');
            
            const response = await discordFetch('/users/@me/invites', {
                method: 'POST'
            });
            
            if (response.code) {
                const link = `https://discord.gg/${response.code}`;
                log(`✅ Lien créé: ${link}`, 'success');
                
                navigator.clipboard.writeText(link).then(() => {
                    log('📋 Lien copié dans le presse-papiers', 'info');
                });
            } else {
                log('❌ Impossible de créer le lien', 'error');
            }
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async nukeDMs() {
        if (!confirm('⚠️ Fermer tous vos messages privés (sauf groupes) ?')) {
            return;
        }

        try {
            log('Récupération des DMs...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const dmChannels = channels.filter(c => c.type === 1);
            
            log(`Fermeture de ${dmChannels.length} DMs...`, 'warning');
            
            let closedCount = 0;
            for (const channel of dmChannels) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    closedCount++;
                    log(`✓ DM fermé (${closedCount}/${dmChannels.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${closedCount} DMs fermés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async nukeGroups() {
        if (!confirm('⚠️ Quitter tous vos groupes Discord ?')) {
            return;
        }

        try {
            log('Récupération des groupes...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const groupChannels = channels.filter(c => c.type === 3);
            
            log(`Fermeture de ${groupChannels.length} groupes...`, 'warning');
            
            let leftCount = 0;
            for (const channel of groupChannels) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    leftCount++;
                    log(`✓ Groupe quitté (${leftCount}/${groupChannels.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${leftCount} groupes quittés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async nukeBotDMs() {
        if (!confirm('⚠️ Fermer tous les DMs de bots ?')) {
            return;
        }

        try {
            log('Récupération des DMs...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const dmChannels = channels.filter(c => c.type === 1);
            
            log('Vérification des bots...', 'info');
            const botDMs = [];
            
            for (const channel of dmChannels) {
                if (channel.recipients && channel.recipients.length > 0) {
                    const recipient = channel.recipients[0];
                    if (recipient.bot) {
                        botDMs.push(channel);
                    }
                }
            }
            
            log(`Fermeture de ${botDMs.length} DMs de bots...`, 'warning');
            
            let closedCount = 0;
            for (const channel of botDMs) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    closedCount++;
                    const botName = channel.recipients[0].username;
                    log(`✓ DM fermé: ${botName} (${closedCount}/${botDMs.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Erreur: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${closedCount} DMs de bots fermés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showWebhookModal() {
        ui.showModal(`
            <h2>🔗 Gestion des Webhooks</h2>
            <input type="text" id="webhook-url" placeholder="URL du webhook" />
            <button onclick="toolsModule.checkWebhook()">✅ Vérifier</button>
            <button onclick="toolsModule.getWebhookInfo()">ℹ️ Informations</button>
            <button onclick="toolsModule.deleteWebhook()" class="danger-btn">🗑️ Supprimer</button>
            <button onclick="toolsModule.showWebhookSpamModal()">📢 Spammer</button>
        `);
    },

    async checkWebhook() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ URL de webhook invalide', 'error');
            return;
        }

        try {
            const response = await fetch(webhookUrl);
            if (response.ok) {
                log('✅ Le webhook est valide', 'success');
            } else {
                log('❌ Le webhook est invalide', 'error');
            }
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async getWebhookInfo() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ URL de webhook invalide', 'error');
            return;
        }

        try {
            const response = await fetch(webhookUrl);
            if (!response.ok) {
                log('❌ Le webhook est invalide', 'error');
                return;
            }

            const data = await response.json();
            const typeNames = { 1: 'Webhook', 2: 'Salon Suivi', 3: 'Bot' };

            log('\n=== Informations du Webhook ===', 'info');
            log(`Nom: ${data.name}`, 'info');
            log(`ID: ${data.id}`, 'info');
            log(`Salon: ${data.channel_id}`, 'info');
            log(`Serveur: ${data.guild_id}`, 'info');
            log(`Type: ${typeNames[data.type] || 'Webhook'}`, 'info');
            log(`Application: ${data.application_id || 'Aucune'}`, 'info');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async deleteWebhook() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ URL de webhook invalide', 'error');
            return;
        }

        if (!confirm('⚠️ Supprimer ce webhook ?')) return;

        try {
            const response = await fetch(webhookUrl, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                log('✅ Webhook supprimé', 'success');
                ui.closeModal();
            } else {
                log('❌ Impossible de supprimer le webhook', 'error');
            }
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showWebhookSpamModal() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        ui.closeModal();
        
        ui.showModal(`
            <h2>📢 Webhook Spammer</h2>
            <input type="text" id="webhook-spam-url" value="${webhookUrl}" placeholder="URL du webhook" />
            <textarea id="webhook-spam-content" rows="3" placeholder="Message à envoyer"></textarea>
            <input type="number" id="webhook-spam-count" placeholder="Nombre (max 100)" min="1" max="100" value="10" />
            <button onclick="toolsModule.spamWebhook()" class="danger-btn">Lancer le spam</button>
        `);
    },

    async spamWebhook() {
        const webhookUrl = document.getElementById('webhook-spam-url').value.trim();
        const content = document.getElementById('webhook-spam-content').value.trim();
        const count = parseInt(document.getElementById('webhook-spam-count').value) || 10;
        
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ URL de webhook invalide', 'error');
            return;
        }

        if (!content) {
            alert('Veuillez entrer un message');
            return;
        }

        ui.closeModal();

        try {
            log(`📢 Début du spam (${count} messages)...`, 'warning');
            
            let sent = 0;
            for (let i = 0; i < count; i++) {
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content })
                    });
                    sent++;
                    log(`✓ Message ${sent}/${count} envoyé`, 'success');
                    await sleep(CONFIG.DELAYS.FAST);
                } catch (error) {
                    log(`✗ Erreur message ${i + 1}: ${error.message}`, 'error');
                }
            }
            
            log(`✅ Spam terminé: ${sent}/${count} messages envoyés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
