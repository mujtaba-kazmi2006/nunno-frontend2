import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, ArrowRight, Zap } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useChat } from '../contexts/ChatContext';
import { cn } from '../utils/cn';

const NewsIntelligence = () => {
    const { theme } = useTheme();
    const { setPendingMessage } = useChat();
    const [news, setNews] = useState([]);
    const [macroSummary, setMacroSummary] = useState('');
    const [loading, setLoading] = useState(true);

    const handleGenerateBriefing = () => {
        setPendingMessage("🔥 Feed Nunno - Market Briefing Request");
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch News
                const response = await api.get('/api/v1/news/BTCUSDT');
                if (response.data && response.data.headlines) {
                    setNews(response.data.headlines.slice(0, 8));
                }

                // Fetch Macro Summary
                const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${apiBase}/api/v1/macro/summary`);
                const data = await res.json();
                if (data.summary) {
                    setMacroSummary(data.summary);
                }
            } catch (error) {
                console.error('Failed to fetch news or macro:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    const handleAskNunno = (context) => {
        setPendingMessage(`Regarding the news item "${context}": Can you explain its potential impact on the current market sentiment and provide a concise summary of the key takeaways? [NEWS_INTEL]`);
    };

    if (loading && news.length === 0) {
        return (
            <div className="space-y-4">
                <div className="h-24 rounded-[2rem] bg-purple-500/5 animate-pulse" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Global Synthesis Action */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateBriefing}
                className="w-full p-4 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 flex items-center justify-between group overflow-hidden relative"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col items-start">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Generate Neural</span>
                    <span className="text-sm font-black italic uppercase tracking-tighter">Market Synthesis</span>
                </div>
                <Zap size={20} className="relative z-10 text-white animate-pulse" />
            </motion.button>

            {/* Macro Summary Mini Card */}
            {macroSummary && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "p-5 rounded-[2rem] border relative overflow-hidden",
                        theme === 'dark'
                            ? "bg-purple-500/5 border-purple-500/20"
                            : "bg-purple-50 border-purple-100"
                    )}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-3 h-3 text-purple-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 italic">Neural Macro Brief</span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-bold italic">
                        {macroSummary.substring(0, 180)}...
                    </p>
                </motion.div>
            )}

            {/* News Feed */}
            <div className="space-y-3">
                {news.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "p-4 rounded-3xl border transition-all hover:bg-white/5 group ring-1 ring-transparent hover:ring-purple-500/20",
                            theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"
                        )}
                    >
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[8px] font-black uppercase tracking-widest text-purple-500 italic">{item.source || 'INTEL'}</span>
                                <div className="flex items-center gap-1 text-[8px] text-slate-500">
                                    <Clock size={8} />
                                    <span>JUST NOW</span>
                                </div>
                            </div>
                            <h3 className="text-[11px] font-bold leading-relaxed text-slate-800 dark:text-slate-200 line-clamp-3 italic">
                                {item.title}
                            </h3>
                            <button
                                onClick={() => handleAskNunno(item.title)}
                                className="mt-1 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-purple-500 hover:text-purple-400 self-end transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                            >
                                Process Intelligence <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default NewsIntelligence;
