import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertTriangle, ShieldCheck, Zap, TrendingUp, Info, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

// Cache TTL: 15 minutes — data stays fresh across page switches
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCachedRisk(symbol) {
    try {
        const raw = localStorage.getItem(`nunno_risk_cache_${symbol}`);
        if (!raw) return null;
        const { data, ts } = JSON.parse(raw);
        if (Date.now() - ts > CACHE_TTL_MS) return null; // expired
        return data;
    } catch {
        return null;
    }
}

function setCachedRisk(symbol, data) {
    try {
        localStorage.setItem(`nunno_risk_cache_${symbol}`, JSON.stringify({ data, ts: Date.now() }));
    } catch { }
}

const RiskCard = ({ symbol, onRemove }) => {
    const { theme } = useTheme();
    // Initialise from cache immediately — no loading flash on page switch
    const [data, setData] = useState(() => getCachedRisk(symbol));
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchRisk = async (force = false) => {
        // Skip network call if we already have fresh cached data and it's not a forced refresh
        if (!force && getCachedRisk(symbol)) return;
        setLoading(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${apiBase}/api/v1/critic/roast`, {
                symbol: symbol.endsWith('USDT') ? symbol : `${symbol}USDT`,
                timeframe: '1h'
            });
            if (!isMounted.current) return;
            setData(response.data);
            setLastUpdated(new Date());
            setCachedRisk(symbol, response.data);
        } catch (err) {
            console.error('Risk fetch error:', err);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    useEffect(() => {
        fetchRisk(false); // only fetches if cache is missing or expired
    }, [symbol]);

    // Only show full skeleton on truly first load (no cache at all)
    if (loading && !data) {
        return (
            <div className={cn(
                "p-5 rounded-[2rem] border animate-pulse",
                theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"
            )}>
                <div className="h-4 w-20 bg-slate-700/50 rounded mb-4" />
                <div className="h-24 w-full bg-slate-700/50 rounded-2xl" />
            </div>
        );
    }

    if (!data) return null;

    const isHighRisk = data.risk_score > 60;
    const scoreColor = data.risk_score > 70 ? 'text-rose-500' : data.risk_score > 40 ? 'text-amber-500' : 'text-emerald-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "p-5 rounded-[2.5rem] border relative group transition-all duration-500 flex flex-col gap-4",
                theme === 'dark'
                    ? "bg-[#0c0c14]/40 backdrop-blur-xl border-white/5 hover:border-purple-500/20"
                    : "bg-white border-slate-200 shadow-xl"
            )}
        >
            {/* Remove button */}
            <button
                onClick={() => onRemove(symbol)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/20 text-rose-500 z-20"
            >
                <X size={14} />
            </button>

            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                            {symbol} REALITY CHECK
                        </span>
                        {/* Subtle refresh indicator — only shows while background-refreshing */}
                        {loading && (
                            <RefreshCw size={9} className="text-purple-400 animate-spin opacity-70" />
                        )}
                    </div>
                    <h3 className={cn(
                        "text-xl font-black italic uppercase tracking-tighter leading-none mb-1",
                        isHighRisk
                            ? (theme === 'dark' ? "text-white" : "text-rose-600")
                            : "text-emerald-500"
                    )}>
                        {isHighRisk ? "KHATRE KA SIGNAL!" : "MAUJH HI MAUJH!"}
                    </h3>
                    {/* Last updated / manual refresh button */}
                    <button
                        onClick={() => fetchRisk(true)}
                        disabled={loading}
                        className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-slate-600 hover:text-purple-400 transition-colors disabled:opacity-40"
                        title="Force refresh"
                    >
                        <RefreshCw size={8} className={loading ? 'animate-spin' : ''} />
                        {lastUpdated
                            ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Cached'}
                    </button>
                </div>
                <div className="text-right">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">RISK SCORE</span>
                    <div className={cn("text-2xl font-black italic tracking-tighter leading-none", scoreColor)}>
                        {data.risk_score}<span className="text-xs opacity-30">/100</span>
                    </div>
                </div>
            </div>

            {/* Premium Gradient Progress Bar */}
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.risk_score}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        data.risk_score > 70 ? "bg-gradient-to-r from-orange-500 to-rose-600" :
                            data.risk_score > 40 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
                                "bg-gradient-to-r from-emerald-400 to-teal-500"
                    )}
                />
            </div>

            {/* Roast Box */}
            <div className={cn(
                "p-4 rounded-2xl border transition-colors",
                theme === 'dark' ? "bg-black/40 border-white/5" : "bg-slate-50 border-slate-200"
            )}>
                <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 block mb-2 italic">NUNNO'S REALITY ROAST:</span>
                <p className={cn(
                    "text-[11px] leading-relaxed font-bold italic",
                    theme === 'dark' ? "text-slate-300" : "text-slate-600"
                )}>
                    "{data.roast}"
                </p>
            </div>

            {/* Strategy Box */}
            {data.advice && (
                <div className={cn(
                    "p-4 rounded-2xl border-2 border-dashed",
                    theme === 'dark' ? "bg-purple-500/5 border-purple-500/10" : "bg-purple-50/50 border-purple-100"
                )}>
                    <span className="text-[8px] font-black uppercase tracking-widest text-purple-500 block mb-1">SAFE STRATEGY:</span>
                    <p className={cn(
                        "text-[10px] font-bold",
                        theme === 'dark' ? "text-slate-400" : "text-slate-500"
                    )}>
                        {data.advice}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

const POPULAR_TOKENS = [
    'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX', 'TRX', 'DOT',
    'LINK', 'MATIC', 'UNI', 'LTC', 'BCH', 'PEPE', 'SHIB', 'NEAR', 'FET', 'APT'
];

const RiskWatchlistSidebar = () => {
    const { theme } = useTheme();
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('nunno_risk_watchlist');
        return saved ? JSON.parse(saved) : ['BTC', 'ETH', 'SOL'];
    });
    const [search, setSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        localStorage.setItem('nunno_risk_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const handleAdd = (symbol) => {
        if (symbol && !watchlist.includes(symbol)) {
            setWatchlist([symbol, ...watchlist].slice(0, 5));
            setSearch('');
            setIsSearching(false);
        }
    };

    const handleRemove = (symbol) => {
        setWatchlist(watchlist.filter(s => s !== symbol));
    };

    const filteredTokens = search
        ? POPULAR_TOKENS.filter(t => t.toLowerCase().includes(search.toLowerCase()))
        : [];

    return (
        <div className="flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Risk Monitor</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-emerald-500">
                        <ShieldCheck size={10} className="animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Neural Safety Guard</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsSearching(!isSearching);
                        if (!isSearching) setSearch('');
                    }}
                    className={cn(
                        "p-2 rounded-xl transition-all shadow-xl border",
                        isSearching
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                    )}
                >
                    {isSearching ? <X size={16} /> : <Search size={16} />}
                </button>
            </header>

            <AnimatePresence>
                {isSearching && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="relative"
                    >
                        <div className="relative">
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search token (e.g. BTC, ETH)"
                                className={cn(
                                    "w-full pl-4 pr-10 py-3 rounded-2xl border-2 outline-none transition-all text-sm font-bold uppercase italic",
                                    theme === 'dark'
                                        ? "bg-[#16161e] border-white/5 text-white focus:border-purple-500/50"
                                        : "bg-white border-slate-100 text-slate-900 focus:border-purple-500"
                                )}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                                <Search size={16} />
                            </div>
                        </div>

                        {/* Dropdown Results */}
                        <AnimatePresence>
                            {filteredTokens.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={cn(
                                        "absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-xl",
                                        theme === 'dark' ? "bg-[#1a1a24]/95 border-white/10" : "bg-white/95 border-slate-200"
                                    )}
                                >
                                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                                        {filteredTokens.map((token) => (
                                            <button
                                                key={token}
                                                onClick={() => handleAdd(token)}
                                                className={cn(
                                                    "w-full px-4 py-3 flex items-center justify-between text-left transition-colors",
                                                    theme === 'dark' ? "hover:bg-white/5" : "hover:bg-slate-50",
                                                    watchlist.includes(token) && "opacity-50 cursor-not-allowed"
                                                )}
                                                disabled={watchlist.includes(token)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                        <Zap size={12} className="text-purple-500" />
                                                    </div>
                                                    <span className="text-sm font-black italic uppercase tracking-tighter text-slate-200">{token}</span>
                                                </div>
                                                {watchlist.includes(token) ? (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Monitored</span>
                                                ) : (
                                                    <TrendingUp size={12} className="text-emerald-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {watchlist.map(symbol => (
                        <RiskCard key={symbol} symbol={symbol} onRemove={handleRemove} />
                    ))}
                </AnimatePresence>

                {watchlist.length === 0 && (
                    <div className="text-center py-12 px-6 rounded-3xl border-2 border-dashed border-white/5">
                        <Info className="w-8 h-8 text-slate-600 mx-auto mb-3 opacity-20" />
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                            No tokens monitored. Tap search to select from high-liquidity assets.
                        </p>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                    RADAR STATUS: ACTIVE. Risk scores are generated via technical neural analysis of 500+ data points. Not financial advice.
                </p>
            </div>
        </div>
    );
};

export default RiskWatchlistSidebar;
