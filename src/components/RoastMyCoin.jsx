import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertTriangle, Shield, TrendingDown, Volume2, Activity, Target } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

const RoastMyCoin = () => {
    const { theme } = useTheme();
    const [symbol, setSymbol] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRoast = async () => {
        if (!symbol.trim()) {
            setError('Coin symbol enter karo! (Enter a coin symbol!)');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/critic/roast`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    symbol: symbol.toUpperCase().trim(),
                    timeframe: '1h'
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError('Kuch gadbad ho gayi. Phir se try karo. (Something went wrong. Try again.)');
            console.error('Roast error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (riskScore) => {
        if (riskScore >= 80) return 'from-rose-500 to-red-600';
        if (riskScore >= 60) return 'from-orange-500 to-rose-500';
        if (riskScore >= 40) return 'from-yellow-500 to-orange-500';
        if (riskScore >= 20) return 'from-blue-500 to-cyan-500';
        return 'from-emerald-500 to-green-500';
    };

    const getRiskIcon = (verdict) => {
        switch (verdict) {
            case 'EXTREME_DANGER':
                return <Flame className="w-12 h-12 text-rose-500 animate-pulse" />;
            case 'HIGH_RISK':
                return <AlertTriangle className="w-12 h-12 text-orange-500" />;
            case 'MEDIUM_RISK':
                return <Activity className="w-12 h-12 text-yellow-500" />;
            case 'LOW_RISK':
                return <Target className="w-12 h-12 text-blue-500" />;
            default:
                return <Shield className="w-12 h-12 text-emerald-500" />;
        }
    };

    const getVerdictText = (verdict) => {
        const verdicts = {
            'EXTREME_DANGER': 'KHATRE KA SIGNAL!',
            'HIGH_RISK': 'HIGH RISK!',
            'MEDIUM_RISK': 'MEDIUM RISK',
            'LOW_RISK': 'LOW RISK',
            'RELATIVELY_SAFE': 'RELATIVELY SAFE'
        };
        return verdicts[verdict] || verdict;
    };

    return (
        <div className={cn(
            "rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border",
            theme === 'dark'
                ? "bg-white/[0.02] border-white/10"
                : "bg-white border-slate-200"
        )}>
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
                </div>
                <div>
                    <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                        Roast My Coin
                    </h2>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Haqeeqat Check (Reality Check)
                    </p>
                </div>
            </div>

            {/* Input Section */}
            <div className="space-y-3 sm:space-y-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleRoast()}
                        placeholder="Enter coin (e.g., BTCUSDT)"
                        className={cn(
                            "flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg outline-none transition-all",
                            theme === 'dark'
                                ? "bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-rose-500/50"
                                : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500"
                        )}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRoast}
                        disabled={loading}
                        className={cn(
                            "w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg",
                            loading
                                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                : "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-500/20"
                        )}
                    >
                        {loading ? 'Analyzing...' : 'Roast It!'}
                    </motion.button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold"
                    >
                        {error}
                    </motion.div>
                )}
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Risk Score Meter */}
                        <div className={cn(
                            "p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border relative overflow-hidden",
                            theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                        )}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex-shrink-0">
                                        {getRiskIcon(result.verdict)}
                                    </div>
                                    <div>
                                        <div className="text-2xl sm:text-3xl font-black italic text-white mb-1">
                                            {getVerdictText(result.verdict)}
                                        </div>
                                        <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Risk Score: {result.risk_score}/100
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Meter */}
                            <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-8">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${result.risk_score}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn(
                                        "h-full rounded-full bg-gradient-to-r",
                                        getRiskColor(result.risk_score)
                                    )}
                                />
                            </div>

                            {/* The Roast */}
                            <div className={cn(
                                "p-6 rounded-2xl border",
                                theme === 'dark' ? "bg-black/20 border-white/5" : "bg-white border-slate-200"
                            )}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Volume2 className="w-5 h-5 text-rose-500" />
                                    <h3 className="font-black uppercase text-white text-sm tracking-widest">
                                        Nunno's Roast
                                    </h3>
                                </div>
                                <p className="text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                                    {result.roast}
                                </p>
                            </div>

                            {/* Advice */}
                            {result.advice && (
                                <div className={cn(
                                    "mt-4 p-6 rounded-2xl border",
                                    theme === 'dark' ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-200"
                                )}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-black uppercase text-purple-400 text-sm tracking-widest">
                                            Advice
                                        </h3>
                                    </div>
                                    <p className="text-purple-200 font-medium leading-relaxed">
                                        {result.advice}
                                    </p>
                                </div>
                            )}

                            {/* Risk Details */}
                            {result.details && (
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                    {Object.entries(result.details).map(([key, data]) => (
                                        <div
                                            key={key}
                                            className={cn(
                                                "p-3 sm:p-4 rounded-xl border",
                                                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-white border-slate-200"
                                            )}
                                        >
                                            <div className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                                {key.replace('_', ' ')}
                                            </div>
                                            <div className={cn(
                                                "text-base sm:text-lg font-black italic",
                                                data.score >= 20 ? "text-rose-500" :
                                                    data.score >= 10 ? "text-orange-500" :
                                                        data.score >= 5 ? "text-yellow-500" :
                                                            "text-emerald-500"
                                            )}>
                                                {data.status?.replace('_', ' ')}
                                            </div>
                                            {data.value && (
                                                <div className="text-[10px] sm:text-xs text-slate-400 font-bold mt-1">
                                                    {data.value}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty State */}
            {!result && !loading && (
                <div className="text-center py-12">
                    <Flame className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-500 font-bold">
                        Koi coin enter karo aur dekho kya haqeeqat hai!
                    </p>
                    <p className="text-slate-600 text-sm mt-2">
                        (Enter a coin and see the reality!)
                    </p>
                </div>
            )}
        </div>
    );
};

export default RoastMyCoin;
