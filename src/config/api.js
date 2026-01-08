// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    CHAT: `${API_BASE_URL}/api/v1/chat`,
    CHAT_STREAM: `${API_BASE_URL}/api/v1/chat/stream`,
    PRICE_HISTORY: (ticker) => `${API_BASE_URL}/api/v1/price-history/${ticker}`,
    NEWS: (ticker) => `${API_BASE_URL}/api/v1/news/${ticker}`
}
