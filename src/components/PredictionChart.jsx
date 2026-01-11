import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function PredictionChart({ data, support, resistance, currentPrice, bias }) {
    if (!data || data.length === 0) return null

    // Determine chart color based on bias
    const chartColor = bias === 'bullish' ? '#22c55e' : bias === 'bearish' ? '#ef4444' : '#6366f1'
    const gradientId = `colorPrice${Math.random()}`

    // Memoize chart data transformation to prevent recalculation on every render
    const chartData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            index: index,
            displayTime: index % 10 === 0 ? item.timestamp.split(' ')[0] : '' // Show every 10th label
        }))
    }, [data])

    return (
        <div className="prediction-chart">
            <div className="chart-header">
                <h5>📈 Price Chart (Last {data.length} Periods)</h5>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis
                        dataKey="displayTime"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                        }}
                        labelFormatter={(label, payload) => {
                            if (payload && payload[0]) {
                                return payload[0].payload.timestamp
                            }
                            return label
                        }}
                        formatter={(value, name) => {
                            if (name === 'price') return [`$${value.toFixed(2)}`, 'Price']
                            if (name === 'ema9') return [`$${value.toFixed(2)}`, 'EMA 9']
                            if (name === 'ema21') return [`$${value.toFixed(2)}`, 'EMA 21']
                            return [value, name]
                        }}
                    />

                    {/* Support Line */}
                    {support && (
                        <ReferenceLine
                            y={support}
                            stroke="#22c55e"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                                value: `Support: $${support.toFixed(2)}`,
                                position: 'left',
                                fill: '#22c55e',
                                fontSize: 10,
                                fontWeight: 600
                            }}
                        />
                    )}

                    {/* Resistance Line */}
                    {resistance && (
                        <ReferenceLine
                            y={resistance}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            strokeWidth={1.5}
                            label={{
                                value: `Resistance: $${resistance.toFixed(2)}`,
                                position: 'left',
                                fill: '#ef4444',
                                fontSize: 10,
                                fontWeight: 600
                            }}
                        />
                    )}

                    {/* EMA Lines */}
                    <Area
                        type="monotone"
                        dataKey="ema9"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        fill="none"
                        dot={false}
                        strokeOpacity={0.6}
                        isAnimationActive={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="ema21"
                        stroke="#8b5cf6"
                        strokeWidth={1}
                        fill="none"
                        dot={false}
                        strokeOpacity={0.6}
                        isAnimationActive={false}
                    />

                    {/* Main Price Area */}
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke={chartColor}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        animationDuration={300}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <div className="chart-legend">
                <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: chartColor }}></div>
                    <span>Price</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                    <span>EMA 9</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot" style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span>EMA 21</span>
                </div>
            </div>
        </div>
    )
}
