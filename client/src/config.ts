// API configuration
const API_BASE_URL = 'http://localhost:3017/api';

export const API_ENDPOINTS = {
    teams: `${API_BASE_URL}/teams`,
    players: `${API_BASE_URL}/players`,
    uploads: `${API_BASE_URL}/uploads`,
    'tactical-analysis': `${API_BASE_URL}/tactical-analysis`,
    'voice-recognition': `${API_BASE_URL}/voice-recognition`
};

// Socket configuration
export const SOCKET_URL = 'http://localhost:3017';

// Other configurations
export const DEFAULT_LANGUAGE = 'es';
export const SUPPORTED_LANGUAGES = ['es', 'en'];
