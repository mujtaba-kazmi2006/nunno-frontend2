import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Newspaper, Clock, ArrowRight, Zap, TrendingUp,
    Calendar, ExternalLink, Flame, BarChart3, RefreshCw,
    Globe, MessageCircle, ArrowUpRight, Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { cn } from '../utils/cn';
import { analytics } from '../utils/analytics';

// ═══════════════════════════════════════════════════════════════
// Time-ago helper
// ═══════════════════════════════════════════════════════════════
function timeAgo(dateStr) {
    if (!dateStr) return 'Just now';
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    return `${diffD}d ago`;
}

// ═══════════════════════════════════════════════════════════════
// Sentiment color helper
// ═══════════════════════════════════════════════════════════════
function sentimentColor(sentiment) {
    switch (sentiment) {
        case 'positive': return 'text-emerald-400';
        case 'negative': return 'text-rose-400';
        default: return 'text-slate-400';
    }
}

function sentimentBg(sentiment) {
    switch (sentiment) {
        case 'positive': return 'bg-emerald-500/10 border-emerald-500/20';
        case 'negative': return 'bg-rose-500/10 border-rose-500/20';
        default: return 'bg-white/5 border-white/10';
    }
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════

const TABS = [
    { id: 'breaking', label: 'Breaking', icon: Newspaper },
    { id: 'pulse', label: 'Pulse', icon: BarChart3 },
    { id: 'events', label: 'Events', icon: Calendar },
];


const NewsIntelligence = () => {
    const { theme } = useTheme();
    const { setPendingMessage } = useChat();

    const [activeTab, setActiveTab] = useState('breaking');
    const [newsFeed, setNewsFeed] = useState([]);
    const [socialPulse, setSocialPulse] = useState(null);
    const [cryptoEvents, setCryptoEvents] = useState([]);
    const [macroSummary, setMacroSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    // ── Fetch all data ──────────────────────────────
    const fetchAllData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [newsRes, pulseRes, eventsRes, macroRes] = await Promise.allSettled([
                fetch(`${API_URL}/api/v1/news-feed?limit=25`),
                fetch(`${API_URL}/api/v1/social-pulse`),
                fetch(`${API_URL}/api/v1/crypto-events`),
                fetch(`${API_URL}/api/v1/macro/summary`),
            ]);

            if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
                const data = await newsRes.value.json();
                setNewsFeed(data.articles || []);
            }

            if (pulseRes.status === 'fulfilled' && pulseRes.value.ok) {
                const data = await pulseRes.value.json();
                setSocialPulse(data);
            }

            if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
                const data = await eventsRes.value.json();
                setCryptoEvents(data.events || []);
            }

            if (macroRes.status === 'fulfilled' && macroRes.value.ok) {
                const data = await macroRes.value.json();
                if (data.summary) setMacroSummary(data.summary);
            }

            // Fallback: if news-feed is empty (aggregator hasn't run yet), use old endpoint
            if (newsRes.status !== 'fulfilled' || !(await newsRes.value?.clone?.()?.json?.())?.articles?.length) {
                try {
                    const fallback = await api.get('/api/v1/news/BTCUSDT');
                    if (fallback.data?.headlines) {
                        setNewsFeed(fallback.data.headlines.map((h, i) => ({
                            id: i,
                            title: h.title,
                            url: h.url,
                            source: h.source,
                            category: 'news',
                            sentiment: null,
                            coin_tags: null,
                            published_at: h.published,
                        })));
                    }
                } catch { /* Silent fallback */ }
            }

            analytics.trackNewsCheck?.('DASHBOARD');
        } catch (error) {
            console.error('NewsIntelligence fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(() => fetchAllData(true), 600000); // Refresh every 10 min
        return () => clearInterval(interval);
    }, [fetchAllData]);

    const handleAskNunno = (context) => {
        setPendingMessage(`Regarding the news item "${context}": Can you explain its potential impact on the current market sentiment and provide a concise summary of the key takeaways? [NEWS_INTEL]`);
    };

    const handleGenerateBriefing = () => {
        setPendingMessage("🔥 Feed Nunno - Market Briefing Request");
    };

    // ── Skeleton Loader ──────────────────────────────
    if (loading && newsFeed.length === 0) {
        return (
            <div className="space-y-4">
                <div className="h-20 rounded-[2rem] bg-purple-500/5 animate-pulse" />
                <div className="flex gap-1 p-1 rounded-2xl bg-white/5">
                    {[1, 2, 3].map(i => <div key={i} className="flex-1 h-9 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 pb-12">
            {/* ── Header: Generate Briefing ────────────────── */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateBriefing}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 flex items-center justify-between group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col items-start">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic opacity-80">Generate Neural</span>
                    <span className="text-xs font-black italic uppercase tracking-tighter">Market Synthesis</span>
                </div>
                <Zap size={18} className="relative z-10 text-white animate-pulse" />
            </motion.button>

            {/* ── Macro Brief (if available) ──────────────── */}
            {macroSummary && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "p-4 rounded-2xl relative overflow-hidden",
                        theme === 'dark'
                            ? "bg-purple-500/10"
                            : "bg-purple-50"
                    )}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-purple-600 italic">Neural Macro Brief</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bold italic">
                        {macroSummary.substring(0, 200)}{macroSummary.length > 200 ? '...' : ''}
                    </p>
                </motion.div>
            )}

            {/* ── Tab Navigation ─────────────────────────── */}
            <div className={cn(
                "flex items-center gap-0.5 p-0.5 rounded-2xl",
                theme === 'dark' ? "bg-white/[0.03]" : "bg-slate-100"
            )}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic",
                                activeTab === tab.id
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                    : theme === 'dark' ? "text-slate-500 hover:text-white" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <Icon size={12} />
                            {tab.label}
                        </button>
                    );
                })}

                {/* Refresh spinner */}
                <button
                    onClick={() => fetchAllData(true)}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        theme === 'dark' ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-400 hover:text-slate-900"
                    )}
                    title="Refresh"
                >
                    <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* ── Tab Content ────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'breaking' && (
                    <BreakingFeedTab
                        key="breaking"
                        articles={newsFeed}
                        theme={theme}
                        onAskNunno={handleAskNunno}
                    />
                )}

                {activeTab === 'pulse' && (
                    <SocialPulseTab
                        key="pulse"
                        data={socialPulse}
                        theme={theme}
                    />
                )}

                {activeTab === 'events' && (
                    <EventsTab
                        key="events"
                        events={cryptoEvents}
                        theme={theme}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// TAB 1: Breaking News Feed
// ═══════════════════════════════════════════════════════════════

function BreakingFeedTab({ articles, theme, onAskNunno }) {
    if (!articles.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
            >
                <Globe size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                    Aggregator is warming up...
                </p>
                <p className="text-[9px] text-slate-600 mt-1 italic">
                    News will appear within 10 minutes of server start
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
        >
            {articles.map((item, index) => (
                <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                        "p-3.5 rounded-2xl transition-all group cursor-pointer",
                        theme === 'dark' ? "bg-white/[0.02] hover:bg-white/5" : "bg-slate-50 hover:bg-slate-100 shadow-sm"
                    )}
                >
                    <div className="flex flex-col gap-1.5">
                        {/* Source + Time + Sentiment */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-purple-500 italic">
                                    {item.source || 'INTEL'}
                                </span>
                                {item.sentiment && (
                                    <span className={cn(
                                        "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                                        sentimentBg(item.sentiment),
                                        sentimentColor(item.sentiment)
                                    )}>
                                        {item.sentiment}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-[8px] text-slate-500">
                                <Clock size={8} />
                                <span>{timeAgo(item.published_at)}</span>
                            </div>
                        </div>

                        {/* Coin tags */}
                        {item.coin_tags && item.coin_tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                                {item.coin_tags.map(tag => (
                                    <span key={tag} className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h3
                            className={cn(
                                "text-[11px] font-bold leading-relaxed line-clamp-3 italic",
                                theme === 'dark' ? "text-slate-200" : "text-slate-800"
                            )}
                            onClick={() => item.url && window.open(item.url, '_blank')}
                        >
                            {item.title}
                        </h3>

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-1">
                            <button
                                onClick={() => onAskNunno(item.title)}
                                className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Zap size={9} /> Ask Nunno
                            </button>
                            {item.url && (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-[8px] text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ExternalLink size={9} /> Open
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}


// ═══════════════════════════════════════════════════════════════
// TAB 2: Social Pulse
// ═══════════════════════════════════════════════════════════════

function SocialPulseTab({ data, theme }) {
    if (!data) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
            >
                <BarChart3 size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                    Social data loading...
                </p>
            </motion.div>
        );
    }

    const totalArticles = data.total_articles_24h || 0;
    const trendingCoins = data.trending_coins || [];
    const sentiment = data.sentiment || {};
    const sources = data.source_distribution || {};
    const latestSocial = data.latest_social || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            {/* Overall Stats */}
            <div className={cn(
                "p-4 rounded-2xl",
                theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50"
            )}>
                <div className="flex items-center gap-2 mb-3">
                    <Globe size={12} className="text-purple-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 italic">24h Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className={cn("text-lg font-black italic", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            {totalArticles}
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 italic">Articles</p>
                    </div>
                    <div className="text-center">
                        <p className={cn("text-lg font-black italic", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            {Object.keys(sources).length}
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 italic">Sources</p>
                    </div>
                    <div className="text-center">
                        <p className={cn("text-lg font-black italic", theme === 'dark' ? "text-white" : "text-slate-900")}>
                            {trendingCoins.length}
                        </p>
                        <p className="text-[7px] font-black uppercase tracking-widest text-slate-500 italic">Trending</p>
                    </div>
                </div>
            </div>

            {/* Sentiment Distribution */}
            {Object.keys(sentiment).length > 0 && (
                <div className={cn(
                    "p-4 rounded-2xl",
                    theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50"
                )}>
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 size={12} className="text-purple-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-500 italic">Sentiment</span>
                    </div>
                    <div className="space-y-2">
                        {Object.entries(sentiment).map(([key, count]) => {
                            const total = Object.values(sentiment).reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest w-16",
                                        sentimentColor(key)
                                    )}>
                                        {key}
                                    </span>
                                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className={cn(
                                                "h-full rounded-full",
                                                key === 'positive' ? "bg-emerald-500" :
                                                    key === 'negative' ? "bg-rose-500" : "bg-slate-400"
                                            )}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 w-8 text-right">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Trending Coins */}
            {trendingCoins.length > 0 && (
                <div className={cn(
                    "p-4 rounded-2xl",
                    theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50"
                )}>
                    <div className="flex items-center gap-2 mb-3">
                        <Flame size={12} className="text-orange-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 italic">Most Mentioned</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {trendingCoins.map(({ coin, mentions }, i) => (
                            <div
                                key={coin}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border",
                                    i === 0
                                        ? "bg-orange-500/10"
                                        : theme === 'dark' ? "bg-white/[0.03]" : "bg-white shadow-sm"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-black italic",
                                    i === 0 ? "text-orange-400" : theme === 'dark' ? "text-white" : "text-slate-900"
                                )}>
                                    {coin}
                                </span>
                                <span className="text-[8px] font-bold text-slate-500">
                                    {mentions}×
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Latest Social Posts */}
            {latestSocial.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1">
                        <MessageCircle size={12} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 italic">Social Feed</span>
                    </div>
                    {latestSocial.map((item, i) => (
                        <a
                            key={i}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "block p-3 rounded-2xl transition-all hover:bg-white/10 group",
                                theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50 shadow-sm"
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <ArrowUpRight size={10} className="text-slate-500 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div>
                                    <p className={cn(
                                        "text-[10px] font-bold leading-relaxed italic line-clamp-2",
                                        theme === 'dark' ? "text-slate-300" : "text-slate-700"
                                    )}>
                                        {item.title}
                                    </p>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">
                                        {item.source}
                                    </span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </motion.div>
    );
}


// ═══════════════════════════════════════════════════════════════
// TAB 3: Events Calendar
// ═══════════════════════════════════════════════════════════════

function EventsTab({ events, theme }) {
    if (!events.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
            >
                <Calendar size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
                    No upcoming events tracked
                </p>
                <p className="text-[9px] text-slate-600 mt-1 italic">
                    Events will populate within 6 hours of server start
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2.5"
        >
            {events.map((event, index) => {
                const eventDate = event.event_date ? new Date(event.event_date) : null;
                const daysUntil = eventDate ? Math.max(0, Math.ceil((eventDate - new Date()) / 86400000)) : null;

                return (
                    <motion.div
                        key={event.id || index}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className={cn(
                            "p-4 rounded-2xl transition-all hover:bg-white/10 group",
                            theme === 'dark' ? "bg-white/[0.02]" : "bg-slate-50 shadow-sm"
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                {/* Event coin + impact */}
                                <div className="flex items-center gap-2 mb-1.5">
                                    {event.coin && (
                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            {event.coin}
                                        </span>
                                    )}
                                    {event.impact && (
                                        <span className={cn(
                                            "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                                            event.impact === 'high'
                                                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                                : event.impact === 'medium'
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                    : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                                        )}>
                                            {event.impact} impact
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className={cn(
                                    "text-[11px] font-bold leading-relaxed italic line-clamp-2",
                                    theme === 'dark' ? "text-slate-200" : "text-slate-800"
                                )}>
                                    {event.title}
                                </h3>

                                {/* Source */}
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic mt-1">
                                    {event.source}
                                </span>
                            </div>

                            {/* Countdown badge */}
                            {daysUntil !== null && (
                                <div className={cn(
                                    "shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border",
                                    daysUntil <= 3
                                        ? "bg-rose-500/10 border-rose-500/20"
                                        : daysUntil <= 7
                                            ? "bg-amber-500/10 border-amber-500/20"
                                            : theme === 'dark' ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-100"
                                )}>
                                    <span className={cn(
                                        "text-sm font-black italic leading-none",
                                        daysUntil <= 3 ? "text-rose-400" :
                                            daysUntil <= 7 ? "text-amber-400" :
                                                theme === 'dark' ? "text-white" : "text-slate-900"
                                    )}>
                                        {daysUntil}
                                    </span>
                                    <span className="text-[7px] font-black uppercase tracking-widest text-slate-500">
                                        days
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Open link */}
                        {event.url && (
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 mt-2 text-[8px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <ExternalLink size={9} /> View Details
                            </a>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
}


export default NewsIntelligence;
