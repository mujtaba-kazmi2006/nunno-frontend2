import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useMarketData } from '../contexts/MarketDataContext'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/cn'

export default function CryptoPriceCard({ ticker, name, onClick, variant = 'default' }) {
    const { prices } = useMarketData()
    const { theme } = useTheme()
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
            <div className={cn(
                "p-4 rounded-[2rem] border animate-pulse transition-colors",
                theme === 'dark' ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-200"
            )}>
                <div className={cn("h-3 w-12 rounded mb-3", theme === 'dark' ? "bg-white/10" : "bg-slate-200")}></div>
                <div className={cn("h-6 w-24 rounded", theme === 'dark' ? "bg-white/20" : "bg-slate-300")}></div>
            </div>
        )
    }

    if (!priceData || !chartData) return null

    const isPositive = priceData.percent_change >= 0
    const color = isPositive ? '#22c55e' : '#ef4444'
    const gradientId = `colorPrice${ticker}${variant}`

    if (variant === 'compact') {
        return (
            <div
                onClick={onClick}
                className={`flex flex-col p-3 rounded-2xl border transition-all cursor-pointer group ${theme === 'dark'
                    ? 'bg-[#16161e] border-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/5'
                    : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 shadow-sm hover:shadow-md'
                    }`}
            >
                <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest italic transition-colors",
                        theme === 'dark' ? "text-slate-500" : "text-slate-400"
                    )}>
                        {name === 'Bitcoin' ? 'BTC' : 'ETH'}
                    </span>
                    <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isPositive ? '+' : ''}{priceData.percent_change.toFixed(1)}%
                    </span>
                </div>

                <div className={cn(
                    "text-sm font-black italic transition-colors",
                    theme === 'dark' ? "text-slate-200" : "text-slate-900"
                )}>
                    ${priceData.current_price.toLocaleString(undefined, { minimumFractionDigits: ticker === 'ETHUSDT' ? 2 : 0, maximumFractionDigits: 2 })}
                </div>

                <div className="h-8 w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={color}
                                strokeWidth={1.5}
                                fill={color}
                                fillOpacity={0.1}
                                isAnimationActive={false}
                            />
                            <YAxis domain={['auto', 'auto']} hide />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

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
            className={`crypto-price-card group hover:shadow-xl transition-all hover:-translate-y-1 duration-300 rounded-xl border p-4 cursor-pointer ${theme === 'dark'
                ? 'bg-[#1e2030] border-slate-700/50 hover:border-purple-500 shadow-purple-500/5'
                : 'bg-white border-gray-100 shadow-sm'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{name}</h4>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>
                            ${priceData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold mt-1 ${isPositive ? (theme === 'dark' ? 'text-emerald-400' : 'text-green-500') : (theme === 'dark' ? 'text-rose-400' : 'text-red-500')}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(priceData.percent_change).toFixed(2)}%
                    </div>
                </div>
                <div className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-[#16161e] group-hover:bg-purple-500/10' : 'bg-gray-50 group-hover:bg-purple-50'}`}>
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
