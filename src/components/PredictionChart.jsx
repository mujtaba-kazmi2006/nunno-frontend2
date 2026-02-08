import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

export default function PredictionChart({ data, support, resistance, currentPrice, bias, supportResistance = [] }) {
    const { theme } = useTheme();
    if (!data || data.length === 0) return null

    // Determine chart color based on bias
    const chartColor = bias === 'bullish' ? '#22c55e' : bias === 'bearish' ? '#ef4444' : '#6366f1'
    const gradientId = `colorPrice${Math.random()}`

    // Memoize chart data transformation to prevent recalculation on every render
    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            index: index,
            displayTime: (index % 10 === 0 && item.timestamp && typeof item.timestamp === 'string')
                ? item.timestamp.split(' ')[0]
                : (index % 10 === 0 ? String(item.time || index) : '')
        }))
    }, [data])

    return (
        <div className="prediction-chart p-4 rounded-3xl bg-black/20 border border-white/5 shadow-inner">
            <div className="chart-header mb-6">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] italic text-slate-500">Neural Price Projection Node</h5>
            </div>

            {/* Display Support and Resistance Levels */}
            {supportResistance && supportResistance.length > 0 && (
                <div className="s-r-levels mb-6 flex flex-wrap gap-2">
                    {supportResistance.slice(0, 3).map((level, index) => (
                        <div
                            key={index}
                            className={`px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-tight ${level.type === 'support'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}
                        >
                            {level.type}: ${Number(level.price).toFixed(2)}
                        </div>
                    ))}
                </div>
            )}

            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="displayTime"
                            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 800 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontWeight: 800 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value !== null && value !== undefined ? `$${value.toLocaleString()}` : ''}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(10, 10, 15, 0.98)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 900
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                            labelFormatter={(label, payload) => payload?.[0]?.payload?.timestamp || label}
                            formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name.toUpperCase()]}
                        />

                        {/* main area */}
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={chartColor}
                            strokeWidth={3}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            animationDuration={1000}
                        />

                        {/* EMA Lines */}
                        <Area type="monotone" dataKey="ema9" stroke="#60a5fa" strokeWidth={1} fill="none" dot={false} strokeOpacity={0.4} isAnimationActive={false} />
                        <Area type="monotone" dataKey="ema21" stroke="#a78bfa" strokeWidth={1} fill="none" dot={false} strokeOpacity={0.4} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mt-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full" style={{ backgroundColor: chartColor, boxShadow: `0 0 10px ${chartColor}` }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Price Node</span>
                </div>
                <div className="flex items-center gap-2 opacity-30">
                    <div className="size-1.5 rounded-full bg-blue-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">EMA Cloud</span>
                </div>
            </div>
        </div>
    )
}