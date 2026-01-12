import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PredictionChart from './PredictionChart'
import { useState } from 'react'

export default function EducationalCard({ data }) {
    const [showAllIndicators, setShowAllIndicators] = useState(false)

    if (!data) return null

    // Handle error case (prevents crash)
    if (data.error) {
        return (
            <div className="educational-card error">
                <div className="card-header">
                    <div className="card-icon"><AlertCircle size={24} color="#ef4444" /></div>
                    <div className="card-title"><h3>Analysis Unavailable</h3></div>
                </div>
                <div className="card-body"><p>{data.message || data.error}</p></div>
            </div>
        )
    }

    // Safe access to bias to prevent crash
    const bias = data.bias || 'neutral'

    const getConfidenceColor = (confidence) => {
        if (confidence >= 70) return 'high'
        if (confidence >= 50) return 'medium'
        return 'low'
    }

    const getBiasIcon = (bias) => {
        if (bias === 'bullish') return <TrendingUp size={24} />
        if (bias === 'bearish') return <TrendingDown size={24} />
        return <AlertCircle size={24} />
    }

    const getBiasClass = (bias) => {
        if (bias === 'bullish') return 'bullish'
        if (bias === 'bearish') return 'bearish'
        return 'neutral'
    }

    // Combine all signals from confluences
    // Combine all signals from confluences
    const safeSignals = (arr) => Array.isArray(arr) ? arr : []

    const allSignals = [
        ...safeSignals(data.confluences?.bullish_signals).map(s => ({ ...s, type: 'bullish' })),
        ...safeSignals(data.confluences?.bearish_signals).map(s => ({ ...s, type: 'bearish' })),
        ...safeSignals(data.confluences?.neutral_signals).map(s => ({ ...s, type: 'neutral' }))
    ]

    // Fallback to old signals array only if safe
    const oldSignals = safeSignals(data.signals)
    const displaySignals = allSignals.length > 0 ? allSignals : oldSignals
    const signalsToShow = showAllIndicators ? displaySignals : displaySignals.slice(0, 6)

    return (
        <div className={`educational-card ${getBiasClass(data.bias)}`}>
            <div className="card-header">
                <div className="card-icon">
                    {getBiasIcon(bias)}
                </div>
                <div className="card-title">
                    <h4>{data.ticker} Analysis</h4>
                    <span className="card-subtitle">{data.interval} timeframe</span>
                </div>
            </div>

            <div className="card-body">
                {/* Price Chart */}
                {data.price_history && data.price_history.length > 0 && (
                    <PredictionChart
                        data={data.price_history}
                        support={data.key_levels?.support}
                        resistance={data.key_levels?.resistance}
                        currentPrice={data.current_price}
                        bias={data.bias}
                    />
                )}

                <div className="metric-row">
                    <div className="metric">
                        <span className="metric-label">Current Price</span>
                        <span className="metric-value">${data.current_price?.toFixed(2)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Bias</span>
                        <span className={`metric-value ${getBiasClass(bias)}`}>
                            {bias.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="confidence-bar">
                    <div className="confidence-label">
                        <span>Confidence</span>
                        <span className={`confidence-value ${getConfidenceColor(data.confidence)}`}>
                            {data.confidence || 0}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${getConfidenceColor(data.confidence)}`}
                            style={{ width: `${data.confidence || 0}%` }}
                        />
                    </div>
                </div>

                {data.is_synthetic && (
                    <div className="warning-banner">
                        <AlertCircle size={16} />
                        <span>Using demo data - Live data unavailable</span>
                    </div>
                )}

                <div className="signals-section">
                    <h5>📊 Technical Indicators ({displaySignals.length} total)</h5>
                    <div className="signals-grid">
                        {signalsToShow.map((signal, index) => {
                            // Handle both old format (string) and new format (object)
                            const isObject = typeof signal === 'object'
                            const displayText = isObject ? signal.indicator : signal.replace(/_/g, ' ')
                            const signalType = isObject ? signal.type : 'neutral'

                            return (
                                <div key={index} className={`signal-chip ${signalType}`} title={isObject ? signal.condition : ''}>
                                    <CheckCircle size={14} />
                                    <span>{displayText}</span>
                                    {isObject && signal.strength && (
                                        <span className="signal-strength">{signal.strength}</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {displaySignals.length > 6 && (
                        <button
                            className="show-more-btn"
                            onClick={() => setShowAllIndicators(!showAllIndicators)}
                        >
                            {showAllIndicators ? (
                                <>
                                    <ChevronUp size={16} />
                                    Show Less
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={16} />
                                    Show {displaySignals.length - 6} More Indicators
                                </>
                            )}
                        </button>
                    )}
                </div>

                {data.key_levels && (
                    <div className="levels-section">
                        <h5>🎯 Key Levels</h5>
                        <div className="levels-grid">
                            <div className="level">
                                <span className="level-label">Support</span>
                                <span className="level-value support">${data.key_levels.support?.toFixed(2)}</span>
                            </div>
                            <div className="level">
                                <span className="level-label">Resistance</span>
                                <span className="level-value resistance">${data.key_levels.resistance?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="card-footer">
                <div className="beginner-tip">
                    <strong>💡 What this means:</strong>
                    <p>{data.explanation}</p>
                </div>
            </div>
        </div>
    )
}
