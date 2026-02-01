import { useState, useEffect } from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Thermometer } from 'lucide-react'
import { useMarketData } from '../contexts/MarketDataContext'
import { useTheme } from '../contexts/ThemeContext'

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
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-32 w-full bg-gray-100 rounded-full animate-pulse flex items-center justify-center">
                    <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
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
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Sentiment</span>
                        <span className="text-sm font-black" style={{ color }}>{getLabel(temperature)}</span>
                    </div>
                    <span className="text-2xl font-black" style={{ color }}>{temperature}</span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}>
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
        <div className="market-temperature group">
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <Thermometer size={18} className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} />
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-700'}`}>Market Temp</h3>
                </div>
                {lastUpdated && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                    </span>
                )}
            </div>

            <div className="relative h-32 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="80%"
                        outerRadius="100%"
                        barSize={10}
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar
                            minAngle={15}
                            background
                            clockWise
                            dataKey="value"
                            cornerRadius={10}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 text-center">
                    <span className="block text-3xl font-extrabold transition-colors duration-300" style={{ color: getColor(temperature) }}>
                        {temperature}
                    </span>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                        {getLabel(temperature)}
                    </span>
                </div>
            </div>
        </div>
    )
}
