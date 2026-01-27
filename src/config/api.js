// API Configuration
let API_BASE_URL_RAW = import.meta.env.VITE_API_URL || 'http://localhost:8000'
if (API_BASE_URL_RAW === 'your_key_here' || !API_BASE_URL_RAW.startsWith('http')) {
    API_BASE_URL_RAW = 'http://localhost:8000'
}
const API_BASE_URL = API_BASE_URL_RAW

export const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    CHAT: `${API_BASE_URL}/api/v1/chat`,
    CHAT_STREAM: `${API_BASE_URL}/api/v1/chat/stream`,
    PRICE_HISTORY: (ticker) => `${API_BASE_URL}/api/v1/price-history/${ticker}`,
    NEWS: (ticker) => `${API_BASE_URL}/api/v1/news/${ticker}`
}
