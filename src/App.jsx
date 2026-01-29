import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CryptoPriceCard from './components/CryptoPriceCard'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu, Sun, Moon } from 'lucide-react'
import CryptoDetailModal from './components/CryptoDetailModal'
import LandingPage from './components/LandingPage'
import EliteChart from './components/EliteChart'  // Elite charting experience
import { ChatProvider } from './contexts/ChatContext'
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

function Dashboard({ userAge }) {
    const [selectedTicker, setSelectedTicker] = useState(null);

    return (
        <>
            <div className="main-container">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="sidebar desktop-only">
                    <MarketTemperature />
                    <CryptoPriceCard
                        ticker="BTCUSDT"
                        name="Bitcoin"
                        onClick={() => setSelectedTicker("BTCUSDT")}
                    />
                    <CryptoPriceCard
                        ticker="ETHUSDT"
                        name="Ethereum"
                        onClick={() => setSelectedTicker("ETHUSDT")}
                    />
                </div>

                {/* Chat Container - Full screen on mobile, normal on desktop */}
                <div className="chat-container">
                    <ChatInterface userAge={userAge} />
                </div>
            </div>

            {/* Modal rendered outside main-container to avoid overflow: hidden clipping */}
            <CryptoDetailModal
                isOpen={!!selectedTicker}
                initialTicker={selectedTicker}
                onClose={() => setSelectedTicker(null)}
            />
        </>
    )
}

function MainLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={`flex h-screen overflow-hidden relative transition-colors duration-500 ${theme === 'dark'
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

                {/* Mobile Menu Trigger */}
                <div className="md:hidden p-3 absolute top-0 left-0 z-10">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className={`p-2.5 rounded-xl shadow-lg transition-all ${theme === 'dark'
                            ? 'bg-slate-800 text-purple-400'
                            : 'bg-white text-gray-600 hover:text-purple-600'
                            }`}
                    >
                        <Menu size={22} />
                    </button>
                </div>

                <main className={`flex-1 overflow-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-black/20' : 'bg-gray-50/50'}`}>
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