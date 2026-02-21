import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, TrendingUp, TrendingDown, Clock, Sparkles, ChevronRight, Activity, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

const NeuralPersistenceHUD = ({ isInitialState }) => {
    const { user, isAuthenticated } = useAuth();
    const { theme } = useTheme();

    // In a real app, this would be fetched from a 'Neural Context' endpoint
    const [context, setContext] = useState({
        activeAsset: 'BTCUSDT',
        currentBias: 'Cautiously Bullish',
        biasScore: 72,
        lastDirective: 'Scanning for RSI divergence on 4h timeframe',
        criticalChange: 'BTC dominance increased by 1.2% while you were away.',
        linkStatus: 'Synced'
    });

    if (!isAuthenticated || !isInitialState) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl mx-auto mb-12"
        >
            <div className={cn(
                "relative overflow-hidden rounded-[2.5rem] border backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)]",
                theme === 'dark' ? "bg-[#0c0c14]/40 border-white/5" : "bg-white/40 border-purple-100"
            )}>
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative p-8 sm:p-10 flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                    {/* Left: Identity & Bias */}
                    <div className="flex-shrink-0 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="relative mb-6">
                            <motion.div
                                animate={{
                                    scale: [1, 1.08, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-24 h-24 flex items-center justify-center relative z-10"
                            >
                                <img src="/logo.png" alt="NUNNO" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
                            </motion.div>
                            {/* Neural Link Status tag */}
                            <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-lg bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest border-2 border-[#0c0c14] z-20">
                                {context.linkStatus}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Neural Status</span>
                            <h3 className={cn(
                                "text-2xl font-black italic uppercase tracking-tighter",
                                theme === 'dark' ? "text-white" : "text-slate-900"
                            )}>
                                Welcome Back, {user?.name?.split(' ')[0]}
                            </h3>
                        </div>
                    </div>

                    {/* Middle: Intelligence Persistence */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {/* Current Bias Card */}
                        <div className={cn(
                            "p-6 rounded-3xl border transition-all hover:scale-[1.02]",
                            theme === 'dark' ? "bg-white/[0.03] border-white/5" : "bg-white/60 border-purple-50"
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Target className="text-purple-500" size={16} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Bias: {context.activeAsset}</span>
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase italic">{context.biasScore}% Conf.</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {context.currentBias.includes('Bullish') ? <TrendingUp className="text-emerald-500" /> : <TrendingDown className="text-rose-500" />}
                                <h4 className={cn(
                                    "text-lg font-black uppercase italic tracking-tight",
                                    theme === 'dark' ? "text-white" : "text-slate-800"
                                )}>
                                    {context.currentBias}
                                </h4>
                            </div>
                        </div>

                        {/* Intelligence Alert */}
                        <div className={cn(
                            "p-6 rounded-3xl border border-dashed transition-all hover:scale-[1.02]",
                            theme === 'dark' ? "bg-purple-500/5 border-purple-500/20" : "bg-purple-50 border-purple-200"
                        )}>
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="text-purple-400" size={16} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Delta Intel</span>
                            </div>
                            <p className={cn(
                                "text-xs font-medium italic leading-relaxed",
                                theme === 'dark' ? "text-slate-300" : "text-slate-600"
                            )}>
                                "{context.criticalChange}"
                            </p>
                        </div>
                    </div>

                    {/* Right: Operational Directive */}
                    <div className={cn(
                        "w-full lg:w-64 p-6 rounded-3xl self-stretch flex flex-col justify-between border",
                        theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
                    )}>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="text-slate-500" size={14} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Directive</span>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 italic uppercase tracking-tighter leading-tight border-l-2 border-purple-500/30 pl-3">
                                {context.lastDirective}
                            </p>
                        </div>

                        <button className="mt-6 w-full flex items-center justify-between group">
                            <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest group-hover:mr-2 transition-all">Resume Session</span>
                            <ChevronRight size={14} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar Bottom */}
                <div className="h-1 w-full bg-white/5 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-50 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    />
                </div>
            </div>

            {/* Disclaimer Mini */}
            <div className="mt-4 flex items-center justify-center gap-2 opacity-30 group hover:opacity-100 transition-opacity">
                <ShieldAlert size={10} className="text-slate-400" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Neural context persists 48h after last activity</span>
            </div>
        </motion.div>
    );
};

export default NeuralPersistenceHUD;
