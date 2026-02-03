import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import LandingPage from './components/LandingPage'
import EliteChart from './components/EliteChart'  // Elite charting experience
import { ChatProvider, useChat } from './contexts/ChatContext'
import { useNavigate } from 'react-router-dom'
import { MarketDataProvider } from './contexts/MarketDataContext'
import { useTheme } from './contexts/ThemeContext' // Added useTheme

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
    const { setPendingMessage } = useChat();
    const [isMobileMarketOpen, setIsMobileMarketOpen] = useState(false);

    const handleAnalyzeChart = (ticker) => {
        navigate(`/elite-chart?ticker=${ticker}`);
    };

    const handleAnalyzeTokenomics = (ticker) => {
        setPendingMessage(`Analyze the tokenomics of ${ticker.replace('USDT', '')} for me. Search the web for the latest supply data, utility, and distribution.`);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative">
            <div className="main-container relative">
                {/* Desktop Sidebar - Hidden on mobile via CSS but kept meaningful */}
                <aside className="sidebar desktop-only">
                    <div className="flex flex-col gap-6">
                        <section className="w-full min-0">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Market Pulse</h3>
                            <MarketTemperature />
                        </section>

                        <section className="w-full min-w-0">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Market Overview</h3>
                            <MarketHighlights
                                onAnalyzeChart={handleAnalyzeChart}
                                onAnalyzeTokenomics={handleAnalyzeTokenomics}
                            />
                        </section>
                    </div>
                </aside>

                {/* Mobile Market Sidebar - ONLY FOR MOBILE */}
                <aside className={`mobile-market-sidebar md:hidden ${isMobileMarketOpen ? 'open' : 'collapsed'}`}>
                    <button
                        onClick={() => setIsMobileMarketOpen(!isMobileMarketOpen)}
                        className="mobile-market-toggle"
                        aria-label={isMobileMarketOpen ? "Close market sidebar" : "Open market sidebar"}
                    >
                        {isMobileMarketOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    <div className="mobile-market-content">
                        <header className="mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Market Pulse</h4>
                        </header>
                        <MarketTemperature variant="minimal" />

                        <header className="mt-6 mb-2">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Top Movers</h4>
                        </header>
                        <MarketHighlights
                            onAnalyzeChart={handleAnalyzeChart}
                            onAnalyzeTokenomics={handleAnalyzeTokenomics}
                        />
                    </div>
                </aside>

                {/* Main Content Area (Chat) */}
                <main className={`chat-container ${isMobileMarketOpen ? 'mobile-market-open' : ''}`}>
                    <ChatInterface userAge={userAge} />
                </main>
            </div>
        </div>
    )
}

function MainLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`flex h-screen overflow-hidden relative ${theme === 'dark'
            ? 'bg-gradient-to-br from-[#16161e] via-[#1a1b26] to-[#16161e]'
            : 'bg-gradient-to-br from-gray-50 to-purple-50'
            }`}>
            <CollapsibleSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Floating Minimal Theme Toggle */}
                <div className="absolute top-4 right-4 z-[100]">
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 border group ${theme === 'dark'
                            ? 'bg-[#1e2030]/80 border-slate-700/50 text-amber-400 hover:scale-110 hover:shadow-purple-500/10'
                            : 'bg-white/80 border-purple-100 text-gray-600 hover:text-purple-600 hover:scale-110 hover:shadow-purple-200'
                            }`}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} className="transition-transform group-hover:rotate-45" /> : <Moon size={20} className="transition-transform group-hover:-rotate-12" />}
                    </button>
                </div>

                {/* Mobile Menu Trigger - Symmetrical with theme toggle */}
                <div className="md:hidden absolute top-4 left-4 z-[100]">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className={`p-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${theme === 'dark'
                            ? 'bg-slate-800/90 backdrop-blur-md text-purple-400 border border-slate-700/50'
                            : 'bg-white/90 backdrop-blur-md text-gray-600 hover:text-purple-600 border border-purple-100'
                            }`}
                    >
                        <Menu size={22} />
                    </button>
                </div>

                {/* Content Area */}
                <main className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50/50'}`}>
                    {children}
                </main>
            </div>
        </div>
    )
}

function App() {
    const [userAge, setUserAge] = useState(18)

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
                            </Routes>
                        </Suspense>
                    </MainLayout>
                </ChatProvider>
            </MarketDataProvider>
        </BrowserRouter>
    )
}

export default App