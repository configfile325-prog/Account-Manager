const webhookModule = {
    showCheckerModal() {
        ui.showModal(`
            <h2>✅ Webhook Checker</h2>
            <p>Check if a webhook URL is valid</p>
            <input type="text" id="webhook-check-url" placeholder="Webhook URL" />
            <button onclick="webhookModule.checkWebhook()">Check</button>
        `);
    },

    async checkWebhook() {
        const webhookUrl = document.getElementById('webhook-check-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ Invalid webhook URL', 'error');
            return;
        }

        try {
            const response = await fetch(webhookUrl);
            if (response.ok) {
                log('✅ The webhook is valid', 'success');
            } else {
                log('❌ The webhook is invalid', 'error');
            }
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showInfoModal() {
        ui.showModal(`
            <h2>ℹ️ Webhook Info</h2>
            <p>Display webhook information</p>
            <input type="text" id="webhook-info-url" placeholder="Webhook URL" />
            <button onclick="webhookModule.getWebhookInfo()">Get info</button>
        `);
    },

    async getWebhookInfo() {
        const webhookUrl = document.getElementById('webhook-info-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ Invalid webhook URL', 'error');
            return;
        }

        try {
            const response = await fetch(webhookUrl);
            if (!response.ok) {
                log('❌ The webhook is invalid', 'error');
                return;
            }

            const data = await response.json();
            const typeNames = { 1: 'Webhook', 2: 'Channel Follower', 3: 'Bot' };

            log('\n=== Webhook Information ===', 'info');
            log(`Name: ${data.name}`, 'info');
            log(`ID: ${data.id}`, 'info');
            log(`Channel: ${data.channel_id}`, 'info');
            log(`Server: ${data.guild_id}`, 'info');
            log(`Type: ${typeNames[data.type] || 'Webhook'}`, 'info');
            log(`Application: ${data.application_id || 'None'}`, 'info');
            
            ui.closeModal();
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showDeleteModal() {
        ui.showModal(`
            <h2>🗑️ Webhook Delete</h2>
            <p>Delete a webhook</p>
            <input type="text" id="webhook-delete-url" placeholder="Webhook URL" />
            <button onclick="webhookModule.deleteWebhook()" class="danger-btn">Delete</button>
        `);
    },

    async deleteWebhook() {
        const webhookUrl = document.getElementById('webhook-delete-url').value.trim();
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ Invalid webhook URL', 'error');
            return;
        }

        if (!confirm('⚠️ Delete this webhook?')) return;

        try {
            const response = await fetch(webhookUrl, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                log('✅ Webhook deleted', 'success');
                ui.closeModal();
            } else {
                log('❌ Unable to delete the webhook', 'error');
            }
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showSpammerModal() {
        ui.showModal(`
            <h2>📢 Webhook Spammer</h2>
            <p>Spam a webhook with a message</p>
            <input type="text" id="webhook-spam-url" placeholder="Webhook URL" />
            <textarea id="webhook-spam-content" rows="3" placeholder="Message to send"></textarea>
            <input type="number" id="webhook-spam-count" placeholder="Amount (max 100)" min="1" max="100" value="10" />
            <button onclick="webhookModule.spamWebhook()" class="danger-btn">Start spam</button>
        `);
    },

    async spamWebhook() {
        const webhookUrl = document.getElementById('webhook-spam-url').value.trim();
        const content = document.getElementById('webhook-spam-content').value.trim();
        const count = parseInt(document.getElementById('webhook-spam-count').value) || 10;
        
        const webhookRegex = /^(https?:\/\/)?(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        
        if (!webhookRegex.test(webhookUrl)) {
            log('❌ Invalid webhook URL', 'error');
            return;
        }

        if (!content) {
            alert('Please enter a message');
            return;
        }

        ui.closeModal();

        try {
            log(`📢 Starting spam (${count} messages)...`, 'warning');
            
            for (let i = 0; i < count; i++) {
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content })
                }).then(() => log(`✓ Message ${i + 1}/${count} sent`, 'success'))
                .catch(() => log(`✗ Error message ${i + 1}`, 'error'));
            }
            
            log(`✅ Spam started: ${count} messages`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showDeleteAllModal() {
        ui.showModal(`
            <h2>🗑️ Delete All Webhooks</h2>
            <p>Delete all webhooks from a channel</p>
            <input type="text" id="webhook-deleteall-channel" placeholder="Channel ID" />
            <button onclick="webhookModule.deleteAllWebhooks()" class="danger-btn">Delete all</button>
        `);
    },

    async deleteAllWebhooks() {
        const channelId = document.getElementById('webhook-deleteall-channel').value.trim();
        
        if (!channelId) {
            alert('Please enter a channel ID');
            return;
        }

        if (!confirm('⚠️ Delete all webhooks from this channel?')) return;

        ui.closeModal();

        try {
            log('Fetching webhooks...', 'info');
            const webhooks = await discordFetch(`/channels/${channelId}/webhooks`);
            
            log(`Deleting ${webhooks.length} webhooks...`, 'warning');
            
            webhooks.forEach(webhook => {
                discordFetchNoError(`/webhooks/${webhook.id}/${webhook.token}`, { method: 'DELETE' })
                    .then(() => log(`✓ Webhook deleted: ${webhook.name}`, 'success'));
            });
            
            log('✅ Deletion started', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
