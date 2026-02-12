import React, { createContext, useContext, useState, useEffect } from 'react';
import useBinanceWebSocket from '../hooks/useBinanceWebSocket';
import api from '../services/api';

const MarketDataContext = createContext();

export function useMarketData() {
    return useContext(MarketDataContext);
}

export function MarketDataProvider({ children }) {
    // State to act as a cache
    const [marketData, setMarketData] = useState({
        temperature: 50,
        sentiment: 'Neutral',
        lastUpdated: null,
        loading: true
    });

    // Persistent WebSocket connection for major coins
    const { prices } = useBinanceWebSocket(['BTCUSDT', 'ETHUSDT']);

    // AI Summary Persistence
    const [cachedReport, setCachedReport] = useState('');
    const [cachedNewsHeadlines, setCachedNewsHeadlines] = useState([]);
    const [cachedMacroSummary, setCachedMacroSummary] = useState('');

    // Helper to fetch sentiment
    const fetchSentiment = async () => {
        try {
            const response = await api.get('/api/v1/news/BTCUSDT');
            if (response.data) {
                const data = response.data;
                return {
                    temperature: data.fear_greed_index?.value || 50,
                    sentiment: data.sentiment || 'Neutral'
                };
            }
        } catch (error) {
            console.error('Failed to fetch sentiment:', error);
        }
        return null;
    };

    const refreshData = async () => {
        const sentimentData = await fetchSentiment();

        setMarketData(prev => ({
            ...prev,
            ...(sentimentData || {}),
            loading: false,
            lastUpdated: new Date()
        }));
    };

    useEffect(() => {
        // Initial fetch
        refreshData();

        // Polling interval (e.g. 30 seconds)
        const interval = setInterval(refreshData, 30000);

        return () => clearInterval(interval);
    }, []);

    const value = {
        ...marketData,
        prices, // Expose live prices
        refreshData,
        cachedReport,
        setCachedReport,
        cachedNewsHeadlines,
        setCachedNewsHeadlines,
        cachedMacroSummary,
        setCachedMacroSummary
    };

    return (
        <MarketDataContext.Provider value={value}>
            {children}
        </MarketDataContext.Provider>
    );
}
