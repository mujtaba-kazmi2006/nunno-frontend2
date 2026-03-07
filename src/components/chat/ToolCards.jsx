import React from 'react';
import {
    Globe, Search, ExternalLink, Activity, Waves,
    TrendingUp, TrendingDown, PieChart, Info,
    AlertTriangle, Flame, Newspaper, BarChart3,
    CheckCircle2, AlertCircle, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { formatPrice } from '../../utils/formatPrice';

// ── 1. Web Search Card ───────────────────────────────────────
export const WebSearchCard = ({ results }) => {
    if (!results || !results.results) return null;
    return (
        <div className="flex flex-col gap-4 mb-6 max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                    <Globe size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Neural Search</span>
                    <span className="text-xs font-bold text-slate-400">Scanning real-time web nodes</span>
                </div>
            </div>
            <div className="space-y-3">
                {results.results.slice(0, 3).map((result, idx) => (
                    <motion.a
                        key={idx}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="block group p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-violet-500/5 hover:border-violet-500/20 transition-all"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <h5 className="text-sm font-bold text-slate-300 group-hover:text-violet-400 transition-colors line-clamp-1">
                                    {result.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {result.snippet}
                                </p>
                            </div>
                            <ExternalLink size={14} className="text-slate-600 group-hover:text-violet-500 shrink-0 mt-1" />
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
};

// ── 2. Tokenomics Card ───────────────────────────────────────
export const TokenomicsCard = ({ data }) => {
    if (!data || data.error) return null;
    return (
        <div className="flex flex-col gap-4 mb-6 max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <PieChart size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Asset Economics</span>
                    <span className="text-xs font-bold text-slate-400">Supply & Distribution Audit</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Circulating Supply</span>
                    <span className="text-sm font-black text-slate-200">{data.supply?.circulating?.toLocaleString()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Market Cap</span>
                    <span className="text-sm font-black text-slate-200">${data.market_data?.market_cap?.toLocaleString()}</span>
                </div>
            </div>

            <div className="space-y-3 mt-2">
                {data.beginner_explanations?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Info size={14} className="text-violet-500 shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider text-violet-400">{item.term}</span>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{item.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── 3. On-Chain Intel Card ────────────────────────────────────
export const OnChainCard = ({ data }) => {
    if (!data) return null;

    // Handing both the unified core and individual asset scores
    const btcData = data.BTC;
    if (!btcData) return null;

    const score = btcData.score || 0;
    const barWidth = Math.abs(score) * 100;
    const barPosition = score >= 0 ? 50 : 50 - barWidth;

    return (
        <div className="flex flex-col gap-4 mb-6 max-w-xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Activity size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">On-Chain Intel</span>
                    <span className="text-xs font-bold text-slate-400">Whale Flow & Network Bias</span>
                </div>
            </div>

            <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-white">BTC Intelligence</span>
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                        btcData.trend.includes('Bullish') ? 'bg-purple-500/10 text-purple-400' : 'bg-rose-500/10 text-rose-400'
                    )}>
                        {btcData.trend.includes('Bullish') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {btcData.trend}
                    </div>
                </div>

                {/* Score Bar */}
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                    <div className="absolute left-1/2 top-0 w-px h-full bg-slate-500/30 z-10" />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%`, left: `${barPosition}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                            "absolute top-0 h-full rounded-full transition-all duration-500",
                            score > 0 ? "bg-purple-500" : "bg-rose-500"
                        )}
                    />
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Whale</span>
                        <span className={cn("text-[10px] font-bold", btcData.whale_score > 0 ? 'text-purple-400' : 'text-rose-400')}>
                            {btcData.whale_score > 0 ? '+' : ''}{btcData.whale_score?.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Exchange</span>
                        <span className={cn("text-[10px] font-bold", btcData.exchange_score > 0 ? 'text-purple-400' : 'text-rose-400')}>
                            {btcData.exchange_score > 0 ? '+' : ''}{btcData.exchange_score?.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Active</span>
                        <span className={cn("text-[10px] font-bold", btcData.activity_score > 0 ? 'text-purple-400' : 'text-rose-400')}>
                            {btcData.activity_score > 0 ? '+' : ''}{btcData.activity_score?.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── 4. Roast Card ─────────────────────────────────────────────
export const RoastCard = ({ data }) => {
    if (!data) return null;
    return (
        <div className="flex flex-col gap-4 mb-6 max-w-xl bg-gradient-to-br from-orange-500/10 to-rose-600/10 border border-orange-500/20 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-500 shadow-lg shadow-orange-500/20">
                    <Flame size={18} className="animate-bounce" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Neural Reality Check</span>
                    <span className="text-xs font-black text-white italic tracking-tight">The Brutal Truth</span>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                        Risk: {data.risk_score}/10
                    </span>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("w-1.5 h-3 rounded-full", i < (data.risk_score / 2) ? "bg-orange-500" : "bg-white/10")} />
                        ))}
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                    "{data.roast_text}"
                </p>
            </div>

            <div className="space-y-2">
                {data.fatafat_insides?.slice(0, 3).map((note, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[10px] font-bold text-orange-400/80 uppercase">
                        <AlertTriangle size={12} />
                        <span>{note}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── 5. FOMO Card ─────────────────────────────────────────────
export const FOMOCard = ({ data }) => {
    if (!data) return null;
    const isHighDanger = data.danger_level > 7;
    return (
        <div className={cn(
            "flex flex-col gap-4 mb-6 max-w-xl border rounded-[2rem] p-6 shadow-2xl transition-all duration-500 scale-in",
            isHighDanger
                ? "bg-rose-600/10 border-rose-500/30 animate-pulse-subtle"
                : "bg-amber-500/10 border-amber-500/30"
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "p-2.5 rounded-xl shadow-lg",
                    isHighDanger ? "bg-rose-500 text-white" : "bg-amber-500 text-black"
                )}>
                    <AlertCircle size={20} />
                </div>
                <div className="flex flex-col">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-[.25em]",
                        isHighDanger ? "text-rose-500" : "text-amber-500"
                    )}>FOMO Detector Node</span>
                    <h4 className="text-lg font-black text-white italic tracking-tight uppercase">
                        {isHighDanger ? "DANGER: TOP DETECTED" : "WATCHOUT: OVERHEATING"}
                    </h4>
                </div>
            </div>

            <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <p className="text-sm font-medium text-slate-200 leading-relaxed mb-4">
                    {data.message}
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Danger Level</span>
                        <span className={cn("text-base font-black italic", isHighDanger ? "text-rose-400" : "text-amber-400")}>
                            {data.danger_level * 10}%
                        </span>
                    </div>
                    <div className="flex flex-col p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Buy Efficiency</span>
                        <span className="text-base font-black italic text-slate-400">
                            Low
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Zap size={14} className="text-violet-400" />
                <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Strategy: WAIT FOR PULLBACK</span>
            </div>
        </div>
    );
};

// ── 6. News & Sentiment Card ───────────────────────────────────
export const NewsSentimentCard = ({ data }) => {
    if (!data) return null;
    const fg = data.fear_greed || {};
    return (
        <div className="flex flex-col gap-4 mb-6 max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Newspaper size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Neural Feed</span>
                        <span className="text-xs font-bold text-slate-400">Sentiment & Market Narrative</span>
                    </div>
                </div>

                {fg.value && (
                    <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Fear & Greed</span>
                        <span className={cn(
                            "text-xs font-black uppercase italic",
                            fg.value > 70 ? 'text-purple-400' : fg.value < 30 ? 'text-rose-400' : 'text-amber-400'
                        )}>
                            {fg.value_classification} ({fg.value})
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {data.news?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-3">
                        <div className={cn(
                            "w-1 h-auto rounded-full shrink-0",
                            item.votes?.positive > item.votes?.negative ? 'bg-purple-500' : 'bg-rose-500'
                        )} />
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.source?.title}</span>
                            <h5 className="text-xs font-bold text-slate-200 line-clamp-1">{item.title}</h5>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                <span className="flex items-center gap-1"><TrendingUp size={10} className="text-purple-500" /> {item.votes?.positive}</span>
                                <span className="flex items-center gap-1"><TrendingDown size={10} className="text-rose-500" /> {item.votes?.negative}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── 7. Market Overview Card ──────────────────────────────────
export const MarketOverviewCard = ({ data }) => {
    if (!data) return null;
    return (
        <div className="flex flex-col gap-6 mb-6 w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-400">
                        <BarChart3 size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">Global Pulse</span>
                        <span className="text-sm font-black text-white italic tracking-tight">Market Momentum</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gainers */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-500/60 ml-2">Top Gainers</span>
                    <div className="space-y-2">
                        {data.gainers?.slice(0, 4).map((coin, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/[0.03] border border-purple-500/10">
                                <span className="text-xs font-black text-slate-200">{coin.symbol.replace('USDT', '')}</span>
                                <span className="text-xs font-black text-purple-400">+{coin.change.toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Losers */}
                <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 ml-2">Top Losers</span>
                    <div className="space-y-2">
                        {data.losers?.slice(0, 4).map((coin, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10">
                                <span className="text-xs font-black text-slate-200">{coin.symbol.replace('USDT', '')}</span>
                                <span className="text-xs font-black text-rose-400">{coin.change.toFixed(2)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {data.new_listings?.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/60 ml-2 mb-3 block">New Listings</span>
                    <div className="flex flex-wrap gap-2">
                        {data.new_listings.slice(0, 5).map((coin, idx) => (
                            <div key={idx} className="px-3 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase italic">
                                {coin.symbol.replace('USDT', '')}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
