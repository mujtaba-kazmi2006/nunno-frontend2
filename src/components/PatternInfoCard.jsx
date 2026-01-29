import React from 'react';
import { TrendingUp, X, Target, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const PatternInfoCard = ({ pattern, onClose }) => {
    const { theme } = useTheme();
    if (!pattern) return null;

    return (
        <div className={`absolute top-4 right-4 z-30 w-96 rounded-2xl shadow-2xl border overflow-hidden animate-in slide-in-from-right duration-500 ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 shadow-black/50' : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]'}`}>
            <div className="p-5 space-y-5">
                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${pattern.direction === 'bullish'
                            ? 'bg-green-50 text-green-600'
                            : pattern.direction === 'bearish'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-purple-50 text-purple-600'
                            }`}>
                            <TrendingUp size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className={`text-base font-black tracking-tight uppercase ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                                {pattern.pattern_name?.replace(/_/g, ' ')}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${pattern.direction === 'bullish' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {pattern.direction}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${theme === 'dark' ? 'bg-[#16161e] text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                    {pattern.type}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Description */}
                <div className="relative">
                    <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        {pattern.description}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-2xl border ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-slate-50 border-slate-100/50'}`}>
                        <div className="text-[10px] uppercase font-black text-slate-400 mb-1.5 tracking-widest flex items-center gap-1.5">
                            <Target size={12} strokeWidth={3} />
                            Success Rate
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{(pattern.success_rate * 100).toFixed(0)}%</span>
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}>
                                <div
                                    className={`h-full rounded-full ${pattern.success_rate > 0.8 ? 'bg-green-500' : 'bg-amber-500'
                                        }`}
                                    style={{ width: `${pattern.success_rate * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50/50 border-purple-100/50'}`}>
                        <div className={`text-[10px] uppercase font-black mb-1.5 tracking-widest flex items-center gap-1.5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-400'}`}>
                            <AlertCircle size={12} strokeWidth={3} />
                            Status
                        </div>
                        <div className={`text-sm font-black ${theme === 'dark' ? 'text-purple-300' : 'text-purple-600'}`}>
                            Simulated ⚡
                        </div>
                    </div>
                </div>

                {/* Key Price Levels */}
                {pattern.key_levels && (
                    <div className={`p-4 rounded-2xl shadow-xl ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-slate-900'}`}>
                        <div className="text-[10px] uppercase font-black text-slate-500 mb-3 tracking-widest">Target Price Levels</div>
                        <div className="space-y-3">
                            {Object.entries(pattern.key_levels).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-bold capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className="text-sm font-black text-white tabular-nums">
                                        ${typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action CTA */}
                <button className={`w-full py-3.5 rounded-2xl text-white text-xs font-black shadow-lg transition-all active:scale-[0.98] ${pattern.direction === 'bullish'
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-100'
                    : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-100'
                    }`}>
                    GENERATE TRADING SIGNAL
                </button>
            </div>
        </div>
    );
};

export default PatternInfoCard;
