const toolsModule = {
    async createFriendLink() {
        try {
            log('Creating friend link...', 'info');
            
            const response = await discordFetch('/users/@me/invites', {
                method: 'POST'
            });
            
            if (response.code) {
                const link = `https://discord.gg/${response.code}`;
                log(`✅ Link created: ${link}`, 'success');
                
                navigator.clipboard.writeText(link).then(() => {
                    log('📋 Link copied to clipboard', 'info');
                });
            } else {
                log('❌ Unable to create link', 'error');
            }
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async nukeDMs() {
        if (!confirm('⚠️ Close all your private messages (except groups)?')) {
            return;
        }

        try {
            log('Fetching DMs...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const dmChannels = channels.filter(c => c.type === 1);
            
            log(`Closing ${dmChannels.length} DMs...`, 'warning');
            
            let closedCount = 0;
            for (const channel of dmChannels) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    closedCount++;
                    log(`✓ DM closed (${closedCount}/${dmChannels.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${closedCount} DMs closed`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async nukeGroups() {
        if (!confirm('⚠️ Leave all your Discord groups?')) {
            return;
        }

        try {
            log('Fetching groups...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const groupChannels = channels.filter(c => c.type === 3);
            
            log(`Closing ${groupChannels.length} groups...`, 'warning');
            
            let leftCount = 0;
            for (const channel of groupChannels) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    leftCount++;
                    log(`✓ Group left (${leftCount}/${groupChannels.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${leftCount} groups left`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async nukeBotDMs() {
        if (!confirm('⚠️ Close all bot DMs?')) {
            return;
        }

        try {
            log('Fetching DMs...', 'info');
            const channels = await discordFetch('/users/@me/channels');
            const dmChannels = channels.filter(c => c.type === 1);
            
            log('Checking bots...', 'info');
            const botDMs = [];
            
            for (const channel of dmChannels) {
                if (channel.recipients && channel.recipients.length > 0) {
                    const recipient = channel.recipients[0];
                    if (recipient.bot) {
                        botDMs.push(channel);
                    }
                }
            }
            
            log(`Closing ${botDMs.length} bot DMs...`, 'warning');
            
            let closedCount = 0;
            for (const channel of botDMs) {
                try {
                    await discordFetch(`/channels/${channel.id}`, { method: 'DELETE' });
                    closedCount++;
                    const botName = channel.recipients[0].username;
                    log(`✓ DM closed: ${botName} (${closedCount}/${botDMs.length})`, 'success');
                    await sleep(CONFIG.DELAYS.NORMAL);
                } catch (error) {
                    log(`✗ Error: ${error.message}`, 'error');
                }
            }
            
            log(`✅ ${closedCount} bot DMs closed`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showWebhookModal() {
        ui.showModal(`
            <h2>🔗 Webhook Management</h2>
            <input type="text" id="webhook-url" placeholder="Webhook URL" />
            <button onclick="toolsModule.checkWebhook()">✅ Check</button>
            <button onclick="toolsModule.getWebhookInfo()">ℹ️ Information</button>
            <button onclick="toolsModule.deleteWebhook()" class="danger-btn">🗑️ Delete</button>
            <button onclick="toolsModule.showWebhookSpamModal()">📢 Spam</button>
        `);
    },

    async checkWebhook() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
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

    async getWebhookInfo() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
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
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async deleteWebhook() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
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

    showWebhookSpamModal() {
        const webhookUrl = document.getElementById('webhook-url').value.trim();
        ui.closeModal();
        
        ui.showModal(`
            <h2>📢 Webhook Spammer</h2>
            <input type="text" id="webhook-spam-url" value="${webhookUrl}" placeholder="Webhook URL" />
            <textarea id="webhook-spam-content" rows="3" placeholder="Message to send"></textarea>
            <input type="number" id="webhook-spam-count" placeholder="Amount (max 100)" min="1" max="100" value="10" />
            <button onclick="toolsModule.spamWebhook()" class="danger-btn">Start spam</button>
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
            
            let sent = 0;
            for (let i = 0; i < count; i++) {
                try {
                    await fetch(webhookUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content })
                    });
                    sent++;
                    log(`✓ Message ${sent}/${count} sent`, 'success');
                    await sleep(CONFIG.DELAYS.FAST);
                } catch (error) {
                    log(`✗ Error message ${i + 1}: ${error.message}`, 'error');
                }
            }
            
            log(`✅ Spam finished: ${sent}/${count} messages sent`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
