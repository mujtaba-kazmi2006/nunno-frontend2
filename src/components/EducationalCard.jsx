import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import PredictionChart from './PredictionChart'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function EducationalCard({ data }) {
    const [showAllIndicators, setShowAllIndicators] = useState(false)

    if (!data) return null

    // Helper: Safely access bias
    const safeBias = data.bias || 'neutral';

    // Handle error case
    if (data.error) {
        return (
            <div className="educational-card error bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
                <div className="card-header border-red-100 dark:border-red-900/20">
                    <div className="card-icon text-red-500">
                        <AlertCircle size={24} />
                    </div>
                    <div className="card-title">
                        <h4 className="text-red-900 dark:text-red-400">Analysis Error</h4>
                        <span className="card-subtitle text-red-600 dark:text-red-500/70">{data.ticker}</span>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-red-700 dark:text-red-400/80 p-4 font-medium">{data.message || data.error}</p>
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
        <div className={`educational-card ${getBiasClass(safeBias)} border border-white/10 bg-white/[0.02] backdrop-blur-lg rounded-[2.5rem] overflow-hidden shadow-2xl`}>
            <div className="card-header border-b border-white/5 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`card-icon p-3 rounded-2xl ${getBiasClass(safeBias)} shadow-lg`}>
                        {getBiasIcon(safeBias)}
                    </div>
                    <div className="card-title">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter dark:text-white">{data.ticker} <span className="text-purple-500">Analysis</span></h4>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{data.interval} timeframe intelligence</span>
                    </div>
                </div>
            </div>

            <div className="card-body p-6 space-y-8">
                {/* Price Chart */}
                {Array.isArray(data.price_history) && data.price_history.length > 0 && (
                    <div className="rounded-3xl overflow-hidden border border-white/5 bg-black/20 p-2">
                        <PredictionChart
                            data={data.price_history}
                            support={data.key_levels?.support}
                            resistance={data.key_levels?.resistance}
                            currentPrice={data.current_price}
                            bias={safeBias}
                            supportResistance={data.support_resistance || []}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                    <div className="metric flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Market Price</span>
                        <span className="text-2xl font-black italic tracking-tighter dark:text-white">
                            ${typeof data.current_price === 'number' ? data.current_price.toFixed(2) : (data.current_price || '0.00')}
                        </span>
                    </div>
                    <div className="metric flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Bias</span>
                        <span className={`text-2xl font-black italic tracking-tighter uppercase ${getBiasClass(safeBias)}`}>
                            {safeBias}
                        </span>
                    </div>
                </div>

                <div className="confidence-bar space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500 italic">Analysis Confidence</span>
                        <span className={`${getConfidenceColor(data.confidence)}`}>
                            {data.confidence}% Accuracy
                        </span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.confidence}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full progress-fill ${getConfidenceColor(data.confidence)} shadow-[0_0_10px_currentColor]`}
                        />
                    </div>
                </div>

                {data.is_synthetic && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3 text-amber-500 text-[10px] font-black uppercase tracking-[0.1em]">
                        <AlertCircle size={14} />
                        <span>Simulated Data Node Active</span>
                    </div>
                )}

                <div className="signals-section space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.3em] italic text-slate-400">Technical Confluences</h5>
                    <div className="flex flex-wrap gap-2">
                        {signalsToShow.map((signal, index) => {
                            const isObject = typeof signal === 'object'
                            const displayText = isObject ? signal.indicator : signal.replace(/_/g, ' ')
                            const signalType = isObject ? signal.type : 'neutral'

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-tight transition-all ${signalType === 'bullish' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        signalType === 'bearish' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                            'bg-white/5 border-white/10 text-slate-400'
                                        }`}
                                >
                                    <CheckCircle size={10} />
                                    <span>{displayText}</span>
                                    {isObject && signal.strength && (
                                        <span className="ml-1 opacity-50">[{signal.strength}]</span>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>

                    {displaySignals.length > 6 && (
                        <button
                            className="w-full py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:bg-white/10 hover:text-white transition-all italic flex items-center justify-center gap-2"
                            onClick={() => setShowAllIndicators(!showAllIndicators)}
                        >
                            {showAllIndicators ? (
                                <>
                                    <ChevronUp size={14} />
                                    Collapse Data
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={14} />
                                    Reveal {displaySignals.length - 6} Hidden Signals
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-[1.5rem] bg-emerald-500/[0.03] border border-emerald-500/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 block mb-1">Floor</span>
                        <span className="text-sm font-mono font-black text-emerald-400">
                            ${typeof data.key_levels?.support === 'number' ? data.key_levels.support.toFixed(2) : (data.key_levels?.support || '0.00')}
                        </span>
                    </div>
                    <div className="p-4 rounded-[1.5rem] bg-rose-500/[0.03] border border-rose-500/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 block mb-1">Ceiling</span>
                        <span className="text-sm font-mono font-black text-rose-400">
                            ${typeof data.key_levels?.resistance === 'number' ? data.key_levels.resistance.toFixed(2) : (data.key_levels?.resistance || '0.00')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="card-footer bg-black/40 p-6 border-t border-white/5">
                <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 italic">Neural Interpretation:</span>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">{data.explanation}</p>
                </div>
            </div>
        </div>
    )
}