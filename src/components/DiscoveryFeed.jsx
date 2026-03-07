import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Heart,
    Share2,
    Search,
    Filter,
    Newspaper,
    Zap,
    LayoutGrid,
    Flame,
    Clock,
    User,
    CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export default function DiscoveryFeed() {
    const { theme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('foryou');
    const [likedItems, setLikedItems] = useState(new Set());

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/feed`);
            const data = await response.json();
            setFeedItems(data);
        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (id) => {
        if (likedItems.has(id)) return;

        try {
            const response = await fetch(`${API_URL}/api/v1/feed/${id}/like`, {
                method: 'POST'
            });
            if (response.ok) {
                setLikedItems(prev => new Set([...prev, id]));
                setFeedItems(prev => prev.map(item =>
                    item.id === id ? { ...item, likes: item.likes + 1 } : item
                ));
            }
        } catch (error) {
            console.error('Error liking item:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ai_sentiment': return <Zap className="text-violet-400" size={20} />;
            case 'trade_idea': return <TrendingUp className="text-purple-400" size={20} />;
            case 'news_flash': return <Newspaper className="text-blue-400" size={20} />;
            case 'analysis': return <LayoutGrid className="text-amber-400" size={20} />;
            default: return <MessageSquare className="text-slate-400" size={20} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'ai_sentiment': return 'AI Sentiment';
            case 'trade_idea': return 'Trade Idea';
            case 'news_flash': return 'News Flash';
            case 'analysis': return 'Deep Analysis';
            default: return 'Community Post';
        }
    };

    return (
        <div className={cn(
            "min-h-full py-12 px-4 transition-colors duration-500",
            theme === 'dark' ? 'bg-[#020205]' : 'bg-slate-50'
        )}>
            <div className="max-w-xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col gap-6 text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className={cn(
                            "text-5xl font-black italic tracking-tighter uppercase",
                            theme === 'dark' ? "text-white" : "text-slate-900"
                        )}>
                            DISCOVERY <span className="text-violet-500">FEED</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 italic">
                            Infinite Market Intelligence Layer
                        </p>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className={cn(
                        "flex items-center justify-center gap-1 p-1 rounded-2xl mx-auto border backdrop-blur-xl",
                        theme === 'dark' ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                    )}>
                        {['foryou', 'trending', 'news'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                                    activeTab === tab
                                        ? "bg-violet-600 text-white shadow-xl shadow-violet-500/20"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-white"
                                )}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feed Items */}
                <div className="space-y-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className={cn(
                                "h-64 rounded-3xl animate-pulse",
                                theme === 'dark' ? "bg-white/5" : "bg-slate-200"
                            )} />
                        ))
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {feedItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.1, type: 'spring', damping: 20 }}
                                    className={cn(
                                        "group relative p-8 rounded-[2.5rem] border transition-all duration-500",
                                        theme === 'dark'
                                            ? "bg-[#0c0c14] border-white/5 hover:border-violet-500/30"
                                            : "bg-white border-slate-200 hover:border-violet-300 shadow-xl shadow-slate-200/50"
                                    )}
                                >
                                    {/* Glass Morph Decoration */}
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        {getIcon(item.type)}
                                    </div>

                                    {/* Author & Header */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="size-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-lg font-black italic shadow-lg">
                                            {item.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-black uppercase tracking-tight",
                                                    theme === 'dark' ? "text-white" : "text-slate-900"
                                                )}>{item.author}</h4>
                                                <CheckCircle size={14} className="text-violet-500 fill-violet-500/10" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                    {getTypeLabel(item.type)}
                                                </span>
                                                <span className="size-1 rounded-full bg-slate-600" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-4">
                                        {item.ticker && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                                                <span className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                                                <span className="text-[10px] font-black italic text-violet-500 uppercase tracking-widest">{item.ticker}</span>
                                            </div>
                                        )}

                                        <h3 className={cn(
                                            "text-2xl font-black italic tracking-tight leading-tight",
                                            theme === 'dark' ? "text-slate-100" : "text-slate-900"
                                        )}>{item.title}</h3>

                                        <p className={cn(
                                            "text-sm leading-relaxed font-medium",
                                            theme === 'dark' ? "text-slate-400" : "text-slate-600"
                                        )}>
                                            {item.content}
                                        </p>

                                        {/* Dynamic Metadata Cards */}
                                        {item.metadata && (
                                            <div className="grid grid-cols-2 gap-3 mt-4">
                                                {Object.entries(item.metadata).map(([key, value]) => (
                                                    <div key={key} className={cn(
                                                        "p-4 rounded-3xl border flex flex-col gap-1",
                                                        theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100"
                                                    )}>
                                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{key.replace('_', ' ')}</span>
                                                        <span className={cn(
                                                            "text-sm font-black italic",
                                                            theme === 'dark' ? "text-white" : "text-slate-900"
                                                        )}>{typeof value === 'number' ?
                                                            (key.includes('score') ? `${(value * 100).toFixed(0)}%` : value)
                                                            : value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-6">
                                            <button
                                                onClick={() => handleLike(item.id)}
                                                className={cn(
                                                    "flex items-center gap-2 transition-all group/btn",
                                                    likedItems.has(item.id) ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-2 rounded-xl transition-colors",
                                                    likedItems.has(item.id) ? "bg-rose-500/10" : "bg-white/5 group-hover/btn:bg-rose-500/10"
                                                )}>
                                                    <Heart size={18} fill={likedItems.has(item.id) ? "currentColor" : "none"} />
                                                </div>
                                                <span className="text-xs font-black italic">{item.likes}</span>
                                            </button>

                                            <button className="flex items-center gap-2 text-slate-500 hover:text-violet-500 transition-all group/btn">
                                                <div className="p-2 rounded-xl bg-white/5 group-hover/btn:bg-violet-500/10">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <span className="text-xs font-black italic">Reply</span>
                                            </button>
                                        </div>

                                        <button className="p-3 rounded-2xl bg-white/5 text-slate-500 hover:text-white transition-all h-12 flex items-center justify-center">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Floating Post Button (Premium) */}
            <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-8 right-8 z-50 size-16 rounded-[2rem] bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-2xl flex items-center justify-center hover:shadow-violet-500/40 transition-shadow overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <LayoutGrid size={24} className="relative z-10" />
            </motion.button>
        </div>
    );
}
