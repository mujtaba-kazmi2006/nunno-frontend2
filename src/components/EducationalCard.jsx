import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'
import PredictionChart from './PredictionChart'

export default function EducationalCard({ data }) {
    if (!data) return null

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

    return (
        <div className={`educational-card ${getBiasClass(data.bias)}`}>
            <div className="card-header">
                <div className="card-icon">
                    {getBiasIcon(data.bias)}
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
                        <span className={`metric-value ${getBiasClass(data.bias)}`}>
                            {data.bias.toUpperCase()}
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
                    <h5>📊 Key Signals</h5>
                    <div className="signals-grid">
                        {data.signals?.slice(0, 4).map((signal, index) => (
                            <div key={index} className="signal-chip">
                                <CheckCircle size={14} />
                                <span>{signal.replace(/_/g, ' ')}</span>
                            </div>
                        ))}
                    </div>
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
