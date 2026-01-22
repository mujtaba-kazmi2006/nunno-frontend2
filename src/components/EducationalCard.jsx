import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PredictionChart from './PredictionChart'
import { useState } from 'react'

export default function EducationalCard({ data }) {
    const [showAllIndicators, setShowAllIndicators] = useState(false)

    if (!data) return null

    // Helper: Safely access bias
    const safeBias = data.bias || 'neutral';

    // Handle error case
    if (data.error) {
        return (
            <div className="educational-card error">
                <div className="card-header">
                    <div className="card-icon text-red-500">
                        <AlertCircle size={24} />
                    </div>
                    <div className="card-title">
                        <h4>Analysis Error</h4>
                        <span className="card-subtitle">{data.ticker}</span>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-red-400 p-4">{data.message || data.error}</p>
                </div>
            </div>
        )
    }

    const getConfidenceColor = (confidence) => {
        if (typeof confidence !== 'number') return 'low'
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
    const safeConfluences = data.confluences || {}
    const allSignals = [
        ...(Array.isArray(safeConfluences.bullish_signals) ? safeConfluences.bullish_signals : []).map(s => ({ ...s, type: 'bullish' })),
        ...(Array.isArray(safeConfluences.bearish_signals) ? safeConfluences.bearish_signals : []).map(s => ({ ...s, type: 'bearish' })),
        ...(Array.isArray(safeConfluences.neutral_signals) ? safeConfluences.neutral_signals : []).map(s => ({ ...s, type: 'neutral' }))
    ]

    // Fallback to old signals array if confluences not available
    const displaySignals = allSignals.length > 0 ? allSignals : (data.signals || [])
    const signalsToShow = showAllIndicators ? displaySignals : displaySignals.slice(0, 6)

    return (
        <div className={`educational-card ${getBiasClass(safeBias)}`}>
            <div className="card-header">
                <div className="card-icon">
                    {getBiasIcon(safeBias)}
                </div>
                <div className="card-title">
                    <h4>{data.ticker} Analysis</h4>
                    <span className="card-subtitle">{data.interval} timeframe</span>
                </div>
            </div>

            <div className="card-body">
                {/* Price Chart */}
                {Array.isArray(data.price_history) && data.price_history.length > 0 && (
                    <PredictionChart
                        data={data.price_history}
                        support={data.key_levels?.support}
                        resistance={data.key_levels?.resistance}
                        currentPrice={data.current_price}
                        bias={safeBias}
                        supportResistance={data.support_resistance || []}
                    />
                )}

                <div className="metric-row">
                    <div className="metric">
                        <span className="metric-label">Current Price</span>
                        <span className="metric-value">${data.current_price?.toFixed(2)}</span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Bias</span>
                        <span className={`metric-value ${getBiasClass(safeBias)}`}>
                            {safeBias.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="confidence-bar">
                    <div className="confidence-label">
                        <span>Confidence</span>
                        <span className={`confidence-value ${getConfidenceColor(data.confidence)}`}>
                            {data.confidence}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${getConfidenceColor(data.confidence)}`}
                            style={{ width: `${data.confidence}%` }}
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
                
                {/* Display additional support/resistance levels */}
                {data.support_resistance && data.support_resistance.length > 0 && (
                    <div className="additional-levels-section">
                        <h5>🔍 Detailed Support & Resistance Levels:</h5>
                        <div className="levels-list">
                            {data.support_resistance.map((level, index) => (
                                <div key={index} className="level-item">
                                    <span className={`level-type ${level.type}`}>
                                        {level.type.toUpperCase()}:
                                    </span>
                                    <span className="level-price">${Number(level.price).toFixed(2)}</span>
                                    <span className="level-strength">({level.strength})</span>
                                    {level.touches && (
                                        <span className="level-touches">Touches: {level.touches}</span>
                                    )}
                                </div>
                            ))}
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