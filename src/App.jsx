import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import MarketTemperature from './components/MarketTemperature'
import CryptoPriceCard from './components/CryptoPriceCard'
import NunnoPricing from './components/NunnoPricing'
import CollapsibleSidebar from './components/CollapsibleSidebar'
import MiniWidgets from './components/MiniWidgets'
import { Menu } from 'lucide-react'

import CryptoDetailModal from './components/CryptoDetailModal'

function Dashboard({ userName, setUserName, userAge }) {
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

            {/* Mobile Mini Widgets - Shown only on mobile */}
            <MiniWidgets />

            <div className="chat-container">
                <ChatInterface userName={userName} userAge={userAge} />
            </div>

            <CryptoDetailModal
                isOpen={!!selectedTicker}
                initialTicker={selectedTicker}
                onClose={() => setSelectedTicker(null)}
            />
        </div>
    )
}

function MainLayout({ children, userName, setUserName }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden relative">
            <CollapsibleSidebar
                userName={userName}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Menu Trigger */}
                <div className="md:hidden p-4 absolute top-0 left-0 z-10">
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="p-2 bg-white rounded-lg shadow-md text-gray-600 hover:text-indigo-600"
                    >
                        <Menu size={24} />
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
    const [userName, setUserName] = useState('User')
    const [userAge, setUserAge] = useState(18)

    return (
        <BrowserRouter>
            <MainLayout userName={userName} setUserName={setUserName}>
                <Routes>
                    <Route path="/" element={<Dashboard userName={userName} setUserName={setUserName} userAge={userAge} />} />
                    <Route path="/pricing" element={<NunnoPricing />} />
                </Routes>
            </MainLayout>
        </BrowserRouter>
    )
}

export default App
