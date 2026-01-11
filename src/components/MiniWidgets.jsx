import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Thermometer } from 'lucide-react'
import { API_ENDPOINTS } from '../config/api'
import useBinanceWebSocket from '../hooks/useBinanceWebSocket'

export default function MiniWidgets() {
    const { prices, isConnected } = useBinanceWebSocket(['BTCUSDT', 'ETHUSDT'])
    const [btcData, setBtcData] = useState(null)
    const [ethData, setEthData] = useState(null)
    const [temperature, setTemperature] = useState(50)
    const [sentiment, setSentiment] = useState('Neutral')
    const [isExpanded, setIsExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    // Update BTC and ETH data from WebSocket
    useEffect(() => {
        if (prices['BTCUSDT']) {
            setBtcData(prices['BTCUSDT'])
            setLoading(false)
        }
        if (prices['ETHUSDT']) {
            setEthData(prices['ETHUSDT'])
            setLoading(false)
        }
    }, [prices])

    // Fetch market sentiment separately (less frequent updates)
    useEffect(() => {
        fetchSentiment()
        const interval = setInterval(fetchSentiment, 60000) // Every 60 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchSentiment = async () => {
        try {
            const sentimentResponse = await fetch(API_ENDPOINTS.NEWS('BTCUSDT'))
            const sentimentData = await sentimentResponse.json()
            if (sentimentData.fear_greed_index) {
                setTemperature(sentimentData.fear_greed_index.value)
                setSentiment(sentimentData.sentiment)
            }
        } catch (error) {
            console.error('Failed to fetch sentiment data:', error)
        }
    }

    const getTemperatureColor = (temp) => {
        if (temp <= 25) return '#ef4444'
        if (temp <= 45) return '#f97316'
        if (temp <= 55) return '#eab308'
        if (temp <= 75) return '#84cc16'
        return '#22c55e'
    }

    const getTemperatureEmoji = (temp) => {
        if (temp <= 25) return '🔴'
        if (temp <= 45) return '🟠'
        if (temp <= 55) return '🟡'
        if (temp <= 75) return '🟢'
        return '🟢'
    }

    const getTemperatureLabel = (temp) => {
        if (temp <= 25) return 'Extreme Fear'
        if (temp <= 45) return 'Fear'
        if (temp <= 55) return 'Neutral'
        if (temp <= 75) return 'Greed'
        return 'Extreme Greed'
    }

    if (loading) {
        return (
            <div className="mini-widgets">
                <div className="mini-widget-loading">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="mini-widgets">
            <div className="mini-widgets-container">
                {/* Compact View */}
                <div className="mini-widgets-compact">
                    {/* Market Temperature */}
                    <div className="mini-widget-item">
                        <span className="mini-widget-icon">{getTemperatureEmoji(temperature)}</span>
                        <span className="mini-widget-value" style={{ color: getTemperatureColor(temperature) }}>
                            {temperature}
                        </span>
                    </div>

                    {/* BTC Price */}
                    {btcData && (
                        <div className="mini-widget-item">
                            <span className="mini-widget-label">₿</span>
                            <span className="mini-widget-value">
                                ${btcData.current_price >= 1000
                                    ? `${(btcData.current_price / 1000).toFixed(1)}k`
                                    : btcData.current_price.toFixed(0)}
                            </span>
                            <span className={`mini-widget-change ${btcData.percent_change >= 0 ? 'positive' : 'negative'}`}>
                                {btcData.percent_change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {Math.abs(btcData.percent_change).toFixed(1)}%
                            </span>
                        </div>
                    )}

                    {/* ETH Price */}
                    {ethData && (
                        <div className="mini-widget-item">
                            <span className="mini-widget-label">⬨</span>
                            <span className="mini-widget-value">
                                ${ethData.current_price >= 1000
                                    ? `${(ethData.current_price / 1000).toFixed(1)}k`
                                    : ethData.current_price.toFixed(0)}
                            </span>
                            <span className={`mini-widget-change ${ethData.percent_change >= 0 ? 'positive' : 'negative'}`}>
                                {ethData.percent_change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {Math.abs(ethData.percent_change).toFixed(1)}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Expand/Collapse Button */}
                <button
                    className="mini-widgets-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label={isExpanded ? "Collapse widgets" : "Expand widgets"}
                >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* Expanded View */}
                {isExpanded && (
                    <div className="mini-widgets-expanded">
                        {/* Market Temperature Details */}
                        <div className="mini-widget-expanded-item">
                            <div className="mini-widget-expanded-header">
                                <Thermometer size={14} />
                                <span>Market Temperature</span>
                            </div>
                            <div className="mini-widget-expanded-value" style={{ color: getTemperatureColor(temperature) }}>
                                {temperature} - {getTemperatureLabel(temperature)}
                            </div>
                        </div>

                        {/* BTC Details */}
                        {btcData && (
                            <div className="mini-widget-expanded-item">
                                <div className="mini-widget-expanded-header">
                                    <span>Bitcoin</span>
                                </div>
                                <div className="mini-widget-expanded-value">
                                    ${btcData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={`mini-widget-expanded-change ${btcData.percent_change >= 0 ? 'positive' : 'negative'}`}>
                                    {btcData.percent_change >= 0 ? '▲' : '▼'} {Math.abs(btcData.percent_change).toFixed(2)}%
                                </div>
                            </div>
                        )}

                        {/* ETH Details */}
                        {ethData && (
                            <div className="mini-widget-expanded-item">
                                <div className="mini-widget-expanded-header">
                                    <span>Ethereum</span>
                                </div>
                                <div className="mini-widget-expanded-value">
                                    ${ethData.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className={`mini-widget-expanded-change ${ethData.percent_change >= 0 ? 'positive' : 'negative'}`}>
                                    {ethData.percent_change >= 0 ? '▲' : '▼'} {Math.abs(ethData.percent_change).toFixed(2)}%
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
