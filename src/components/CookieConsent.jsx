import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Check, X } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('nunno_cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 3000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('nunno_cookie_consent', 'accepted');
        setIsVisible(false);
        // Re-enable GA if it was paused
        if (window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
        }
    };

    const handleDecline = () => {
        localStorage.setItem('nunno_cookie_consent', 'declined');
        setIsVisible(false);
        // Disable GA tracking
        if (window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied'
            });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 80 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                    className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-[9999]"
                >
                    <div className="bg-[#0c0c14] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
                        <div className="flex items-start gap-4">
                            <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                                <Cookie size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-black italic uppercase tracking-tight text-sm mb-2">Cookie Notice</h4>
                                <p className="text-slate-500 text-xs leading-relaxed font-medium mb-4">
                                    Nunno uses cookies and Google Analytics to improve your educational experience. No personal data is sold.
                                    <a href="/privacy" className="text-purple-400 hover:text-white transition-colors ml-1">Learn more</a>
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAccept}
                                        className="flex-1 py-2.5 px-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-purple-500 hover:text-white transition-all active:scale-95"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={handleDecline}
                                        className="py-2.5 px-4 bg-white/5 border border-white/10 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
