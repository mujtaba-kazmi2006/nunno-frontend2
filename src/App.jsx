import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CryptoPriceCard from './components/CryptoPriceCard'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import { Menu } from 'lucide-react'
import CryptoDetailModal from './components/CryptoDetailModal'

// Lazy load non-critical components
const NunnoPricing = lazy(() => import('./components/NunnoPricing'))
const AccountSettings = lazy(() => import('./components/AccountSettings'))
const ChatHistory = lazy(() => import('./components/ChatHistory'))
const HelpSupport = lazy(() => import('./components/HelpSupport'))

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    )
}

function Dashboard({ userAge }) {
    const [selectedTicker, setSelectedTicker] = useState(null);

    return (
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

            <CryptoDetailModal
                isOpen={!!selectedTicker}
                initialTicker={selectedTicker}
                onClose={() => setSelectedTicker(null)}
            />
        </div>
    )
}

function MainLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            <CollapsibleSidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Menu Trigger */}
                <div className="md:hidden p-3 absolute top-0 left-0 z-10">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-2.5 bg-white rounded-xl shadow-lg text-gray-600 hover:text-indigo-600 hover:shadow-xl transition-all"
                    >
                        <Menu size={22} />
                    </button>
                </div>

                <main className="flex-1 overflow-auto bg-gray-50/50">
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
            <MainLayout>
                <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                        <Route path="/" element={<Dashboard userAge={userAge} />} />
                        <Route path="/pricing" element={<NunnoPricing />} />
                        <Route path="/settings" element={<AccountSettings />} />
                        <Route path="/history" element={<ChatHistory />} />
                        <Route path="/support" element={<HelpSupport />} />
                    </Routes>
                </Suspense>
            </MainLayout>
        </BrowserRouter>
    )
}

export default App
