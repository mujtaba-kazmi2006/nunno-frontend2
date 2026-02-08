import { useState, useEffect } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Thermometer } from 'lucide-react'
import { useMarketData } from '../contexts/MarketDataContext'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../utils/cn'

export default function MarketTemperature({ variant = 'default' }) {
    const { temperature, sentiment, loading, lastUpdated } = useMarketData()
    const { theme } = useTheme()

    const getColor = (temp) => {
        if (temp <= 25) return '#ef4444' // Extreme Fear
        if (temp <= 45) return '#f97316' // Fear
        if (temp <= 55) return '#eab308' // Neutral
        if (temp <= 75) return '#84cc16' // Greed
        return '#22c55e' // Extreme Greed
    }

    const getLabel = (temp) => {
        if (temp <= 25) return 'Extreme Fear'
        if (temp <= 45) return 'Fear'
        if (temp <= 55) return 'Neutral'
        if (temp <= 75) return 'Greed'
        return 'Extreme Greed'
    }

    if (loading) {
        return (
            <div className="market-temperature loading">
                <div className="flex justify-between items-center mb-4">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
                <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
            </div>
        )
    }

    if (variant === 'minimal') {
        const color = getColor(temperature);
        return (
            <div className="market-temperature-minimal">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest italic",
                            theme === 'dark' ? "text-slate-500" : "text-slate-400"
                        )}>Sentiment</span>
                        <span className="text-sm font-black italic uppercase tracking-tighter" style={{ color }}>{getLabel(temperature)}</span>
                    </div>
                    <span className="text-2xl font-black italic tracking-tighter" style={{ color }}>{temperature}</span>
                </div>
                <div className={cn(
                    "h-1.5 w-full rounded-full overflow-hidden",
                    theme === 'dark' ? "bg-white/5" : "bg-slate-200"
                )}>
                    <div
                        className="h-full transition-all duration-1000 ease-out rounded-full"
                        style={{
                            width: `${temperature}%`,
                            backgroundColor: color,
                            boxShadow: `0 0 10px ${color}40`
                        }}
                    />
                </div>
            </div>
        );
    }

    const chartData = [{ name: 'Sentiment', value: temperature, fill: getColor(temperature) }]

    return (
        <div className={cn(
            "market-temperature group p-5 rounded-[2rem] border transition-all duration-500",
            theme === 'dark' ? "bg-[#0c0c14] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        theme === 'dark' ? "bg-purple-500/10 text-purple-400" : "bg-purple-50 text-purple-600"
                    )}>
                        <Thermometer size={18} />
                    </div>
                    <h3 className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em] italic",
                        theme === 'dark' ? "text-slate-200" : "text-slate-600"
                    )}>Neural Sentiment</h3>
                </div>
                {lastUpdated && (
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all",
                        theme === 'dark'
                            ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                            : "text-purple-600 bg-purple-50 border-purple-100 shadow-sm"
                    )}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Sync
                    </span>
                )}
            </div>

            <div className="relative h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="85%"
                        outerRadius="100%"
                        barSize={12}
                        data={chartData}
                        startAngle={210}
                        endAngle={-30}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                            minAngle={15}
                            background={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }}
                            clockWise
                            dataKey="value"
                            cornerRadius={20}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
                    <span className="text-5xl font-black italic tracking-tighter transition-all duration-700 hover:scale-110 cursor-default" style={{
                        color: getColor(temperature),
                        textShadow: `0 0 20px ${getColor(temperature)}40`
                    }}>
                        {temperature}
                    </span>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest italic mt-1",
                        theme === 'dark' ? "text-slate-500" : "text-slate-400"
                    )}>
                        {getLabel(temperature)}
                    </span>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
                <div className={cn(
                    "p-3 rounded-2xl border flex flex-col gap-1 transition-[background-color,border-color,box-shadow]",
                    theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"
                )}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Volatility</span>
                    <span className={cn(
                        "text-xs font-bold transition-colors",
                        theme === 'dark' ? "text-slate-200" : "text-slate-700"
                    )}>Moderate</span>
                </div>
                <div className={cn(
                    "p-3 rounded-2xl border flex flex-col gap-1 transition-[background-color,border-color,box-shadow]",
                    theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"
                )}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Momentum</span>
                    <span className={cn(
                        "text-xs font-bold transition-colors",
                        theme === 'dark' ? "text-slate-200" : "text-slate-700"
                    )}>Increasing</span>
                </div>
            </div>
        </div>
    )
}
