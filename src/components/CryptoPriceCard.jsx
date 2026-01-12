import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useMarketData } from '../contexts/MarketDataContext'

export default function CryptoPriceCard({ ticker, name, onClick }) {
    const { prices } = useMarketData()
    const [priceData, setPriceData] = useState(null)
    const [chartData, setChartData] = useState(null)
    const [loading, setLoading] = useState(true)
    const lastChartUpdate = useRef(0)

    useEffect(() => {
        // Update data when WebSocket provides new prices
        if (prices[ticker]) {
            // Always update price (text)
            setPriceData(prev => ({
                current_price: prices[ticker].current_price,
                percent_change: prices[ticker].percent_change
            }))

            // Update chart only every 10 seconds (10000ms)
            const now = Date.now()
            if (now - lastChartUpdate.current > 10000 || !chartData) {
                setChartData(prices[ticker].history)
                lastChartUpdate.current = now
            }

            setLoading(false)
        }
    }, [prices, ticker])

    if (loading) {
        return (
            <div className="crypto-price-card p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-8 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="h-16 w-full bg-gray-50 rounded-lg animate-pulse" />
            </div>
        )
    }

    if (!priceData || !chartData) return null

    const isPositive = priceData.percent_change >= 0
    const color = isPositive ? '#22c55e' : '#ef4444'
    const gradientId = `colorPrice${ticker}`

    return (
        <div
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.();
                }
            }}
            role="button"
            tabIndex={0}
            className="crypto-price-card group hover:shadow-lg transition-transform hover:-translate-y-1 duration-300 bg-white rounded-xl border border-gray-100 p-4 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-gray-500 text-sm font-medium">{name}</h4>
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-gray-900">
                            ${priceData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(priceData.percent_change).toFixed(2)}%
                    </div>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <img
                        src={`https://cryptologos.cc/logos/${name.toLowerCase()}-${ticker === 'BTCUSDT' ? 'btc' : 'eth'}-logo.png?v=026`}
                        alt={name}
                        className="w-6 h-6"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </div>
            </div>

            <div className="h-16 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={color}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                            isAnimationActive={true}
                            animationDuration={500}
                        />
                        <YAxis domain={['auto', 'auto']} hide />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
