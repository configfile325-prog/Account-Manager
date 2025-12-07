function log(message, type = 'info') {
    const output = document.getElementById('output');
    const logEntry = document.createElement('div');
    logEntry.className = `log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    output.appendChild(logEntry);
    output.scrollTop = output.scrollHeight;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearOutput() {
    document.getElementById('output').innerHTML = '';
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function getAvatarUrl(user, size = 128) {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=${size}`;
    }
    return `https://cdn.discordapp.com/embed/avatars/${(user.discriminator || 0) % 5}.png`;
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('fr-FR');
}

function getSnowflakeDate(id) {
    return new Date(parseInt(id) / 4194304 + 1420070400000);
}

function createEmbed(options = {}) {
    const embed = document.createElement('div');
    embed.className = 'embed';
    
    if (options.color) {
        embed.style.borderLeftColor = options.color;
    }
    
    if (options.author) {
        const author = document.createElement('div');
        author.className = 'embed-author';
        if (options.author.icon) {
            const icon = document.createElement('img');
            icon.src = options.author.icon;
            author.appendChild(icon);
        }
        const name = document.createElement('span');
        name.className = 'embed-author-name';
        name.textContent = options.author.name;
        author.appendChild(name);
        embed.appendChild(author);
    }
    
    if (options.title) {
        const title = document.createElement('div');
        title.className = 'embed-title';
        title.textContent = options.title;
        embed.appendChild(title);
    }
    
    if (options.description) {
        const desc = document.createElement('div');
        desc.className = 'embed-description';
        desc.innerHTML = options.description;
        embed.appendChild(desc);
    }
    
    if (options.fields) {
        options.fields.forEach(field => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'embed-field';
            
            const fieldName = document.createElement('div');
            fieldName.className = 'embed-field-name';
            fieldName.textContent = field.name;
            fieldDiv.appendChild(fieldName);
            
            const fieldValue = document.createElement('div');
            fieldValue.className = 'embed-field-value';
            fieldValue.textContent = field.value;
            fieldDiv.appendChild(fieldValue);
            
            embed.appendChild(fieldDiv);
        });
    }
    
    if (options.thumbnail) {
        const thumb = document.createElement('div');
        thumb.className = 'embed-thumbnail';
        const img = document.createElement('img');
        img.src = options.thumbnail;
        thumb.appendChild(img);
        embed.appendChild(thumb);
    }
    
    if (options.footer) {
        const footer = document.createElement('div');
        footer.className = 'embed-footer';
        if (options.footer.icon) {
            const icon = document.createElement('img');
            icon.src = options.footer.icon;
            footer.appendChild(icon);
        }
        const text = document.createElement('span');
        text.className = 'embed-footer-text';
        text.textContent = options.footer.text;
        footer.appendChild(text);
        embed.appendChild(footer);
    }
    
    return embed;
}
