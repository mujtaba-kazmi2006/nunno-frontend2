import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronRight, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export default function LanguageSelector({ isOpen, onClose }) {
    const { user, updateProfile } = useAuth();
    const [selected, setSelected] = useState(user?.language || 'en');
    const [loading, setLoading] = useState(false);

    const languages = [
        {
            id: 'en',
            name: 'English',
            nativeName: 'English',
            description: 'International business standard',
            icon: '🇬🇧'
        },
        {
            id: 'ur',
            name: 'Urdu',
            nativeName: 'اردو',
            description: 'Official language of Pakistan',
            icon: '🇵🇰'
        },
        {
            id: 'roman_ur',
            name: 'Roman Urdu',
            nativeName: 'Roman Urdu',
            description: 'Urdu written in English script',
            icon: '💬'
        }
    ];

    const handleSave = async () => {
        setLoading(true);
        const result = await updateProfile({ language: selected });
        setLoading(false);
        if (result.success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 flex items-center justify-center z-[1100] p-4 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: 10 }}
                    className="relative w-full max-w-lg bg-[#0c0c14] border border-white/10 rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,1)] overflow-hidden"
                >
                    {/* Interior Lighting Effects */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative p-8 sm:p-12">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6"
                            >
                                <Languages size={32} />
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3"
                            >
                                Select Your<br />
                                <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-4">
                                    Language
                                </span>
                            </motion.h2>
                            <p className="text-slate-400 text-sm font-medium italic">
                                Choose how Nunno communicates with you
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-4 mb-10">
                            {languages.map((lang, index) => (
                                <motion.button
                                    key={lang.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    onClick={() => setSelected(lang.id)}
                                    className={cn(
                                        "w-full group relative flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all duration-500 text-left",
                                        selected === lang.id
                                            ? "bg-purple-600 border-purple-400 text-white shadow-[0_20px_40px_rgba(168,85,247,0.2)]"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 flex items-center justify-center text-2xl rounded-2xl transition-colors duration-500",
                                        selected === lang.id ? "bg-white/20" : "bg-white/5"
                                    )}>
                                        {lang.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-black uppercase tracking-widest italic">{lang.name}</span>
                                            <span className="text-[10px] opacity-60 font-medium">({lang.nativeName})</span>
                                        </div>
                                        <p className="text-[10px] font-medium opacity-60 italic mt-0.5">{lang.description}</p>
                                    </div>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                        selected === lang.id
                                            ? "bg-white border-white text-purple-600 scale-100"
                                            : "border-white/10 text-transparent scale-75 group-hover:border-white/30"
                                    )}>
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full group relative py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] italic hover:bg-purple-600 hover:text-white transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover:outline-none group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin group-hover:border-white group-hover:border-t-transparent" />
                                ) : (
                                    <>
                                        CONFIRM_SELECTION
                                        <ChevronRight size={20} />
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
