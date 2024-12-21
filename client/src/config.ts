// API configuration
export const API_BASE_URL = 'http://localhost:3017/api';

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
};

// Other API endpoints
export const API_ENDPOINTS = {
    teams: `${API_BASE_URL}/teams`,
    players: `${API_BASE_URL}/players`,
    tactics: `${API_BASE_URL}/tactics`,
};
