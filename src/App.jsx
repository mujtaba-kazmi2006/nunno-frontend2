import React, { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu, Sun, Moon, ChevronLeft, ChevronRight, Newspaper, Zap } from 'lucide-react'
import LandingPage from './components/LandingPage'
import EliteChart from './components/EliteChart'  // Elite charting experience
import { ChatProvider, useChat } from './contexts/ChatContext'
import { useNavigate } from 'react-router-dom'
import { MarketDataProvider } from './contexts/MarketDataContext'
import { useTheme } from './contexts/ThemeContext'
import { useAuth } from './contexts/AuthContext'
import { cn } from './utils/cn'
import TutorialOverlay from './components/TutorialOverlay'

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
                        <h1 className="text-4xl font-black text-purple-500 mb-4 tracking-tighter">NEURAL_STABILITY_GATE_ACTVATED</h1>
                        <p className="text-slate-400 mb-8 italic">"Even in chaos, there is opportunity." - Nunno</p>
                        <p className="text-sm text-slate-500 mb-8">A technical disruption occurred. Our neural nodes are stabilizing. Your portfolio remains safe.</p>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 rounded-full font-bold transition-all transform active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)]">REBOOT_NEURAL_LINK</button>
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

function Dashboard({ userAge }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { setPendingMessage, messages } = useChat();
    const [isMarketOpen, setIsMarketOpen] = useState(false);
    const [isNewsOpen, setIsNewsOpen] = useState(false);
    // Add state to track screen size for conditional rendering/styling if needed
    // But CSS media queries are preferred for performance

    const handleAnalyzeChart = (ticker) => {
        navigate(`/elite-chart?ticker=${ticker}`);
    };

    const handleAnalyzeTokenomics = (ticker) => {
        setPendingMessage(`Analyze the tokenomics of ${ticker.replace('USDT', '')} for me. Search the web for the latest supply data, utility, and distribution.`);
    };

    // Determine if we should show the floating intro or the chat
    const isInitial = messages.length <= 1;

    // Close sidebars on mobile navigation (optional future enhancement)

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <div className="main-container relative h-full flex flex-row overflow-hidden">

                {/* Main Content Area (Chat) 
                    - xl:mr-* ensures content is only pushed on extra large screens.
                    - On smaller screens, sidebars will overlay content without shrinking it.
                */}
                <main className={cn(
                    "flex-1 h-full relative transition-all duration-500 ease-in-out overflow-hidden will-change-[margin] dashboard-container",
                    (isMarketOpen || isNewsOpen) && !isInitial
                        ? (isMarketOpen && isNewsOpen ? "xl:mr-[640px]" : "xl:mr-80")
                        : "mr-0"
                )}>
                    {/* Backdrop for smaller screens when sidebars are open */}
                    {((isMarketOpen || isNewsOpen) && !isInitial) && (
                        <div
                            className="xl:hidden absolute inset-0 bg-black/40 z-30 transition-opacity duration-300"
                            onClick={() => { setIsMarketOpen(false); setIsNewsOpen(false); }}
                        />
                    )}

                    <ChatInterface userAge={userAge} />
                </main>

                {/* Right Collapsible News Sidebar */}
                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-40 flex flex-col will-change-transform shadow-2xl",
                        theme === 'dark'
                            ? "bg-[#0c0c14] border-l border-white/5"
                            : "bg-white border-l border-purple-100/50",
                        isNewsOpen ? "translate-x-0" : "translate-x-full",
                        // On mobile/tablet, it's just a drawer. On desktop (xl), if market is also open, it shifts.
                        // But since we want News AND Market side-by-side, we need to handle their positioning relative to each other.
                        // If Market is open, News needs to be at right-80? No, current logic places them.
                        // Wait, current logic: "isMarketOpen && isNewsOpen && 'mr-80'" on the ASIDE.
                        // This implies News is to the LEFT of Market sidebar? 
                        isMarketOpen && isNewsOpen ? "mr-80" : "mr-0",
                        "w-80" // Fixed width
                    )}>
                        <button
                            onClick={() => setIsNewsOpen(!isNewsOpen)}
                            className={cn(
                                "absolute left-[-40px] top-[30%] -translate-y-1/2 w-10 h-20 shadow-[-10px_0_20px_rgba(0,0,0,0.2)] border border-r-0 rounded-l-3xl flex items-center justify-center transition-all pointer-events-auto",
                                theme === 'dark'
                                    ? "bg-[#0c0c14] border-white/10 text-purple-400 hover:text-white"
                                    : "bg-white border-purple-100 text-purple-600 hover:text-purple-800",
                                !isNewsOpen && "opacity-80 hover:opacity-100"
                            )}
                        >
                            <Newspaper size={20} strokeWidth={2.5} />
                        </button>

                        <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar">
                            <header className="mb-8 mt-12">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Intelligence Feed</h4>
                                <div className="flex items-center gap-1.5 mt-1 text-purple-500">
                                    <Zap size={10} className="animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest">Neural Link Active</span>
                                </div>
                            </header>

                            <NewsIntelligence />
                        </div>
                    </aside>
                )}

                {/* Right Collapsible Market Sidebar */}
                {!isInitial && (
                    <aside className={cn(
                        "fixed top-0 right-0 h-full transition-transform duration-500 ease-in-out z-50 flex flex-col will-change-transform shadow-2xl",
                        theme === 'dark'
                            ? "bg-[#0c0c14] border-l border-white/5 border-r border-white/5"
                            : "bg-white border-l border-purple-100/50 border-r border-purple-100/50 shadow-2xl",
                        isMarketOpen ? "translate-x-0" : "translate-x-full",
                        "w-80"
                    )}>
                        {/* Toggle Button - Offset from News Toggle */}
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
    const { theme, toggleTheme } = useTheme();

    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    if (isLandingPage) {
        return <main className="h-screen w-full overflow-hidden">{children}</main>;
    }

    return (
        <div className={cn(
            "flex h-screen overflow-hidden relative selection:bg-purple-500/30 main-layout",
            theme === 'dark'
                ? 'bg-[#020205]' // Deeper black for premium feel
                : 'bg-gradient-to-br from-purple-50 via-white to-purple-50/30'
        )}>
            {/* Radical Optimization: Solid Gradients, No Blur Filters */}
            <div className={cn(
                "absolute top-[-5%] right-[-5%] w-[70%] h-[70%] rounded-full pointer-events-none transition-all duration-1000 will-change-transform opacity-30",
                theme === 'dark'
                    ? "bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent_70%)] animate-float"
                    : "bg-[radial-gradient(circle,rgba(139,92,246,0.05),transparent_70%)]"
            )} />
            <div className={cn(
                "absolute bottom-[-5%] left-[-5%] w-[70%] h-[70%] rounded-full pointer-events-none transition-all duration-1000 will-change-transform opacity-20",
                theme === 'dark'
                    ? "bg-[radial-gradient(circle,rgba(79,70,229,0.15),transparent_70%)] animate-float-alt"
                    : "bg-[radial-gradient(circle,rgba(79,70,229,0.05),transparent_70%)]"
            )} />

            <CollapsibleSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                {/* Top Navigation Bar - Removed Blur Filters */}
                <div className="absolute top-0 left-0 right-0 h-20 items-center justify-between px-6 flex pointer-events-none z-[1000]">
                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden pointer-events-auto">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className={cn(
                                "p-3 rounded-2xl shadow-lg transition-all active:scale-95 border",
                                theme === 'dark'
                                    ? 'bg-[#0c0c14] text-purple-400 border-white/10'
                                    : 'bg-white text-slate-600 border-purple-100'
                            )}
                        >
                            <Menu size={22} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex-1" />

                    {/* Theme Toggle Removed - Now in Sidebar */}
                    <div className="pointer-events-auto w-10" />
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
        if (user) {
            // Priority 1: Tutorial for beginners
            if (user.experience_level === 'beginner') {
                const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.id}`);
                if (!hasSeenTutorial) {
                    setShowTutorial(true);
                    return;
                }
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
        <ErrorBoundary>
            <BrowserRouter>
                <MarketDataProvider>
                    <ChatProvider>
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
        </ErrorBoundary>
    )
}

export default App
