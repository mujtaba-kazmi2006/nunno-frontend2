import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const tutorialSteps = [
    {
        title: "Welcome to Nunno! 👋",
        description: "I'm Nunno, your personal AI financial educator. I'm here to help you understand the markets without the jargon.",
        path: "/dashboard",
        target: "body",
        position: "center"
    },
    {
        title: "AI Chat Interface 💬",
        description: "Ask me anything about crypto, stocks, or financial concepts. I'll explain things in 'Easy Mode' just for you.",
        path: "/dashboard",
        target: ".chat-container",
        position: "right"
    },
    {
        title: "Market Pulse 💓",
        description: "See the current market temperature. We track sentiment and volatility to give you a quick read on the market mood.",
        path: "/dashboard",
        target: ".sidebar",
        position: "left"
    },
    {
        title: "Elite Charting 📈",
        description: "Deep dive into any asset with our Elite Chart. It uses AI to recognize patterns and simulate future price possibilities.",
        path: "/elite-chart",
        target: "body",
        position: "center"
    },
    {
        title: "Pattern Recognition 🧠",
        description: "Our AI automatically detects technical patterns like Head & Shoulders or Triangles to help you learn charting.",
        path: "/elite-chart",
        target: ".pattern-controls",
        position: "bottom"
    },
    {
        title: "Your Account ⚙️",
        description: "Track your AI token usage and manage your subscription level here.",
        path: "/settings",
        target: "body",
        position: "center"
    },
    {
        title: "You're All Set! 🚀",
        description: "You're now ready to explore. Remember, I'm always here in the chat if you have any questions!",
        path: "/dashboard",
        target: "body",
        position: "center"
    }
];

export default function TutorialOverlay({ isOpen, onClose, experienceLevel }) {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    // Only show for beginners who haven't finished it
    const isBeginner = experienceLevel === 'beginner';

    useEffect(() => {
        if (isOpen && tutorialSteps[currentStep]) {
            const step = tutorialSteps[currentStep];
            if (location.pathname !== step.path) {
                navigate(step.path);
            }
        }
    }, [currentStep, isOpen]);

    if (!isOpen || !isBeginner) return null;

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    const handleNext = () => {
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

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] pointer-events-none">
                {/* Backdrop with hole (Simplified for now, just a darkened overlay) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
                    onClick={onClose}
                />

                {/* Tutorial Card */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-[#1e2030] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-purple-100 dark:border-slate-800"
                    >
                        {/* Progress bar */}
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-800">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-6 sm:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                                    <HelpCircle className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-gray-400"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <motion.h2
                                key={`title-${currentStep}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl font-bold text-gray-800 dark:text-white mb-3"
                            >
                                {step.title}
                            </motion.h2>

                            <motion.p
                                key={`desc-${currentStep}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-gray-600 dark:text-slate-400 leading-relaxed mb-8"
                            >
                                {step.description}
                            </motion.p>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={onClose}
                                    className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    Skip Tutorial
                                </button>

                                <div className="flex gap-3">
                                    {currentStep > 0 && (
                                        <button
                                            onClick={handleBack}
                                            className="p-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center gap-2 group"
                                    >
                                        {isLastStep ? 'Get Started' : 'Next'}
                                        {!isLastStep && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Step indicator */}
                        <div className="px-8 pb-6 flex justify-center gap-1.5">
                            {tutorialSteps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-purple-500' : 'w-1.5 bg-gray-200 dark:bg-slate-800'
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Arrow Pointer (Conditional based on position) */}
                {step.target !== "body" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={`arrow-${currentStep}`}
                        className="absolute hidden md:block"
                        style={{
                            // This is a simplified positioning logic
                            // In a real app we would use getBoundingClientRect
                            ...(step.position === 'right' ? { left: '30%', top: '50%' } : {}),
                            ...(step.position === 'left' ? { right: '30%', top: '50%' } : {}),
                            ...(step.position === 'bottom' ? { left: '50%', top: '30%' } : {}),
                        }}
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ x: [0, 10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="bg-purple-600 text-white p-3 rounded-full shadow-xl"
                            >
                                <ArrowRight size={24} className={step.position === 'left' ? 'rotate-180' : step.position === 'bottom' ? 'rotate-90' : ''} />
                            </motion.div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-purple-400/30 rounded-full animate-ping" />
                        </div>
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
}
