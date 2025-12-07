const webhookModule = {
    showCheckerModal() {
        ui.showModal(`
            <h2>✅ Webhook Checker</h2>
            <p>Vérifier si une URL de webhook est valide</p>
            <input type="text" id="webhook-check-url" placeholder="URL du webhook" />
            <button onclick="webhookModule.checkWebhook()">Vérifier</button>
        `);
    },

    async checkWebhook() {
        const webhookUrl = document.getElementById('webhook-check-url').value.trim();
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

    showInfoModal() {
        ui.showModal(`
            <h2>ℹ️ Webhook Info</h2>
            <p>Afficher les informations d'un webhook</p>
            <input type="text" id="webhook-info-url" placeholder="URL du webhook" />
            <button onclick="webhookModule.getWebhookInfo()">Obtenir les infos</button>
        `);
    },

    async getWebhookInfo() {
        const webhookUrl = document.getElementById('webhook-info-url').value.trim();
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
            
            ui.closeModal();
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showDeleteModal() {
        ui.showModal(`
            <h2>🗑️ Webhook Delete</h2>
            <p>Supprimer un webhook</p>
            <input type="text" id="webhook-delete-url" placeholder="URL du webhook" />
            <button onclick="webhookModule.deleteWebhook()" class="danger-btn">Supprimer</button>
        `);
    },

    async deleteWebhook() {
        const webhookUrl = document.getElementById('webhook-delete-url').value.trim();
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

    showSpammerModal() {
        ui.showModal(`
            <h2>📢 Webhook Spammer</h2>
            <p>Spam un webhook avec un message</p>
            <input type="text" id="webhook-spam-url" placeholder="URL du webhook" />
            <textarea id="webhook-spam-content" rows="3" placeholder="Message à envoyer"></textarea>
            <input type="number" id="webhook-spam-count" placeholder="Nombre (max 100)" min="1" max="100" value="10" />
            <button onclick="webhookModule.spamWebhook()" class="danger-btn">Lancer le spam</button>
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
            
            for (let i = 0; i < count; i++) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content })
                }).then(() => log(`✓ Message ${i + 1}/${count} envoyé`, 'success'))
                .catch(() => log(`✗ Erreur message ${i + 1}`, 'error'));
            }
            
            log(`✅ Spam lancé: ${count} messages`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showDeleteAllModal() {
        ui.showModal(`
            <h2>🗑️ Delete All Webhooks</h2>
            <p>Supprimer tous les webhooks d'un salon</p>
            <input type="text" id="webhook-deleteall-channel" placeholder="ID du salon" />
            <button onclick="webhookModule.deleteAllWebhooks()" class="danger-btn">Supprimer tous</button>
        `);
    },

    async deleteAllWebhooks() {
        const channelId = document.getElementById('webhook-deleteall-channel').value.trim();
        
        if (!channelId) {
            alert('Veuillez entrer un ID de salon');
            return;
        }

        if (!confirm('⚠️ Supprimer tous les webhooks de ce salon ?')) return;

        ui.closeModal();

        try {
            log('Récupération des webhooks...', 'info');
            const webhooks = await discordFetch(`/channels/${channelId}/webhooks`);
            
            log(`Suppression de ${webhooks.length} webhooks...`, 'warning');
            
            webhooks.forEach(webhook => {
                discordFetchNoError(`/webhooks/${webhook.id}/${webhook.token}`, { method: 'DELETE' })
                    .then(() => log(`✓ Webhook supprimé: ${webhook.name}`, 'success'));
            });
            
            log('✅ Suppression lancée', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
