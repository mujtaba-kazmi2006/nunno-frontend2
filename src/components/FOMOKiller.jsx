import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, TrendingUp, Shield, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

const FOMOKiller = ({ watchlist = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'] }) => {
    const { theme } = useTheme();
    const [activeWarnings, setActiveWarnings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [lastScan, setLastScan] = useState(null);

    const scanForFOMO = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/fomo/scan`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    symbols: watchlist,
                    timeframe: '15m'
                })
            });

            if (!response.ok) {
                throw new Error('FOMO scan failed');
            }

            const data = await response.json();
            setActiveWarnings(data.warnings || []);
            setLastScan(new Date());
        } catch (err) {
            console.error('FOMO scan error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scanForFOMO();

        // Auto-refresh every 5 minutes
        const interval = setInterval(scanForFOMO, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getWarningColor = (level) => {
        switch (level) {
            case 'EXTREME':
                return 'from-rose-500 to-red-600';
            case 'HIGH':
                return 'from-orange-500 to-rose-500';
            case 'MEDIUM':
                return 'from-yellow-500 to-orange-500';
            default:
                return 'from-blue-500 to-cyan-500';
        }
    };

    const getWarningIcon = (level) => {
        switch (level) {
            case 'EXTREME':
                return '🚨';
            case 'HIGH':
                return '⚠️';
            case 'MEDIUM':
                return '⚡';
            default:
                return '📊';
        }
    };

    return (
        <div className={cn(
            "rounded-3xl border overflow-hidden",
            theme === 'dark'
                ? "bg-white/[0.02] border-white/10"
                : "bg-white border-slate-200"
        )}>
            {/* Header */}
            <div
                className={cn(
                    "p-6 cursor-pointer transition-colors",
                    theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50"
                )}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                            <AlertOctagon className="w-6 h-6 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
                                FOMO Killer
                            </h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Don't Buy The Top!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeWarnings.length > 0 && (
                            <div className="px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/30">
                                <span className="text-rose-400 font-black text-sm">
                                    {activeWarnings.length} Warning{activeWarnings.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        )}
                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                            {/* Scan Info */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest gap-2 sm:gap-0">
                                <span>Monitoring {watchlist.length} Coins</span>
                                {lastScan && (
                                    <span className="text-[9px] sm:text-xs">
                                        Last scan: {lastScan.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>

                            {/* Warnings List */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                                    <p className="text-slate-500 font-bold mt-4">Scanning markets...</p>
                                </div>
                            ) : activeWarnings.length > 0 ? (
                                <div className="space-y-3">
                                    {activeWarnings.map((warning, index) => (
                                        <FOMOWarningCard key={index} warning={warning} theme={theme} />
                                    ))}
                                </div>
                            ) : (
                                <div className={cn(
                                    "text-center py-12 rounded-2xl border",
                                    theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                )}>
                                    <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                    <p className="text-emerald-400 font-black text-lg mb-2">
                                        All Clear! ✅
                                    </p>
                                    <p className="text-slate-500 font-bold text-sm">
                                        No FOMO signals detected. Markets look healthy!
                                    </p>
                                </div>
                            )}

                            {/* Refresh Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={scanForFOMO}
                                disabled={loading}
                                className={cn(
                                    "w-full py-3 rounded-xl font-black uppercase tracking-widest text-sm transition-all",
                                    loading
                                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                        : "bg-purple-600 text-white hover:bg-purple-500"
                                )}
                            >
                                {loading ? 'Scanning...' : 'Scan Again'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FOMOWarningCard = ({ warning, theme }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getWarningColor = (level) => {
        switch (level) {
            case 'EXTREME':
                return 'border-rose-500/30 bg-rose-500/10';
            case 'HIGH':
                return 'border-orange-500/30 bg-orange-500/10';
            case 'MEDIUM':
                return 'border-yellow-500/30 bg-yellow-500/10';
            default:
                return 'border-blue-500/30 bg-blue-500/10';
        }
    };

    const getWarningTextColor = (level) => {
        switch (level) {
            case 'EXTREME':
                return 'text-rose-400';
            case 'HIGH':
                return 'text-orange-400';
            case 'MEDIUM':
                return 'text-yellow-400';
            default:
                return 'text-blue-400';
        }
    };

    const getWarningIcon = (level) => {
        switch (level) {
            case 'EXTREME':
                return '🚨';
            case 'HIGH':
                return '⚠️';
            case 'MEDIUM':
                return '⚡';
            default:
                return '📊';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-2xl border p-5 cursor-pointer transition-all",
                getWarningColor(warning.warning_level),
                showDetails && "ring-2 ring-purple-500/50"
            )}
            onClick={() => setShowDetails(!showDetails)}
        >
            <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl flex-shrink-0">{getWarningIcon(warning.warning_level)}</span>
                    <div>
                        <h3 className="text-base sm:text-lg font-black italic text-white">
                            {warning.symbol}
                        </h3>
                        <p className={cn(
                            "text-[10px] sm:text-xs font-black uppercase tracking-widest",
                            getWarningTextColor(warning.warning_level)
                        )}>
                            {warning.warning_level} FOMO ALERT
                        </p>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-base sm:text-lg font-black text-white">
                        ${warning.current_price?.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Main Message */}
            <div className={cn(
                "p-3 sm:p-4 rounded-xl border mb-3",
                theme === 'dark' ? "bg-black/20 border-white/5" : "bg-white border-slate-200"
            )}>
                <p className="text-slate-200 font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                    {warning.message}
                </p>
            </div>

            {/* Advice */}
            {warning.advice && (
                <div className={cn(
                    "p-3 sm:p-4 rounded-xl border",
                    theme === 'dark' ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 border-purple-200"
                )}>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-purple-400">
                            What To Do
                        </span>
                    </div>
                    <p className="text-purple-200 font-medium text-xs sm:text-sm leading-relaxed">
                        {warning.advice}
                    </p>
                </div>
            )}

            {/* Details Toggle */}
            {warning.signals && warning.signals.length > 0 && (
                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-2"
                        >
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                                Detected Signals:
                            </div>
                            {warning.signals.map((signal, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-3 rounded-lg border text-sm",
                                        theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-300">
                                            {signal.type?.replace('_', ' ')}
                                        </span>
                                        <span className={cn(
                                            "text-xs font-black px-2 py-1 rounded-full",
                                            signal.severity === 'EXTREME' ? "bg-rose-500/20 text-rose-400" :
                                                signal.severity === 'HIGH' ? "bg-orange-500/20 text-orange-400" :
                                                    "bg-yellow-500/20 text-yellow-400"
                                        )}>
                                            {signal.severity}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1 font-medium">
                                        {signal.message}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <div className="text-center mt-3">
                <span className="text-xs text-slate-500 font-bold">
                    {showDetails ? 'Click to collapse' : 'Click for details'}
                </span>
            </div>
        </motion.div>
    );
};

export default FOMOKiller;
