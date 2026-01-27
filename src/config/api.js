// API Configuration
let API_BASE_URL_RAW = import.meta.env.VITE_API_URL || '';

// Improved validation: only fallback to localhost if no URL is provided OR it's a known placeholder
if (!API_BASE_URL_RAW || API_BASE_URL_RAW === 'your_key_here' || API_BASE_URL_RAW === 'your-render-backend-url-here') {
    if (import.meta.env.PROD) {
        console.warn('⚠️ VITE_API_URL is missing or using placeholder in production. Falling back to localhost:8000 which may not work.');
    }
    API_BASE_URL_RAW = 'http://localhost:8000';
}

const API_BASE_URL = API_BASE_URL_RAW.endsWith('/') ? API_BASE_URL_RAW.slice(0, -1) : API_BASE_URL_RAW;

export const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    CHAT: `${API_BASE_URL}/api/v1/chat`,
    CHAT_STREAM: `${API_BASE_URL}/api/v1/chat/stream`,
    PRICE_HISTORY: (ticker) => `${API_BASE_URL}/api/v1/price-history/${ticker}`,
    NEWS: (ticker) => `${API_BASE_URL}/api/v1/news/${ticker}`
}
