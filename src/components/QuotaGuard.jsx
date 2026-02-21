import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { Suspense, lazy } from 'react';
import { cn } from '../utils/cn';

// Lazy load pricing to keep QuotaGuard light
const NunnoPricing = lazy(() => import('./NunnoPricing'));

const QuotaGuard = () => {
    const { user } = useAuth();
    const [showToast, setShowToast] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [lastScanCount, setLastScanCount] = useState(0);

    const TIER_LIMITS = {
        free: 10,
        pro: 100,
        whale: 1000
    };

    useEffect(() => {
        if (!user) return;

        const tier = user.tier || 'free';
        const limit = TIER_LIMITS[tier];
        const searches = user.searches_today || 0;
        const usagePercent = (searches / limit) * 100;

        // Show Toast at 80% or 100% usage
        if (usagePercent >= 80 && searches !== lastScanCount) {
            setShowToast(true);
            setLastScanCount(searches);

            // Only auto-hide if it's just a warning (not 100%)
            if (usagePercent < 100) {
                const timer = setTimeout(() => setShowToast(false), 8000);
                return () => clearTimeout(timer);
            }
        }
    }, [user?.searches_today, user?.tier, user?.tokens_remaining]);

    return (
        <>
            {/* Dynamic Toast at 80% */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 100, x: '-50%' }}
                        className={cn(
                            "fixed bottom-10 left-1/2 z-[2000] w-[95%] max-w-md border-2 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-5 cursor-pointer backdrop-blur-xl group",
                            (user.searches_today / TIER_LIMITS[user.tier || 'free']) >= 1
                                ? "bg-rose-500/10 border-rose-500/30"
                                : "bg-[#16161e] border-amber-500/30"
                        )}
                        onClick={() => setShowPricingModal(true)}
                    >
                        <div className={cn(
                            "size-14 rounded-xl flex items-center justify-center transition-all duration-500",
                            (user.searches_today / TIER_LIMITS[user.tier || 'free']) >= 1
                                ? "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white"
                                : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
                        )}>
                            <AlertTriangle size={28} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h4 className="text-white font-black italic uppercase tracking-tighter text-sm">
                                    {(user.searches_today / TIER_LIMITS[user.tier || 'free']) >= 1 ? "Scan Capacity Reached" : "Neural Nodes Fatigued"}
                                </h4>
                                {(user.searches_today / TIER_LIMITS[user.tier || 'free']) >= 1 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[8px] font-black text-white uppercase tracking-widest">SCANS LOCKED</span>
                                )}
                            </div>
                            <p className="text-slate-400 text-xs font-semibold mt-0.5">
                                {(user.searches_today / TIER_LIMITS[user.tier || 'free']) >= 1
                                    ? "Market scans & predictions are paused. AI Chat & Charts are still active!"
                                    : `Nunno's nodes are getting tired. ${TIER_LIMITS[user.tier || 'free'] - user.searches_today} scans left today.`}
                            </p>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowToast(false); }}
                            className="text-slate-600 hover:text-white transition-colors p-2"
                        >
                            <X size={20} />
                        </button>

                        {/* Progress Bar background */}
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full rounded-b-2xl overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 8, ease: "linear" }}
                                className="h-full bg-amber-500"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pricing Modal at 100% */}
            <AnimatePresence>
                {showPricingModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-[20px] flex items-start justify-center p-4 md:p-12 overflow-y-auto no-scrollbar"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 40, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-7xl"
                        >
                            <div className="flex justify-between items-center mb-6 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                                        <Zap size={20} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-black italic uppercase tracking-tighter text-2xl">Upgrade Required</h2>
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Neural Capacity Reached</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl transition-all active:scale-95"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                                <Suspense fallback={
                                    <div className="h-[600px] flex items-center justify-center bg-[#0c0c14]">
                                        <div className="animate-spin size-12 border-4 border-purple-500 border-t-transparent rounded-full" />
                                    </div>
                                }>
                                    <NunnoPricing onClose={() => setShowPricingModal(false)} />
                                </Suspense>
                            </div>

                            <p className="text-center mt-8 text-slate-500 text-xs font-medium italic">
                                "Financial freedom is one upgrade away." — Nunno
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default QuotaGuard;
