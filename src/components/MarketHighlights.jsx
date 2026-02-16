import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Search, ExternalLink, Zap, Plus, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { getMarketHighlights } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const MarketHighlights = ({ onAnalyzeChart, onAnalyzeTokenomics }) => {
    const { theme } = useTheme();
    const [highlights, setHighlights] = useState(null);
    const [activeTab, setActiveTab] = useState('gainers');
    const [loading, setLoading] = useState(true);
    const [hoveredSymbol, setHoveredSymbol] = useState(null);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                setLoading(true);
                const data = await getMarketHighlights();
                setHighlights(data);
            } catch (error) {
                console.error('Error fetching highlights:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHighlights();
        const interval = setInterval(fetchHighlights, 30000);
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { id: 'gainers', name: 'Top Gainers', icon: <TrendingUp size={16} /> },
        { id: 'losers', name: 'Top Losers', icon: <TrendingDown size={16} /> },
        { id: 'new_listings', name: 'New Listings', icon: <Zap size={16} /> },
        { id: 'most_traded', name: 'Most Traded', icon: <Activity size={16} /> }
    ];

    if (loading && !highlights) {
        return (
            <div className={`p-6 rounded-3xl border animate-pulse ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-slate-100'}`}>
                <div className="h-6 w-32 bg-slate-700/30 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-slate-700/20 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    const currentData = highlights ? highlights[activeTab] : [];

    return (
        <section className={`w-full max-w-full rounded-[2.5rem] border overflow-hidden transition-all duration-700 shadow-2xl ${theme === 'dark'
            ? 'bg-[#0c0c14] border-white/10 shadow-black/40'
            : 'bg-white border-slate-200/60 shadow-slate-200/50'
            }`}>
            {/* Header / Tabs */}
            <div className={`flex flex-col p-5 gap-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                        Market Feed
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black uppercase tracking-tighter dark:text-emerald-400">Live</span>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap border ${activeTab === tab.id
                                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                                : theme === 'dark' ? 'text-slate-500 border-white/5 hover:text-white hover:bg-white/5' : 'text-slate-500 border-slate-100 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto h-[320px] custom-scrollbar w-full space-y-2">
                {currentData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 w-full">
                        {currentData.map((item, index) => (
                            <div
                                key={item.symbol}
                                onClick={() => setHoveredSymbol(hoveredSymbol === item.symbol ? null : item.symbol)}
                                onMouseEnter={() => !isMobile && setHoveredSymbol(item.symbol)}
                                onMouseLeave={() => !isMobile && setHoveredSymbol(null)}
                                className={`relative flex flex-col p-4 rounded-2xl transition-all duration-300 w-full max-w-full overflow-hidden cursor-pointer border ${hoveredSymbol === item.symbol
                                    ? (theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200')
                                    : (theme === 'dark' ? 'bg-transparent border-transparent hover:bg-white/5' : 'bg-transparent border-transparent hover:bg-slate-50')
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full min-w-0">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs border shadow-sm ${theme === 'dark' ? 'bg-black/40 border-white/10 text-purple-400' : 'bg-white border-slate-100 text-purple-600'
                                            }`}>
                                            {item.symbol.substring(0, 3)}
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className={`text-sm font-black italic uppercase tracking-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                {item.symbol.replace('USDT', '')}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {activeTab === 'most_traded' ? `$${(item.volume / 1000000).toFixed(1)}M Vol` : 'Perpetual'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                        <span className={`text-xs font-mono font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                            ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <div className={`flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${item.change >= 0
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : 'text-rose-400 bg-rose-500/10'
                                            }`}>
                                            {item.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {Math.abs(item.change).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Appear on Click/Hover */}
                                <div className={`flex gap-2 transition-all duration-500 w-full overflow-hidden ${hoveredSymbol === item.symbol
                                    ? 'opacity-100 h-auto mt-4 translate-y-0'
                                    : 'opacity-0 h-0 mt-0 -translate-y-4 pointer-events-none'
                                    }`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAnalyzeChart?.(item.symbol);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-xl shadow-black/10"
                                    >
                                        <Activity size={12} />
                                        Launch Chart
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAnalyzeTokenomics?.(item.symbol);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${theme === 'dark'
                                            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
                                            }`}
                                    >
                                        <Plus size={12} />
                                        Market Data
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-50">
                        <Activity size={40} className="mb-4 animate-pulse text-purple-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Aggregating Data...</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MarketHighlights;
