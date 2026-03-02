import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw, Waves, ArrowUpRight, ArrowDownRight, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * OnChainBiasPanel — Displays real-time on-chain intelligence for BTC and ETH.
 * Data is computed once on the server (every 15 min) and cached for mass users.
 * Zero per-user cost.
 */
export default function OnChainBiasPanel({ symbol }) {
    const { theme } = useTheme();
    const [scores, setScores] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determine which asset to highlight based on the active chart symbol
    const activeAsset = symbol?.includes('BTC') ? 'BTC' : symbol?.includes('ETH') ? 'ETH' : 'BTC';

    const fetchScores = useCallback(async () => {
        try {
            const resp = await fetch(`${API_URL}/api/v1/onchain/scores`);
            const data = await resp.json();
            if (data && Object.keys(data).length > 0) {
                setScores(data);
                setError(null);
            }
        } catch (e) {
            console.error('On-chain fetch error:', e);
            setError('Unavailable');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScores();
        const interval = setInterval(fetchScores, 60000); // Refresh every 60s (from cache, instant)
        return () => clearInterval(interval);
    }, [fetchScores]);

    const getTrendIcon = (trend) => {
        if (!trend) return <Minus size={14} />;
        if (trend.includes('Bullish')) return <TrendingUp size={14} />;
        if (trend.includes('Bearish')) return <TrendingDown size={14} />;
        return <Minus size={14} />;
    };

    const getTrendColor = (trend) => {
        if (!trend) return 'text-slate-400';
        if (trend.includes('Bullish')) return 'text-emerald-400';
        if (trend.includes('Bearish')) return 'text-rose-400';
        return 'text-amber-400';
    };

    const getScoreBarColor = (score) => {
        if (score > 0.2) return 'from-emerald-500 to-emerald-400';
        if (score < -0.2) return 'from-rose-500 to-rose-400';
        return 'from-amber-500 to-amber-400';
    };

    const formatFlow = (value) => {
        if (!value && value !== 0) return 'N/A';
        const abs = Math.abs(value);
        if (abs >= 1e9) return `${value > 0 ? '+' : '-'}$${(abs / 1e9).toFixed(1)}B`;
        if (abs >= 1e6) return `${value > 0 ? '+' : '-'}$${(abs / 1e6).toFixed(1)}M`;
        if (abs >= 1e3) return `${value > 0 ? '+' : '-'}$${(abs / 1e3).toFixed(0)}K`;
        return `${value > 0 ? '+' : '-'}$${abs.toFixed(0)}`;
    };

    if (loading) {
        return (
            <div className={cn(
                "rounded-2xl p-4 animate-pulse",
                theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'
            )}>
                <div className="h-4 w-32 bg-slate-700/30 rounded mb-3" />
                <div className="space-y-2">
                    <div className="h-10 bg-slate-700/20 rounded-xl" />
                    <div className="h-10 bg-slate-700/20 rounded-xl" />
                </div>
            </div>
        );
    }

    if (error || !scores) {
        return (
            <div className={cn(
                "rounded-2xl p-4",
                theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <Link2 size={14} className="text-purple-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">On-Chain Intel</span>
                </div>
                <p className="text-[10px] text-slate-500">Engine warming up...</p>
            </div>
        );
    }

    const assets = ['BTC', 'ETH'];

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden transition-all",
            theme === 'dark' ? 'bg-white/[0.02]' : 'bg-white shadow-sm'
        )}>
            {/* Header */}
            <div className={cn(
                "flex items-center justify-between px-4 py-3",
                theme === 'dark' ? "bg-white/5" : "bg-slate-50"
            )}>
                <div className="flex items-center gap-2">
                    <Waves size={14} className="text-purple-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">
                        On-Chain Bias
                    </span>
                </div>
                <button onClick={fetchScores} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                    <RefreshCw size={12} />
                </button>
            </div>

            {/* Asset Cards */}
            <div className="p-3 space-y-2">
                {assets.map(asset => {
                    const data = scores[asset];
                    if (!data) return null;

                    const isActive = asset === activeAsset;
                    const score = data.score || 0;
                    const barWidth = Math.abs(score) * 100;
                    const barPosition = score >= 0 ? 50 : 50 - barWidth;

                    return (
                        <motion.div
                            key={asset}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "rounded-xl p-3 transition-all",
                                isActive
                                    ? (theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100/50')
                                    : (theme === 'dark' ? 'bg-white/[0.02]' : 'bg-slate-50')
                            )}
                        >
                            {/* Asset Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-xs font-black",
                                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                                    )}>{asset}</span>
                                    <span className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold",
                                        getTrendColor(data.trend)
                                    )}>
                                        {getTrendIcon(data.trend)}
                                        {data.trend}
                                    </span>
                                </div>
                                <span className={cn(
                                    "text-sm font-black font-mono tabular-nums",
                                    getTrendColor(data.trend)
                                )}>
                                    {score > 0 ? '+' : ''}{score.toFixed(2)}
                                </span>
                            </div>

                            {/* Score Bar */}
                            <div className={cn(
                                "relative h-2 rounded-full overflow-hidden mb-3",
                                theme === 'dark' ? 'bg-white/5' : 'bg-slate-200'
                            )}>
                                {/* Center line */}
                                <div className="absolute left-1/2 top-0 w-px h-full bg-slate-500/30 z-10" />
                                {/* Score fill */}
                                <div
                                    className={cn("absolute top-0 h-full rounded-full bg-gradient-to-r transition-all duration-500", getScoreBarColor(score))}
                                    style={{ left: `${barPosition}%`, width: `${barWidth}%` }}
                                />
                            </div>

                            {/* Metric Pills */}
                            <div className="flex gap-1.5 flex-wrap">
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold",
                                    theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-500'
                                )}>
                                    <span className="opacity-50">Whale</span>
                                    <span className={data.whale_score > 0 ? 'text-emerald-400' : data.whale_score < 0 ? 'text-rose-400' : 'text-slate-400'}>
                                        {data.whale_score > 0 ? '+' : ''}{(data.whale_score || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold",
                                    theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-500'
                                )}>
                                    <span className="opacity-50">Exchange</span>
                                    <span className={data.exchange_score > 0 ? 'text-emerald-400' : data.exchange_score < 0 ? 'text-rose-400' : 'text-slate-400'}>
                                        {data.exchange_score > 0 ? '+' : ''}{(data.exchange_score || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold",
                                    theme === 'dark' ? 'bg-white/5 text-slate-400' : 'bg-white text-slate-500'
                                )}>
                                    <span className="opacity-50">Activity</span>
                                    <span className={data.activity_score > 0 ? 'text-emerald-400' : data.activity_score < 0 ? 'text-rose-400' : 'text-slate-400'}>
                                        {data.activity_score > 0 ? '+' : ''}{(data.activity_score || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className={cn(
                "px-4 py-2 text-center",
                theme === 'dark' ? "opacity-50" : "bg-slate-50 opacity-100"
            )}>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    Updated every 15m · Free public chain data
                </span>
            </div>
        </div>
    );
}
