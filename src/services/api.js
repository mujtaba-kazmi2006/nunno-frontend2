import axios from 'axios'

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Handle placeholder values in .env
if (API_BASE_URL === 'your_key_here' || !API_BASE_URL.startsWith('http')) {
    API_BASE_URL = 'http://localhost:8000'
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

export const sendMessage = async (message, userName = 'User', userAge = 18, conversationHistory = []) => {
    try {
        const response = await api.post('/api/v1/chat', {
            message,
            user_name: userName,
            user_age: userAge,
            conversation_history: conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        })

        return response.data
    } catch (error) {
        console.error('Chat API error:', error)
        throw new Error(error.response?.data?.detail || 'Failed to send message')
    }
}

export const getTechnicalAnalysis = async (ticker, interval = '15m') => {
    try {
        const response = await api.get(`/api/v1/technical/${ticker}`, {
            params: { interval }
        })
        return response.data
    } catch (error) {
        console.error('Technical analysis error:', error)
        throw new Error('Failed to fetch technical analysis')
    }
}

export const getTokenomics = async (coinId, investmentAmount = 1000) => {
    try {
        const response = await api.get(`/api/v1/tokenomics/${coinId}`, {
            params: { investment_amount: investmentAmount }
        })
        return response.data
    } catch (error) {
        console.error('Tokenomics error:', error)
        throw new Error('Failed to fetch tokenomics')
    }
}

export const getNews = async (ticker) => {
    try {
        const response = await api.get(`/api/v1/news/${ticker}`)
        return response.data
    } catch (error) {
        console.error('News error:', error)
        throw new Error('Failed to fetch news')
    }
}

// Stream message with callback for chunks
// Stream message with callback for chunks
export async function streamMessage(message, userName, userAge, history, onChunk, signal) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal, // Pass abort signal
            body: JSON.stringify({
                message,
                user_name: userName,
                user_age: userAge,
                conversation_history: history.map(msg => ({
                    role: msg.role,
                    content: msg.content || "" // Ensure content is a string
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const jsonStr = line.slice(6);
                    try {
                        const data = JSON.parse(jsonStr);
                        onChunk(data);
                    } catch (e) {
                        console.error('Error parsing stream chunk', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Streaming error:', error);
        throw error;
    }
}

export default api
