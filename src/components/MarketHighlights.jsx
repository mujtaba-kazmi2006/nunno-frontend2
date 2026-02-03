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
        <section className={`w-full max-w-full rounded-3xl border overflow-hidden transition-all duration-500 shadow-2xl ${theme === 'dark'
            ? 'bg-[#1e2030]/40 border-slate-700/50 backdrop-blur-xl'
            : 'bg-white/80 border-slate-200/60 backdrop-blur-xl shadow-slate-200/50'
            }`}>
            {/* Header / Tabs */}
            <div className={`flex items-center justify-between p-3 border-b ${theme === 'dark' ? 'border-slate-700/50' : 'border-slate-100'}`}>
                <div className="flex gap-1 overflow-x-auto no-scrollbar w-full">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                                : theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="p-2 overflow-y-auto h-[280px] custom-scrollbar w-full">
                {currentData.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1 w-full">
                        {currentData.map((item, index) => (
                            <div
                                key={item.symbol}
                                onClick={() => setHoveredSymbol(hoveredSymbol === item.symbol ? null : item.symbol)}
                                onMouseEnter={() => !isMobile && setHoveredSymbol(item.symbol)}
                                onMouseLeave={() => !isMobile && setHoveredSymbol(null)}
                                className={`relative flex flex-col p-3 rounded-2xl transition-all w-full max-w-full overflow-hidden cursor-pointer group ${hoveredSymbol === item.symbol
                                    ? (theme === 'dark' ? 'bg-white/10' : 'bg-slate-100')
                                    : (theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50')
                                    }`}
                            >
                                <div className="flex items-center justify-between w-full min-w-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-[10px] ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-100'
                                            }`}>
                                            {item.symbol.substring(0, 3)}
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <div className="flex items-center gap-1.5 max-w-full">
                                                <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                                    {item.symbol.replace('USDT', '')}
                                                </span>
                                            </div>
                                            <span className={`text-[9px] font-medium truncate w-full ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {activeTab === 'most_traded' ? `$${(item.volume / 1000000).toFixed(1)}M Vol` : 'Spot'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                        <span className={`text-[11px] font-mono font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                                            ${item.price < 1 ? item.price.toFixed(4) : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <div className={`flex items-center gap-0.5 text-[9px] font-black ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                            {item.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                            {Math.abs(item.change).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Appear on Click/Hover */}
                                <div className={`flex gap-1.5 transition-all duration-300 w-full ${hoveredSymbol === item.symbol
                                    ? 'opacity-100 h-auto mt-3 translate-y-0'
                                    : 'opacity-0 h-0 mt-0 -translate-y-2 pointer-events-none'
                                    }`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAnalyzeChart?.(item.symbol);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-purple-600 text-white text-[9px] font-black uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20"
                                    >
                                        <Activity size={10} />
                                        Chart
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAnalyzeTokenomics?.(item.symbol);
                                        }}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-colors border ${theme === 'dark'
                                            ? 'bg-white/5 border-slate-700 text-slate-300 hover:bg-white/10'
                                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm'
                                            }`}
                                    >
                                        <Plus size={10} />
                                        Supply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Activity size={32} className="opacity-20 mb-2" />
                        <span className="text-xs font-bold">No data available yet</span>
                    </div>
                )}
            </div>
        </section>
    );
};

export default MarketHighlights;
