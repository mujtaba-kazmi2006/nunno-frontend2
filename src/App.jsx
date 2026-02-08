import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import LandingPage from './components/LandingPage'
import EliteChart from './components/EliteChart'  // Elite charting experience
import { ChatProvider, useChat } from './contexts/ChatContext'
import { useNavigate } from 'react-router-dom'
import { MarketDataProvider } from './contexts/MarketDataContext'
import { useTheme } from './contexts/ThemeContext'
import { useAuth } from './contexts/AuthContext'
import { cn } from './utils/cn'
import TutorialOverlay from './components/TutorialOverlay'

// Lazy load non-critical components
const NunnoPricing = lazy(() => import('./components/NunnoPricing'))
const AccountSettings = lazy(() => import('./components/AccountSettings'))
const ChatHistory = lazy(() => import('./components/ChatHistory'))
const HelpSupport = lazy(() => import('./components/HelpSupport'))

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

function Dashboard({ userAge }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { setPendingMessage, messages } = useChat();
    const [isMarketOpen, setIsMarketOpen] = useState(false);

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

                {/* Main Content Area (Chat) */}
                <main className={cn(
                    "flex-1 h-full relative transition-[margin] duration-500 ease-in-out overflow-hidden will-change-[margin]",
                    isMarketOpen && !isInitial ? "lg:mr-80" : "mr-0"
                )}>
                    <ChatInterface userAge={userAge} />
                </main>

                {/* Right Collapsible Market Sidebar (Desktop & Mobile Unified) */}
                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-40 flex flex-col will-change-transform",
                        theme === 'dark'
                            ? "bg-[#020205]/80 backdrop-blur-lg border-l border-white/5"
                            : "bg-white/70 backdrop-blur-lg border-l border-purple-100/50",
                        isMarketOpen ? "w-80 translate-x-0" : "w-80 translate-x-full"
                    )}>
                        {/* Toggle Button - Attached to the side of the panel */}
                        <button
                            onClick={() => setIsMarketOpen(!isMarketOpen)}
                            className={cn(
                                "absolute left-[-40px] top-1/2 -translate-y-1/2 w-10 h-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] backdrop-blur-lg border border-r-0 rounded-l-3xl flex items-center justify-center transition-all pointer-events-auto",
                                theme === 'dark'
                                    ? "bg-[#020205]/80 border-white/10 text-purple-400 hover:text-white"
                                    : "bg-white/70 border-purple-100 text-purple-600 hover:text-purple-800",
                                !isMarketOpen && "opacity-80 hover:opacity-100"
                            )}
                            title={isMarketOpen ? "Close Market Info" : "Open Market Info"}
                        >
                            {isMarketOpen ? <ChevronRight size={24} strokeWidth={3} /> : <ChevronLeft size={24} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
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
    const { theme, toggleTheme } = useTheme();

    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    if (isLandingPage) {
        return <main className="h-screen w-full overflow-hidden">{children}</main>;
    }

    return (
        <div className={cn(
            "flex h-screen overflow-hidden relative selection:bg-purple-500/30",
            theme === 'dark'
                ? 'bg-[#020205]' // Deeper black for premium feel
                : 'bg-gradient-to-br from-purple-50 via-white to-purple-50/30'
        )}>
            {/* Ambient Background Elements - Intensified & Multi-colored */}
            <div className={cn(
                "absolute top-[-20%] right-[-20%] w-[90%] h-[90%] md:w-[70%] md:h-[70%] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 will-change-transform",
                theme === 'dark'
                    ? "bg-purple-600/10 animate-float"
                    : "bg-purple-400/5"
            )} />
            <div className={cn(
                "absolute bottom-[-20%] left-[-20%] w-[90%] h-[90%] md:w-[70%] md:h-[70%] blur-[120px] rounded-full pointer-events-none transition-all duration-1000 will-change-transform",
                theme === 'dark'
                    ? "bg-indigo-600/10 animate-float-alt"
                    : "bg-blue-400/5"
            )} />
            <div className={cn(
                "absolute top-[10%] left-[10%] w-[80%] h-[80%] md:w-[60%] md:h-[60%] blur-[150px] rounded-full pointer-events-none transition-all duration-1000 will-change-transform",
                theme === 'dark'
                    ? "bg-pink-600/05 animate-float"
                    : "hidden"
            )} />

            {/* Premium Grain Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.15] brightness-100 contrast-150 pointer-events-none z-0" />

            <CollapsibleSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Top Navigation Bar (Floating/Glassy) */}
                <div className="absolute top-0 left-0 right-0 h-20 items-center justify-between px-6 flex pointer-events-none z-[1000]">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden pointer-events-auto">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className={cn(
                                "p-3 rounded-2xl shadow-lg transition-all active:scale-95 border",
                                theme === 'dark'
                                    ? 'bg-[#020205]/90 text-purple-400 border-white/10'
                                    : 'bg-white/90 text-slate-600 border-purple-100'
                            )}
                        >
                            <Menu size={22} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex-1" />

                    {/* Theme Toggle */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={toggleTheme}
                            className={cn(
                                "p-3 rounded-2xl shadow-2xl backdrop-blur-3xl transition-all duration-500 border group",
                                theme === 'dark'
                                    ? 'bg-[#020205]/90 border-white/10 text-amber-400 shadow-amber-900/10'
                                    : 'bg-white/80 border-purple-100 text-slate-600 hover:text-purple-600 shadow-purple-100/50'
                            )}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={20} className="transition-transform group-hover:rotate-90 group-hover:scale-125" />
                            ) : (
                                <Moon size={20} className="transition-transform group-hover:-rotate-45 group-hover:scale-125" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}

function App() {
    const [userAge, setUserAge] = useState(18)
    const { user } = useAuth();
    const [showTutorial, setShowTutorial] = useState(false);

    useEffect(() => {
        if (user && user.experience_level === 'beginner') {
            const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
            if (!hasSeenTutorial) {
                setShowTutorial(true);
            }
        }
    }, [user]);

    const handleCloseTutorial = () => {
        setShowTutorial(false);
        if (user) {
            localStorage.setItem(`tutorial_seen_${user.id}`, 'true');
        }
    };

    return (
        <BrowserRouter>
            <MarketDataProvider>
                <ChatProvider>
                    <MainLayout>
                        <Suspense fallback={<LoadingFallback />}>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/dashboard" element={<Dashboard userAge={userAge} />} />
                                <Route path="/elite-chart" element={<EliteChart />} />
                                <Route path="/pricing" element={<NunnoPricing />} />
                                <Route path="/settings" element={<AccountSettings />} />
                                <Route path="/history" element={<ChatHistory />} />
                                <Route path="/support" element={<HelpSupport />} />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                        {user && (
                            <TutorialOverlay
                                isOpen={showTutorial}
                                onClose={handleCloseTutorial}
                                experienceLevel={user.experience_level}
                            />
                        )}
                    </MainLayout>
                </ChatProvider>
            </MarketDataProvider>
        </BrowserRouter>
    )
}

export default App
