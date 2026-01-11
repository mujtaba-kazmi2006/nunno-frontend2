import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS } from '../config/api';
import { X, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import useBinanceWebSocket from '../hooks/useBinanceWebSocket';

// Memoized Chart Component to prevent re-renders when only price changes
const DetailChart = React.memo(({ data, color, timeframe }) => {
    // Safety check for data
    if (!data || !data.history || data.history.length === 0) return null;

    return (
        <div className="w-full h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.history}>
                    <defs>
                        <linearGradient id="colorPriceModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(val) => `$${val.toLocaleString()}`}
                        width={60}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#1f2937', fontWeight: '600' }}
                        labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Price']}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPriceModal)"
                        animationDuration={600}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}, (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if history data length changes or timeframe/color changes
    // This prevents re-renders when only current_price updates in parent
    return (
        prevProps.timeframe === nextProps.timeframe &&
        prevProps.color === nextProps.color &&
        prevProps.data?.history?.length === nextProps.data?.history?.length
    );
});

export default function CryptoDetailModal({ isOpen, onClose, initialTicker = "BTCUSDT" }) {
    const [ticker, setTicker] = useState(initialTicker);
    const [timeframe, setTimeframe] = useState('24H');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // WebSocket for live updates
    const { prices } = useBinanceWebSocket([ticker]);

    const tokens = [
        { label: 'Bitcoin (BTC)', value: 'BTCUSDT' },
        { label: 'Ethereum (ETH)', value: 'ETHUSDT' },
        { label: 'Solana (SOL)', value: 'SOLUSDT' },
        { label: 'Binance Coin (BNB)', value: 'BNBUSDT' },
        { label: 'Ripple (XRP)', value: 'XRPUSDT' },
        { label: 'Cardano (ADA)', value: 'ADAUSDT' },
        { label: 'Dogecoin (DOGE)', value: 'DOGEUSDT' },
        { label: 'Polkadot (DOT)', value: 'DOTUSDT' },
    ];

    useEffect(() => {
        if (isOpen) {
            setTicker(initialTicker);
        }
    }, [isOpen, initialTicker]);

    // Fetch historical data when ticker or timeframe changes
    useEffect(() => {
        if (isOpen && ticker) {
            fetchData();
        }
    }, [ticker, timeframe, isOpen]);

    // Update live price from WebSocket
    useEffect(() => {
        if (prices[ticker]) {
            setData(prev => {
                if (!prev) return prev
                // Only update if values changed to avoid unnecessary re-renders
                if (prev.current_price === prices[ticker].current_price) return prev

                return {
                    ...prev,
                    current_price: prices[ticker].current_price,
                    percent_change: prices[ticker].percent_change
                }
            })
        }
    }, [prices, ticker])

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.PRICE_HISTORY(ticker)}?timeframe=${timeframe}`);
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch detail data", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isPositive = data?.percent_change >= 0;
    const color = isPositive ? '#22c55e' : '#ef4444';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div
                className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <select
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-900 text-lg rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full md:w-64 p-2.5 font-bold shadow-sm"
                        >
                            {tokens.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-200/50 p-1 rounded-lg">
                        {['24H', '7D', '30D', '1Y'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${timeframe === tf
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:relative md:top-0 md:right-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                    {loading || !data ? (
                        <div className="h-80 flex items-center justify-center space-y-4 flex-col">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-medium">Loading market data...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-baseline gap-4 mb-8">
                                <h2 className="text-4xl font-extrabold text-gray-900">
                                    ${data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h2>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                    {Math.abs(data.percent_change).toFixed(2)}%
                                    <span className="opacity-70 font-medium ml-1">({timeframe})</span>
                                </div>
                            </div>

                            <DetailChart data={data} color={color} timeframe={timeframe} />

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">High ({timeframe})</p>
                                    <p className="text-lg font-bold text-gray-900">${data.high_price?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Low ({timeframe})</p>
                                    <p className="text-lg font-bold text-gray-900">${data.low_price?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Vol ({timeframe})</p>
                                    <p className="text-lg font-bold text-gray-900">${data.volume?.toLocaleString() || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Updated</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
