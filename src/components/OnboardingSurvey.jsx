import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Zap, ChevronRight, CheckCircle2, Sparkles, BookOpen, BarChart3, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const OnboardingSurvey = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [selections, setSelections] = useState({
        knowledge: '',
        persona: '',
        goal: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { updateProfile } = useAuth();
    const { theme } = useTheme();

    const steps = [
        {
            id: 'knowledge',
            title: 'Neural Baseline',
            subtitle: 'What is your current understanding of Technical Analysis?',
            options: [
                { id: 'beginner', label: 'Beginner', desc: 'Just starting my financial journey', icon: <BookOpen className="w-5 h-5" />, color: 'purple' },
                { id: 'intermediate', label: 'Intermediate', desc: 'I understand RSI, EMA, and basic patterns', icon: <BarChart3 className="w-5 h-5" />, color: 'blue' },
                { id: 'pro', label: 'Professional', desc: 'I trade institutional-grade setups', icon: <Zap className="w-5 h-5" />, color: 'amber' }
            ]
        },
        {
            id: 'persona',
            title: 'Communication Protocol',
            subtitle: 'How should Nunno AI explain market data to you?',
            options: [
                { id: 'simple', label: 'Plain English', desc: 'Avoid jargon, keep it visual and clear', icon: <Target className="w-5 h-5" />, color: 'green' },
                { id: 'technical', label: 'Technical Intel', desc: 'Use full professional terminology', icon: <Brain className="w-5 h-5" />, color: 'indigo' },
                { id: 'aggressive', label: 'Direct Signals', desc: 'Hard data, direct bias, zero fluff', icon: <Rocket className="w-5 h-5" />, color: 'rose' }
            ]
        },
        {
            id: 'goal',
            title: 'Operational Directive',
            subtitle: 'What is your primary objective today?',
            options: [
                { id: 'learn', label: 'Deep Learning', desc: 'Master the logic behind every move', icon: <Sparkles className="w-5 h-5" />, color: 'purple' },
                { id: 'scan', label: 'Elite Scanning', desc: 'Locate imminent price breakouts', icon: <Target className="w-5 h-5" />, color: 'emerald' },
                { id: 'simulate', label: 'Risk Intelligence', desc: 'Run Monte Carlo & Scenario models', icon: <Zap className="w-5 h-5" />, color: 'blue' }
            ]
        }
    ];

    const currentStepData = steps[step - 1];

    const handleSelect = (optionId) => {
        setSelections(prev => ({ ...prev, [currentStepData.id]: optionId }));
        if (step < steps.length) {
            setTimeout(() => setStep(step + 1), 300);
        } else {
            handleFinalize();
        }
    };

    const handleFinalize = async () => {
        setIsSubmitting(true);
        try {
            // Save to profile
            await updateProfile({
                onboarding_metadata: selections,
                experience_level: selections.knowledge,
                persona: selections.persona
            });
            onComplete();
        } catch (error) {
            console.error('Failed to save onboarding:', error);
            onComplete(); // Move on anyway but log it
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Dark Atmospheric Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#07080d]/95 backdrop-blur-3xl"
            >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-xl bg-[#0c0c14]/80 border border-white/10 rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-xl"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 flex gap-1 px-1 pt-1">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`flex-1 h-full rounded-full transition-all duration-700 ${i + 1 <= step ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/5'}`}
                        />
                    ))}
                </div>

                <div className="p-8 sm:p-12">
                    {/* Header */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="text-center mb-10"
                        >
                            <span className="text-[10px] font-black text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full uppercase tracking-[0.3em] italic mb-4 inline-block">
                                Phase 0{step} Protocol
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white italic uppercase tracking-tighter leading-tight mb-3">
                                {currentStepData.title}
                            </h2>
                            <p className="text-slate-400 text-sm font-medium italic">
                                {currentStepData.subtitle}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode="wait">
                            {currentStepData.options.map((option, idx) => (
                                <motion.button
                                    key={option.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleSelect(option.id)}
                                    className={`group relative flex items-center gap-5 p-5 sm:p-6 rounded-3xl border-2 transition-all duration-500 text-left active:scale-[0.98] ${selections[currentStepData.id] === option.id
                                            ? 'bg-purple-600 border-purple-400 text-white shadow-[0_20px_50px_rgba(168,85,247,0.25)] scale-[1.02]'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.07]'
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 overflow-hidden ${selections[currentStepData.id] === option.id
                                            ? 'bg-white text-purple-600 shadow-xl'
                                            : 'bg-white/5 text-slate-400 group-hover:text-white'
                                        }`}>
                                        {option.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-black uppercase tracking-widest italic text-sm mb-1 ${selections[currentStepData.id] === option.id ? 'text-white' : 'text-slate-200'
                                            }`}>
                                            {option.label}
                                        </div>
                                        <div className={`text-xs font-medium italic ${selections[currentStepData.id] === option.id ? 'text-purple-100/70' : 'text-slate-500'
                                            }`}>
                                            {option.desc}
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${selections[currentStepData.id] === option.id ? 'translate-x-1 opacity-100' : 'opacity-0'
                                        }`} />
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Syncing with Neural Link</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            {step} / {steps.length}
                        </div>
                    </div>
                </div>

                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[10]"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full animate-spin border-t-purple-600 shadow-[0_0_40px_rgba(168,85,247,0.3)]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="text-purple-400 w-8 h-8 animate-pulse" />
                                </div>
                            </div>
                            <span className="text-xs font-black text-white uppercase tracking-[0.4em] italic animate-pulse">Initializing Intel...</span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default OnboardingSurvey;
