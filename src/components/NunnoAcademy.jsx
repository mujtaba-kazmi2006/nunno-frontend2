import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Zap,
    Search,
    Target,
    Compass,
    ChevronRight,
    ChevronLeft,
    Info,
    Play,
    RotateCcw,
    ShieldAlert,
    Brain,
    Activity,
    Check
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

// --- Sub-Components ---

// 1. Feature Card
const AcademyFeatureCard = ({ icon: Icon, title, description, badge, active, onClick }) => {
    const { theme } = useTheme();
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group mb-4",
                active
                    ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/20"
                    : (theme === 'dark' ? "bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/5" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")
            )}
        >
            <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                    "p-3 rounded-xl",
                    active ? "bg-white/20" : "bg-purple-500/10 text-purple-500"
                )}>
                    <Icon size={20} />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black uppercase italic tracking-widest text-sm">{title}</h3>
                        {badge && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-purple-400/20 text-purple-400 uppercase tracking-tighter">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className={cn(
                        "text-[10px] font-medium leading-tight mt-1",
                        active ? "text-purple-100" : "text-slate-500"
                    )}>{description}</p>
                </div>
                <ChevronRight size={16} className={cn("transition-transform", active ? "rotate-90" : "group-hover:translate-x-1")} />
            </div>
            {active && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
            )}
        </motion.div>
    );
};

// 2. Time Travel Simulator
const TimeTravelSimulator = () => {
    const { theme } = useTheme();
    const [step, setStep] = useState(0); // 0: Start, 1: Choice, 2: Result
    const [choice, setChoice] = useState(null);
    const [activeScenario, setActiveScenario] = useState(0);

    const scenarios = [
        {
            id: 1,
            date: 'NOV 2021',
            context: 'Bitcoin is reaching all-time highs. Headlines are euphoric. Institutional adoption is the talk of the town.',
            price_start: '$68,500',
            indicators: { rsi: 88, sentiment: 'Extreme Greed' },
            result: 'Market peaked 3 days later, entering a -70% correction.',
            lesson: 'Nunno Rule #1: When the RSI hits the ceiling and everyone is screaming MOON, it\'s time to look for the exit.'
        },
        {
            id: 2,
            date: 'JUN 2022',
            context: 'Market is in freefall. Large funds are collapsing. The media says "Crypto is Dead" for the 400th time.',
            price_start: '$17,600',
            indicators: { rsi: 18, sentiment: 'Extreme Fear' },
            result: 'This was the local bottom. Price stabilized and began a slow recovery.',
            lesson: 'Nunno Rule #2: Blood in the streets is usually an invitation, not a warning.'
        }
    ];

    const currentScenario = scenarios[activeScenario];

    return (
        <div className="space-y-4">
            <header className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Historical Simulation</h2>
                    <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">N.E.S (Neural Experience System)</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Scenario #{activeScenario + 1}</span>
                </div>
            </header>

            <div className={cn(
                "p-6 rounded-[2.5rem] border-2 border-white/5 bg-white/[0.02] relative overflow-hidden",
                theme !== 'dark' && "bg-slate-50 border-slate-200"
            )}>
                {step === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                        <Target size={48} className="mx-auto text-purple-500 mb-4" />
                        <h3 className="text-xl font-black text-white mb-2 italic uppercase">Temporal Jump Ready</h3>
                        <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm font-medium">
                            We've isolated a critical market inflection point. You will enter the market with no knowledge of the future.
                        </p>
                        <button
                            onClick={() => setStep(1)}
                            className="px-10 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest italic hover:scale-105 transition-transform text-sm"
                        >
                            Initiate Jump
                        </button>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <div className="flex items-center gap-4 text-purple-400 font-black uppercase tracking-widest text-[10px]">
                            <Compass size={14} />
                            Location: {currentScenario.date}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-black text-white italic">Current Market Matrix</h4>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                    {currentScenario.context}
                                </p>
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">Price</div>
                                        <div className="text-lg font-black text-white">{currentScenario.price_start}</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-purple-400 uppercase tracking-widest mb-1">RSI (14)</div>
                                        <div className={cn(
                                            "text-lg font-black",
                                            currentScenario.indicators.rsi > 70 ? "text-rose-500" : currentScenario.indicators.rsi < 30 ? "text-emerald-500" : "text-white"
                                        )}>{currentScenario.indicators.rsi}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Chart Area */}
                            <div className="h-48 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent)]" />
                                <div className="relative text-purple-500 flex flex-col items-center gap-2">
                                    <Activity size={20} className="animate-pulse" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">Temporal Feed Active</span>
                                </div>
                                <div className="absolute bottom-6 left-0 right-0 h-16 flex items-end justify-around px-8 opacity-30">
                                    {[30, 45, 60, 55, 75, 85, 95].map((h, i) => (
                                        <div key={i} className="w-3 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setChoice('long'); setStep(2); }}
                                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-xs"
                            >
                                GO LONG (BUY)
                            </button>
                            <button
                                onClick={() => { setChoice('short'); setStep(2); }}
                                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20 text-xs"
                            >
                                GO SHORT (SELL)
                            </button>
                            <button
                                onClick={() => { setChoice('wait'); setStep(2); }}
                                className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-slate-700 transition-colors text-xs"
                            >
                                STAY LIQUID
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-6 text-center">
                        <div>
                            <h3 className={cn(
                                "text-2xl font-black italic uppercase tracking-tighter mb-1",
                                (choice === 'long' && currentScenario.indicators.rsi > 70) || (choice === 'short' && currentScenario.indicators.rsi < 30)
                                    ? "text-rose-500"
                                    : "text-emerald-500"
                            )}>
                                {choice === 'wait' ? "SAFE PLAY" :
                                    ((choice === 'long' && currentScenario.indicators.rsi > 70) || (choice === 'short' && currentScenario.indicators.rsi < 30)
                                        ? "DRAWDOWN DETECTED" : "PROFIT CAPTURED")}
                            </h3>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Outcome: 7 Days Later</p>
                        </div>

                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 text-left">
                            <div className="flex items-center gap-3 mb-4">
                                <Brain size={20} className="text-purple-500" />
                                <h4 className="font-black text-white uppercase italic tracking-widest text-sm">Nunno's Analysis</h4>
                            </div>
                            <p className="text-slate-200 font-bold mb-2 text-sm">{currentScenario.result}</p>
                            <p className="text-slate-400 font-medium leading-relaxed mb-6 text-xs">
                                {currentScenario.lesson}
                            </p>
                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        setStep(0);
                                        setChoice(null);
                                        setActiveScenario((s) => (s + 1) % scenarios.length);
                                    }}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all flex items-center gap-3 shadow-xl shadow-purple-500/20"
                                >
                                    <RotateCcw size={14} />
                                    Next Scenario
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// 3. Candlestick Ninja Game
const CandlestickNinja = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <Zap size={48} className="text-amber-500 animate-bounce" />
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Pattern Ninja</h2>
                <p className="text-slate-400 max-w-sm font-medium text-sm">
                    Coming Soon. Test your reaction time identifying bullish engulfing and hammers in real-time volatility.
                </p>
            </div>
        </div>
    );
};

// 4. De-Jargonizer
const DeJargonizer = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <Brain size={48} className="text-purple-400 animate-pulse" />
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">De-Jargonizer</h2>
                <p className="text-slate-400 max-w-sm font-medium text-sm">
                    Translate Wall-Street speak into human language. Interactive dictionary loading...
                </p>
            </div>
        </div>
    );
};

// 5. Safe-Fail Challenges
const SafeFailChallenges = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <ShieldAlert size={48} className="text-emerald-500" />
            <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Missions</h2>
                <p className="text-slate-400 max-w-sm font-medium text-sm">
                    Level up your skills with specific tasks like "Find the divergence" or "Set a trailing stop".
                </p>
            </div>
        </div>
    );
};

// 6. Discovery Intro
const DiscoveryIntro = () => {
    return (
        <div className="space-y-6 flex flex-col items-center justify-center h-full text-center">
            <div className="size-20 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                <Info size={40} className="text-purple-500" />
            </div>
            <div className="max-w-md">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">Discovery Mode</h2>
                <p className="text-slate-400 font-medium leading-relaxed text-sm px-4">
                    This mode adds a "Training Layer" to your entire Nunno experience.
                    Glowing indicators will appear over complex charts and numbers.
                    Tap them to get an instant Nunno Card explanation.
                </p>
            </div>
            <button className="px-10 py-3 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest italic hover:bg-purple-500 transition-all shadow-xl shadow-purple-500/20 text-sm">
                ACTIVE DISCOVERY
            </button>
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                Currently optimized for Dashboard & Elite Chart
            </div>
        </div>
    );
};

const ComingSoonOverlay = () => {
    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        try {
            await axios.post('/api/v1/waitlist', {
                email,
                source: 'academy'
            });
            // Still keep local backup for immediate UI feedback
            const existing = JSON.parse(localStorage.getItem('nunno_waitlist') || '[]');
            const updated = [{ email, timestamp: new Date().toISOString() }, ...existing];
            localStorage.setItem('nunno_waitlist', JSON.stringify(updated));
            setJoined(true);
        } catch (error) {
            console.error('Academy Waitlist Error:', error);
            setJoined(true); // Fail silently for user
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-[20px] overflow-hidden pointer-events-auto">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl relative z-10 w-full px-4"
            >
                <div className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Phase 2: Neural Training</span>
                </div>

                <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.9] drop-shadow-2xl overflow-visible pr-4 md:pr-8">
                    COMING <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">SOON</span>
                </h2>

                <p className="text-slate-300 text-sm md:text-lg font-medium max-w-md mx-auto mb-10 leading-relaxed opacity-80">
                    Our educational nodes are undergoing heavy reconstruction to bring you institutional-grade market simulations.
                </p>

                <AnimatePresence mode="wait">
                    {!joined ? (
                        <motion.form
                            key="waitlist-form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleJoin}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full"
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your terminal ID (email)"
                                className="w-full sm:flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-10 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white rounded-2xl font-black uppercase tracking-widest italic transition-all shadow-xl shadow-purple-600/20 active:scale-95 text-xs whitespace-nowrap"
                            >
                                {loading ? 'Syncing...' : 'Join Waitlist'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-purple-500/10 border border-purple-500/20 p-8 rounded-[2.5rem] backdrop-blur-md max-w-md mx-auto"
                        >
                            <div className="size-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-purple-500/40">
                                <Check size={32} className="text-white" strokeWidth={4} />
                            </div>
                            <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-2">Access Reserved</h3>
                            <p className="text-slate-400 text-sm font-medium">You'll be the first to receive the neural handshake when Phase 2 goes live.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!joined && (
                    <button
                        onClick={() => window.history.back()}
                        className="mt-8 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest italic transition-all"
                    >
                        Return Home
                    </button>
                )}
            </motion.div>
        </div>
    );
};

const NunnoAcademy = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('simulator');

    const tabs = [
        { id: 'simulator', title: 'Simulator', icon: Target, desc: 'Practice in historical markets', badge: 'Elite' },
        { id: 'ninja', title: 'Pattern Ninja', icon: Zap, desc: 'Master visual identification', badge: 'Play' },
        { id: 'jargon', title: 'De-Jargon', icon: Brain, desc: 'Understand complex terms', badge: 'New' },
        { id: 'missions', title: 'Missions', icon: ShieldAlert, desc: 'Safe-fail trading challenges', badge: 'XP' },
        { id: 'discovery', title: 'Discovery', icon: Info, desc: 'UI Interactive mode', badge: 'NEW' }
    ];

    return (
        <div className="h-full flex flex-col overflow-hidden bg-transparent pt-12 px-4 sm:px-8 pb-6 relative">
            <ComingSoonOverlay />
            <div className="max-w-7xl mx-auto w-full flex flex-col h-full opacity-20 filter grayscale pointer-events-none">

                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pl-14 md:pl-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="hidden md:block text-purple-500" size={28} />
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                                Nunno <span className="text-purple-500">Academy</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">
                            Neural Skill Acquisition Program // Subject: Investment Literacy
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Academy Level</div>
                            <div className="text-xl font-black text-white italic">LVL. 01</div>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="text-center">
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Learning Streak</div>
                            <div className="text-xl font-black text-emerald-500 italic">3 DAYS</div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_2fr] gap-8 overflow-hidden">

                    {/* Feature Sidebar */}
                    <div className="space-y-3 overflow-y-auto no-scrollbar pb-6 pr-2">
                        {tabs.map((tab) => (
                            <AcademyFeatureCard
                                key={tab.id}
                                icon={tab.icon}
                                title={tab.title}
                                description={tab.desc}
                                badge={tab.badge}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            />
                        ))}

                        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 mt-4 relative overflow-hidden group cursor-pointer shadow-xl shadow-indigo-600/20">
                            <div className="relative z-10">
                                <h3 className="text-white font-black uppercase italic tracking-widest mb-1 text-base">Final Exam</h3>
                                <p className="text-indigo-100 text-[9px] font-medium leading-relaxed">
                                    Unlock your Analyst Certificate after completing 5 simulations.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 p-3 opacity-50 group-hover:scale-125 transition-transform">
                                <GraduationCap size={40} className="text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Active View */}
                    <main className={cn(
                        "rounded-[2.5rem] p-8 relative overflow-hidden",
                        theme === 'dark' ? "bg-white/[0.02] border border-white/5 shadow-2xl" : "bg-white border border-slate-200 shadow-xl"
                    )}>
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 size-96 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {activeTab === 'simulator' && <TimeTravelSimulator />}
                                {activeTab === 'ninja' && <CandlestickNinja />}
                                {activeTab === 'jargon' && <DeJargonizer />}
                                {activeTab === 'missions' && <SafeFailChallenges />}
                                {activeTab === 'discovery' && <DiscoveryIntro />}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default NunnoAcademy;
