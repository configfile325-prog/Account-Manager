const tokenModule = {
    showCheckerModal() {
        ui.showModal(`
            <h2>✅ Token Checker</h2>
            <p>Check if a Discord token is valid</p>
            <input type="password" id="token-check" placeholder="Discord Token" />
            <button onclick="tokenModule.checkToken()">Check</button>
        `);
    },

    async checkToken() {
        const token = document.getElementById('token-check').value.trim();
        if (!token) {
            alert('Please enter a token');
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
                    title: '✅ Valid Token',
                    description: `The token belongs to **${data.username}${data.discriminator !== '0' ? '#' + data.discriminator : ''}**`,
                    thumbnail: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=96` : 'https://cdn.discordapp.com/embed/avatars/0.png',
                    fields: [
                        { name: 'ID', value: data.id },
                        { name: 'Email', value: data.email || 'Not available' }
                    ],
                    footer: {
                        text: 'Token successfully verified'
                    }
                });
                
                document.getElementById('info-display').innerHTML = '';
                document.getElementById('info-display').appendChild(embed);
            } else {
                const embed = createEmbed({
                    color: '#ff4757',
                    title: '❌ Invalid Token',
                    description: 'The provided token is invalid or has expired.'
                });
                
                document.getElementById('info-display').innerHTML = '';
                document.getElementById('info-display').appendChild(embed);
            }
        } catch (error) {
            ui.closeModal();
            const embed = createEmbed({
                color: '#ff4757',
                title: '❌ Error',
                description: error.message
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        }
    },

    showInfoModal() {
        ui.showModal(`
            <h2>ℹ️ Token Info</h2>
            <p>Display information about a Discord token</p>
            <input type="password" id="token-info" placeholder="Discord Token" />
            <button onclick="tokenModule.getTokenInfo()">Get Info</button>
        `);
    },

    async getTokenInfo() {
        const token = document.getElementById('token-info').value.trim();
        if (!token) {
            alert('Please enter a token');
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
                    title: '❌ Invalid Token',
                    description: 'The provided token is invalid or has expired.'
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
                title: '🔑 Token Information',
                thumbnail: data.avatar ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=96` : 'https://cdn.discordapp.com/embed/avatars/0.png',
                fields: [
                    { name: 'Username', value: data.username },
                    data.global_name ? { name: 'Global Name', value: data.global_name } : null,
                    data.discriminator !== '0' ? { name: 'Discriminator', value: '#' + data.discriminator } : null,
                    { name: 'ID', value: data.id },
                    { name: 'Email', value: data.email || 'Not available' },
                    { name: 'Email Verified', value: data.verified ? '✅ Yes' : '❌ No' },
                    { name: 'Phone', value: data.phone || 'Not available' },
                    { name: '2FA', value: data.mfa_enabled ? '✅ Enabled' : '❌ Disabled' },
                    { name: 'Language', value: data.locale || 'Unknown' },
                    { name: 'Nitro', value: data.premium_type ? '✅ Yes' : '❌ No' },
                    data.clan ? { name: 'Clan', value: data.clan.tag } : null,
                    { name: 'Account Created', value: createdAt.toLocaleString('en-US') }
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
                title: '❌ Error',
                description: error.message
            });
            
            document.getElementById('info-display').innerHTML = '';
            document.getElementById('info-display').appendChild(embed);
        }
    }
};
