import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Zap, Target, BookOpen, MessageSquare, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';

const tutorialSteps = [
    {
        id: 'welcome',
        title: "Welcome to Nunno! 👋",
        description: "I'm Nunno, your AI helper. I'll help you understand how to grow your money without all the confusing math.",
        path: "/dashboard",
        position: "center",
        action: null
    },
    {
        id: 'chat_intro',
        title: "How to use the Chat 🔍",
        description: "The market changes fast. Ask me anything, or pick one of the learning paths below.",
        path: "/dashboard",
        position: "bottom-right",
        action: null
    },
    {
        id: 'roast_demo',
        title: "Check for Risks 🔥",
        description: "Let's check if Bitcoin is a safe choice right now. This helps you avoid losing money to hype.",
        path: "/dashboard",
        position: "bottom-right",
        action: "Explain the risks of buying Bitcoin right now",
        actionLabel: "Analyze Risks"
    },
    {
        id: 'price_forecast',
        title: "Predicting the Future 🔮",
        description: "I'll look at historical trends to guess where the price might go next.",
        path: "/dashboard",
        position: "bottom-right",
        action: "What do you think the price of BTC will be tomorrow?",
        actionLabel: "Predict Price"
    },
    {
        id: 'market_scan',
        title: "Finding Opportunities 📡",
        description: "I can scan the market to find good coins that most people haven't noticed yet.",
        path: "/dashboard",
        position: "bottom-right",
        action: "Find some good coins with strong potential for growth",
        actionLabel: "Find Gems"
    },
    {
        id: 'academy_intro',
        title: "Learning Center 🎓",
        description: "This is the Academy. You can practice trading here using fake money until you feel confident.",
        path: "/academy",
        position: "bottom-right",
        action: null
    },
    {
        id: 'elite_chart',
        title: "The Chart Room 📈",
        description: "This is a advanced chart where you can see exactly where the money is flowing.",
        path: "/elite-chart",
        position: "bottom-right",
        action: null
    },
    {
        id: 'final',
        title: "You're All Set! 🚀",
        description: "The tutorial is over. You're ready to start your journey. Let's make some smart choices!",
        path: "/dashboard",
        position: "center",
        action: null
    }
];

export default function TutorialOverlay({ isOpen, onClose, experienceLevel }) {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { setPendingMessage } = useChat();

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    useEffect(() => {
        if (isOpen && step) {
            if (location.pathname !== step.path) {
                navigate(step.path);
            }
        }
    }, [currentStep, isOpen, step, location.pathname, navigate]);

    const handleNext = () => {
        if (step.action) {
            setPendingMessage(step.action);
        }

        if (isLastStep) {
            onClose();
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    const isCenter = step?.position === 'center';

    return (
        <AnimatePresence>
            {isOpen && step && (
                <div className="fixed inset-0 z-[9999] pointer-events-none">
                    {/* Visual context backdrop - subtle */}
                    {isCenter && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                            onClick={handleSkip}
                        />
                    )}

                    {/* Corner Tutorial Card - Ultra Compact */}
                    <div className={`absolute inset-0 flex p-4 sm:p-10 pointer-events-none items-end ${isCenter ? 'items-center justify-center' : 'justify-center sm:justify-end'}`}>
                        <motion.div
                            key={step.id}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={`pointer-events-auto bg-[#0a0a0f] border border-purple-500/50 rounded-[2rem] shadow-[0_0_50px_rgba(139,92,246,0.3)] w-full ${isCenter ? 'max-w-md' : 'max-w-xs sm:max-w-sm'} overflow-hidden relative ring-1 ring-white/10`}
                        >
                            {/* Status bar */}
                            <div className="h-1 w-full bg-white/5">
                                <motion.div
                                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                                />
                            </div>

                            <div className="p-5 sm:p-7 relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="flex items-center gap-2">
                                        <div className="size-2 bg-purple-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 italic">
                                            Tutorial: Step {currentStep + 1}
                                        </span>
                                    </span>
                                    <button
                                        onClick={handleSkip}
                                        className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Icon & Title */}
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="size-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                                        {step.id === 'welcome' && <span className="text-xl">👋</span>}
                                        {step.id === 'chat_intro' && <MessageSquare size={20} />}
                                        {step.id === 'roast_demo' && <Zap size={20} />}
                                        {step.id === 'price_forecast' && <Sparkles size={20} />}
                                        {step.id === 'market_scan' && <Target size={20} />}
                                        {step.id === 'market_pulse' && <TrendingUp size={20} />}
                                        {step.id === 'academy_intro' && <BookOpen size={20} />}
                                        {step.id === 'elite_chart' && <span className="text-xl">📈</span>}
                                        {step.id === 'final' && <span className="text-xl">🚀</span>}
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-lg font-black text-white italic uppercase tracking-tight leading-tight">
                                            {step.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                                    {step.description}
                                </p>

                                {/* UI Controls */}
                                <div className="flex items-center gap-2">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="p-3 sm:p-4 rounded-2xl border border-white/5 text-slate-500 hover:bg-white/5 transition-colors"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                    )}

                                    <button
                                        onClick={handleNext}
                                        className="flex-1 py-3 sm:py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black uppercase tracking-widest italic text-[10px] sm:text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {step.actionLabel || (isLastStep ? 'Finish' : 'Next')}
                                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
