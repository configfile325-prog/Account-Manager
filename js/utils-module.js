const utilsModule = {
    showIdTokenModal() {
        ui.showModal(`
            <h2>🔐 ID to Token</h2>
            <p>Encode un ID d'utilisateur en base64 (format token)</p>
            <input type="text" id="user-id-token" placeholder="ID de l'utilisateur" />
            <button onclick="utilsModule.encodeIdToToken()">Encoder</button>
        `);
    },

    encodeIdToToken() {
        const userId = document.getElementById('user-id-token').value.trim();
        if (!userId) {
            alert('Veuillez entrer un ID d\'utilisateur');
            return;
        }

        try {
            const encoded = btoa(userId);
            log(`✅ ID encodé: ${encoded}`, 'success');
            
            navigator.clipboard.writeText(encoded).then(() => {
                log('📋 Token copié dans le presse-papiers', 'info');
            });
            
            ui.closeModal();
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async changeHypesquad() {
        const house = document.getElementById('hypesquad-select').value;
        
        try {
            if (house === '0') {
                await discordFetch('/hypesquad/online', { method: 'DELETE' });
                log('✅ HypeSquad retiré', 'success');
            } else {
                await discordFetch('/hypesquad/online', {
                    method: 'POST',
                    body: JSON.stringify({ house_id: parseInt(house) })
                });
                const houses = ['', 'Bravery', 'Brilliance', 'Ballance'];
                log(`✅ HypeSquad changé: ${houses[house]}`, 'success');
            }
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async showClanModal() {
        try {
            log('Récupération des serveurs avec clans...', 'info');
            const guilds = await discordFetch('/users/@me/guilds');
            const clans = guilds.filter(g => g.features.includes("GUILD_TAGS"));
            
            if (clans.length === 0) 
                return alert('Aucun serveur avec des clans trouvé');

            
            let currentClan = null;
            try {
                const userSettings = await discordFetch('/users/@me/settings');
                currentClan = userSettings.guild_identity?.guild_id;
            } catch (error) {}
            
            const clanOptions = clans.map(guild => {
                const selected = currentClan === guild.id ? 'selected' : '';
                return `<option value="${guild.id}" ${selected}> ${guild.name}</option>`;
            }).join('');
            
            ui.showModal(`
                <h2>🏷️ Modifier le Clan</h2>
                <p>Sélectionnez un serveur avec clan pour afficher son tag sur votre profil</p>
                <select id="clan-select" style="width: 100%;">
                    <option value="">Aucun clan</option>
                    ${clanOptions}
                </select>
                <button onclick="utilsModule.changeClan()">Appliquer</button>
            `);
            
            log(`${clans.length} serveurs avec clans trouvés`, 'success');
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    },

    async changeClan() {
        const guildId = document.getElementById('clan-select').value;
        
        try {
            if (!guildId) {
                await discordFetch('/users/@me/clan', {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        identity_guild_id: null,
                        identity_enabled: false
                    })
                });
                log('✅ Clan retiré', 'success');
            } else {
                await discordFetch('/users/@me/clan', {
                    method: 'PUT',
                    body: JSON.stringify({ 
                        identity_guild_id: guildId,
                        identity_enabled: true
                    })
                });
                
                const guild = await discordFetch(`/guilds/${guildId}`);
                log(`✅ Clan changé: ${guild.name}`, 'success');
            }
            
            ui.closeModal();
        } catch (error) {
            log(`❌ Erreur: ${error.message}`, 'error');
        }
    }
};
