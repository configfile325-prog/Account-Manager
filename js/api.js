async function discordFetch(endpoint, options = {}) {
    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': userToken,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json().catch(() => ({}));
}

async function discordFetchNoError(endpoint, options = {}) {
    try {
        return await discordFetch(endpoint, options);
    } catch (error) {
        return null;
    }
}
