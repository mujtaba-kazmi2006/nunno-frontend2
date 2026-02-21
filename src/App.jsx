import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu, Sun, Moon, ChevronLeft, ChevronRight, Newspaper, Zap, ShieldCheck } from 'lucide-react'
import LandingPage from './components/LandingPage'
import EliteChart from './components/EliteChart'  // Elite charting experience
import { ChatProvider, useChat } from './contexts/ChatContext'
import { useNavigate } from 'react-router-dom'
import { MarketDataProvider } from './contexts/MarketDataContext'
import { useTheme } from './contexts/ThemeContext'
import { useAuth } from './contexts/AuthContext'
import { cn } from './utils/cn'
import TutorialOverlay from './components/TutorialOverlay'
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "311857309948-3ihs0cgoqbq93s91g24ul390vfugnf39.apps.googleusercontent.com";

// Premium Production Error Boundary
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-[#020205] text-white p-12 text-center">
                    <div className="max-w-md">
                        <h1 className="text-4xl font-black text-purple-500 mb-4 tracking-tighter">APP_STABILITY_MODE</h1>
                        <p className="text-slate-400 mb-8 italic">"Even in chaos, there is opportunity." - Nunno</p>
                        <p className="text-sm text-slate-500 mb-8">A technical disruption occurred. We are working on fixing it now. Your data remains safe.</p>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-bold transition-all transform active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)]">RELOAD_PAGE</button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Lazy load non-critical components
const NunnoPricing = lazy(() => import('./components/NunnoPricing'))
const AccountSettings = lazy(() => import('./components/AccountSettings'))
const ChatHistory = lazy(() => import('./components/ChatHistory'))
const HelpSupport = lazy(() => import('./components/HelpSupport'))
const NunnoAcademy = lazy(() => import('./components/NunnoAcademy'))
const InvestorMetrics = lazy(() => import('./components/InvestorMetrics'))
const RiskWatchlistSidebar = lazy(() => import('./components/RiskWatchlistSidebar'))

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
    )
}

import MiniWidgets from './components/MiniWidgets'
import MarketHighlights from './components/MarketHighlights'
import NewsIntelligence from './components/NewsIntelligence'

import { NeuralActionProvider, useNeuralAction } from './contexts/NeuralActionContext'
import QuotaGuard from './components/QuotaGuard'

function Dashboard({ userAge }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const { setPendingMessage, messages } = useChat();
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isNewsOpen, setIsNewsOpen] = useState(false);
    const [isRiskOpen, setIsRiskOpen] = useState(false);

    // Neural Integration: Handle URL parameters for tabs
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab === 'market') setIsMarketOpen(true);
        if (tab === 'news') setIsNewsOpen(true);
        if (tab === 'risk') setIsRiskOpen(true);
        if (tab === 'fomo') setIsMarketOpen(true); // Fomo is in market sidebar
        if (tab === 'roast') setIsMarketOpen(true); // Roast is also in market sidebar
    }, [location.search]);

    const handleAnalyzeChart = (ticker) => {
        navigate(`/elite-chart?ticker=${ticker}`);
    };

    const handleAnalyzeTokenomics = (ticker) => {
        setPendingMessage(`Analyze the tokenomics of ${ticker.replace('USDT', '')} for me. Search the web for the latest supply data, utility, and distribution.`);
    };

    // Determine if we should show the floating intro or the chat
    const isInitial = messages.length <= 1;

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <div className="main-container relative h-full flex flex-row overflow-hidden">
                <main className={cn(
                    "flex-1 h-full relative transition-all duration-500 ease-in-out overflow-hidden will-change-[margin] dashboard-container",
                    (isMarketOpen || isNewsOpen || isRiskOpen) && !isInitial
                        ? (
                            (isMarketOpen && isNewsOpen && isRiskOpen) ? "xl:mr-[960px]" :
                                ((isMarketOpen && isNewsOpen) || (isMarketOpen && isRiskOpen) || (isNewsOpen && isRiskOpen)) ? "xl:mr-[640px]" : "xl:mr-80"
                        )
                        : "mr-0"
                )}>
                    {((isMarketOpen || isNewsOpen || isRiskOpen) && !isInitial) && (
                        <div
                            className="xl:hidden absolute inset-0 bg-black/40 z-30 transition-opacity duration-300"
                            onClick={() => { setIsMarketOpen(false); setIsNewsOpen(false); setIsRiskOpen(false); }}
                        />
                    )}

                    <ChatInterface userAge={userAge} />
                </main>

                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-[41] flex flex-col will-change-transform shadow-2xl",
                        theme === 'dark'
                            ? "bg-[#0c0c14] border-l border-white/5"
                            : "bg-white border-l border-purple-100/50",
                        isNewsOpen ? "translate-x-0" : "translate-x-full",
                        // News is always the leftmost open panel: offset by risk + market widths
                        isMarketOpen && isRiskOpen ? "mr-[640px]" :
                            (isMarketOpen || isRiskOpen) ? "mr-80" : "mr-0",
                        "w-80"
                    )}>
                        {/* Tab handle — always visible because it's on the left edge of this panel */}
                        <button
                            onClick={() => setIsNewsOpen(!isNewsOpen)}
                            className={cn(
                                "absolute left-[-40px] top-[30%] -translate-y-1/2 w-10 h-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] border border-r-0 rounded-l-3xl flex items-center justify-center transition-all pointer-events-auto",
                                theme === 'dark'
                                    ? "bg-[#0c0c14] border-white/10 text-purple-400 hover:text-white"
                                    : "bg-white border-purple-100 text-purple-600 hover:text-purple-800",
                                !isNewsOpen && "opacity-80 hover:opacity-100"
                            )}
                            title={isNewsOpen ? "Close News" : "Open News"}
                        >
                            <Newspaper size={20} strokeWidth={2.5} />
                        </button>

                        {/* In-panel close button — always reachable */}
                        {isNewsOpen && (
                            <button
                                onClick={() => setIsNewsOpen(false)}
                                className={cn(
                                    "absolute top-4 right-4 z-50 p-2 rounded-xl transition-all",
                                    theme === 'dark'
                                        ? "bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                        : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500"
                                )}
                                title="Close News"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}

                        <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar">
                            <Suspense fallback={<LoadingFallback />}>
                                <NewsIntelligence />
                            </Suspense>
                        </div>
                    </aside>
                )}

                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-[42] flex flex-col will-change-transform shadow-2xl",
                        theme === 'dark'
                            ? "bg-[#0c0c14] border-l border-white/5"
                            : "bg-white border-l border-purple-100/50",
                        isRiskOpen ? "translate-x-0" : "translate-x-full",
                        // Risk is middle: offset by market width when market is also open
                        isMarketOpen ? "mr-80" : "mr-0",
                        "w-80"
                    )}>
                        {/* Tab handle */}
                        <button
                            onClick={() => setIsRiskOpen(!isRiskOpen)}
                            className={cn(
                                "absolute left-[-40px] top-[50%] -translate-y-1/2 w-10 h-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] border border-r-0 rounded-l-3xl flex items-center justify-center transition-all pointer-events-auto",
                                theme === 'dark'
                                    ? "bg-[#0c0c14] border-white/10 text-emerald-400 hover:text-white"
                                    : "bg-white border-purple-100 text-emerald-600 hover:text-emerald-800",
                                !isRiskOpen && "opacity-80 hover:opacity-100"
                            )}
                            title={isRiskOpen ? "Close Risk Monitor" : "Open Risk Monitor"}
                        >
                            <ShieldCheck size={20} strokeWidth={2.5} />
                        </button>

                        {/* In-panel close button */}
                        {isRiskOpen && (
                            <button
                                onClick={() => setIsRiskOpen(false)}
                                className={cn(
                                    "absolute top-4 right-4 z-50 p-2 rounded-xl transition-all",
                                    theme === 'dark'
                                        ? "bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                        : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500"
                                )}
                                title="Close Risk Monitor"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}

                        <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar pt-12">
                            <Suspense fallback={<LoadingFallback />}>
                                <RiskWatchlistSidebar />
                            </Suspense>
                        </div>
                    </aside>
                )}

                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-[43] flex flex-col will-change-transform shadow-2xl",
                        theme === 'dark'
                            ? "bg-[#0c0c14] border-l border-white/5 border-r border-white/5"
                            : "bg-white border-l border-purple-100/50 border-r border-purple-100/50 shadow-2xl",
                        isMarketOpen ? "translate-x-0" : "translate-x-full",
                        "w-80" // always at right-0, no mr needed — it's the closest panel
                    )}>
                        {/* Tab handle */}
                        <button
                            onClick={() => setIsMarketOpen(!isMarketOpen)}
                            className={cn(
                                "absolute left-[-40px] top-[70%] -translate-y-1/2 w-10 h-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] border border-r-0 rounded-l-3xl flex items-center justify-center transition-all pointer-events-auto",
                                theme === 'dark'
                                    ? "bg-[#0c0c14] border-white/10 text-purple-400 hover:text-white"
                                    : "bg-white border-purple-100 text-purple-600 hover:text-purple-800",
                                !isMarketOpen && "opacity-80 hover:opacity-100"
                            )}
                            title={isMarketOpen ? "Close Market Info" : "Open Market Info"}
                        >
                            {isMarketOpen ? <ChevronRight size={24} strokeWidth={3} /> : <ChevronLeft size={24} strokeWidth={3} />}
                        </button>

                        {/* In-panel close button */}
                        {isMarketOpen && (
                            <button
                                onClick={() => setIsMarketOpen(false)}
                                className={cn(
                                    "absolute top-4 right-4 z-50 p-2 rounded-xl transition-all",
                                    theme === 'dark'
                                        ? "bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                                        : "bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-500"
                                )}
                                title="Close Market Info"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                            </button>
                        )}

                        <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar">
                            <header className="mb-8 mt-12 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Market Intelligence</h4>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Live Pulse</span>
                                    </div>
                                </div>
                            </header>

                            <div className="space-y-8 pb-12">
                                <section>
                                    <MarketTemperature />
                                </section>

                                <div className={cn(
                                    "h-px bg-gradient-to-r from-transparent via-purple-100 to-transparent",
                                    theme === 'dark' && "via-slate-700/50"
                                )} />

                                <section>
                                    <MarketHighlights
                                        onAnalyzeChart={handleAnalyzeChart}
                                        onAnalyzeTokenomics={handleAnalyzeTokenomics}
                                    />
                                </section>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    )
}

function MainLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme } = useTheme();
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    if (isLandingPage) {
        return <main className="h-screen w-full overflow-hidden">{children}</main>;
    }

    return (
        <div className={cn(
            "flex h-screen overflow-hidden relative selection:bg-purple-500/30 main-layout",
            theme === 'dark' ? 'bg-[#020205]' : 'bg-gradient-to-br from-purple-50 via-white to-purple-50/30'
        )}>
            <div className={cn(
                "absolute top-[-5%] right-[-5%] w-[70%] h-[70%] rounded-full pointer-events-none transition-all duration-1000 will-change-transform opacity-30",
                theme === 'dark' ? "bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_70%)] animate-float" : "bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)]"
            )} />
            <div className={cn(
                "absolute bottom-[-5%] left-[-5%] w-[70%] h-[70%] rounded-full pointer-events-none transition-all duration-1000 will-change-transform opacity-20",
                theme === 'dark' ? "bg-[radial-gradient(circle,rgba(79,70,229,0.15),transparent_70%)] animate-float-alt" : "bg-[radial-gradient(circle,rgba(79,70,229,0.05),transparent_70%)]"
            )} />

            <CollapsibleSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <div className="fixed top-4 left-4 md:hidden z-[1000]">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className={cn(
                            "p-2.5 rounded-2xl transition-all active:scale-95 shadow-2xl border backdrop-blur-xl",
                            theme === 'dark'
                                ? 'bg-[#1e2030]/90 text-purple-400 border-white/10'
                                : 'bg-white/90 text-purple-600 border-purple-100'
                        )}
                    >
                        <Menu size={24} strokeWidth={3} className="drop-shadow-lg" />
                    </button>
                </div>
                <main className="flex-1 overflow-hidden">{children}</main>
            </div>
        </div>
    )
}

import LanguageSelector from './components/LanguageSelector'

// Separate component to handle tutorial logic inside the Router context
function TutorialController() {
    const { user } = useAuth();
    const location = useLocation();
    const [showTutorial, setShowTutorial] = useState(false);
    const [showLanguage, setShowLanguage] = useState(false);

    useEffect(() => {
        if (user) {
            const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
            const hasSetLanguage = localStorage.getItem(`language_set_${user.id}`);
            const isForced = location.search.includes('tutorial=force');

            // 1. Language Step first if new signup
            if ((!hasSetLanguage && !hasSeenTutorial) || (isForced && !hasSetLanguage)) {
                setShowLanguage(true);
            }
            // 2. Tutorial step
            else if (!hasSeenTutorial || isForced) {
                const timer = setTimeout(() => {
                    setShowTutorial(true);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [user, location.search, location.pathname]);

    const handleCloseLanguage = () => {
        setShowLanguage(false);
        if (user) {
            localStorage.setItem(`language_set_${user.id}`, 'true');
            // Trigger tutorial immediately after language choice
            const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
            if (!hasSeenTutorial) {
                setShowTutorial(true);
            }
        }
    };

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        if (user) localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
    };

    if (!user) return null;

    return (
        <>
            <LanguageSelector
                isOpen={showLanguage}
                onClose={handleCloseLanguage}
            />
            <TutorialOverlay
                isOpen={showTutorial}
                onClose={handleCloseTutorial}
                experienceLevel={user.experience_level}
            />
        </>
    );
}

function App() {
    const [userAge] = useState(18);

    return (
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <BrowserRouter>
                    <MarketDataProvider>
                        <ChatProvider>
                            <NeuralActionProvider>
                                <QuotaGuard />
                                <MainLayout>
                                    <Suspense fallback={<LoadingFallback />}>
                                        <Routes>
                                            <Route path="/" element={<LandingPage />} />
                                            <Route path="/dashboard" element={<Dashboard userAge={userAge} />} />
                                            <Route path="/elite-chart" element={<EliteChart />} />
                                            <Route path="/academy" element={<NunnoAcademy />} />
                                            <Route path="/pricing" element={<NunnoPricing />} />
                                            <Route path="/settings" element={<AccountSettings />} />
                                            <Route path="/history" element={<ChatHistory />} />
                                            <Route path="/support" element={<HelpSupport />} />
                                            <Route path="/traction-core" element={<InvestorMetrics />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </Suspense>
                                </MainLayout>

                                <TutorialController />
                            </NeuralActionProvider>
                        </ChatProvider>
                    </MarketDataProvider>
                </BrowserRouter>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    )
}

export default App
