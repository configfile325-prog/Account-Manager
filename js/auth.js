const auth = {
    async verifyToken() {
        const token = document.getElementById('token-input').value.trim();
        const errorDiv = document.getElementById('login-error');
        
        if (!token) {
            errorDiv.textContent = 'Veuillez entrer un token';
            return;
        }
        
        try {
            userToken = token;
            const response = await discordFetch('/users/@me');
            userData = response;
            
            document.getElementById('user-tag').textContent = `${userData.username}`;
            document.getElementById('user-avatar').src = getAvatarUrl(userData, 128);
            
            showScreen('warning-screen');
        } catch (error) {
            errorDiv.textContent = `Erreur: ${error.message}`;
            userToken = '';
        }
    },

    acceptRisks() {
        document.getElementById('dash-avatar').src = getAvatarUrl(userData, 48);
        document.getElementById('dash-username').textContent = `${userData.username}`;
        
        showScreen('dashboard-screen');
    },

    logout() {
        userToken = '';
        userData = null;
        document.getElementById('token-input').value = '';
        document.getElementById('output').innerHTML = '';
        document.getElementById('info-display').innerHTML = '';
        showScreen('login-screen');
    }
};

document.getElementById('accept-risks').addEventListener('change', (e) => {
    document.getElementById('accept-btn').disabled = !e.target.checked;
});
