import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    User,
    CreditCard,
    History,
    HelpCircle,
    LogIn,
    UserPlus,
    TrendingUp,
    Sun,
    Moon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginSignup from './LoginSignup';
import MarketTemperature from './MarketTemperature';
import CryptoPriceCard from './CryptoPriceCard';

export default function CollapsibleSidebar({ isCollapsed, setIsCollapsed }) {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setIsCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsCollapsed]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: TrendingUp, label: 'Elite Chart', path: '/elite-chart' },
        { icon: CreditCard, label: 'Pricing', path: '/pricing' },
        { icon: History, label: 'Prediction History', path: '/history' },
        { icon: HelpCircle, label: 'Help & Support', path: '/support' },
    ];

    const userItems = [
        { icon: User, label: 'Account Settings', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    // Render Overlay for Mobile
    const MobileOverlay = () => (
        isMobile && !isCollapsed && (
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setIsCollapsed(true)}
            />
        )
    );

    return (
        <>
            <MobileOverlay />
            <div
                className={`flex flex-col h-screen shadow-2xl transition-all duration-300 ease-in-out z-50 ${isMobile ? 'fixed inset-y-0 left-0' : 'relative'
                    } ${isCollapsed ? (isMobile ? '-translate-x-full' : 'w-20') : 'w-72'
                    } ${theme === 'dark' ? 'bg-[#1e2030] border-r border-slate-700/50' : 'bg-white'}`}
            >
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`absolute -right-3 top-9 bg-purple-600 text-white p-1.5 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-50 ${isMobile && isCollapsed ? 'hidden' : ''
                        }`}
                >
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>

                <div className={`flex items-center p-6 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
                    <img
                        src="/logo.png"
                        alt="Nunno Finance"
                        className={`transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} object-contain`}
                    />
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                                Nunno Finance
                            </h1>
                            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>AI Financial Educator</span>
                        </div>
                    )}
                </div>



                {/* Navigation */}
                <nav className="px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => isMobile && setIsCollapsed(true)}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden whitespace-nowrap ${isActive(item.path)
                                ? theme === 'dark' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'bg-purple-50 text-purple-700 shadow-sm'
                                : theme === 'dark' ? 'text-slate-400 hover:bg-[#16161e] hover:text-purple-400' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                        >
                            <item.icon
                                className={`flex-shrink-0 transition-colors ${isActive(item.path) ? (theme === 'dark' ? 'text-purple-400' : 'text-purple-600') : (theme === 'dark' ? 'text-slate-500 group-hover:text-purple-400' : 'text-gray-500 group-hover:text-purple-600')
                                    }`}
                                size={22}
                            />

                            <span
                                className={`ml-3 font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                                    }`}
                            >
                                {item.label}
                            </span>

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && !isMobile && (
                                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                    {item.label}
                                </div>
                            )}

                            {isActive(item.path) && !isCollapsed && (
                                <div className="absolute right-0 w-1 h-8 bg-purple-600 rounded-l-full" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Market Widgets Section - Shows ONLY on mobile when expanded */}
                {!isCollapsed && isMobile && (
                    <div className={`px-4 pb-4 space-y-3 border-t pt-4 overflow-y-auto ${theme === 'dark' ? 'border-slate-800/50' : 'border-gray-100'}`}>
                        <h3 className={`text-xs font-semibold uppercase tracking-wider px-2 ${theme === 'dark' ? 'text-slate-500/80' : 'text-gray-500'}`}>Market Overview</h3>

                        <div className="space-y-2">
                            {/* Market Temperature Widget */}
                            <div className="scale-75 origin-top -mb-8">
                                <MarketTemperature />
                            </div>

                            {/* Crypto Price Cards */}
                            <div className="scale-75 origin-top -mb-8">
                                <CryptoPriceCard
                                    ticker="BTCUSDT"
                                    name="Bitcoin"
                                    compact={true}
                                />
                            </div>

                            <div className="scale-75 origin-top -mb-4">
                                <CryptoPriceCard
                                    ticker="ETHUSDT"
                                    name="Ethereum"
                                    compact={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-auto border-t border-gray-100" />

                {/* User Items (only if logged in) */}
                {isAuthenticated && userItems.map((item) => (
                    <div key={item.label} className="px-4 py-2">
                        <Link
                            to={item.path}
                            onClick={() => isMobile && setIsCollapsed(true)}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all group relative overflow-hidden whitespace-nowrap ${isActive(item.path)
                                ? theme === 'dark' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'bg-purple-50 text-purple-700 shadow-sm'
                                : theme === 'dark' ? 'text-slate-400 hover:bg-[#16161e] hover:text-purple-400' : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                                }`}
                        >
                            <item.icon className="flex-shrink-0 transition-colors" size={22} />
                            <span className={`ml-3 font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                                {item.label}
                            </span>
                            {isCollapsed && !isMobile && (
                                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    </div>
                ))}

                {/* Footer / User Profile */}
                <div className={`p-4 border-t transition-colors ${theme === 'dark' ? 'border-slate-800/50 bg-[#16161e]/50' : 'border-gray-100 bg-gray-50/50'}`}>
                    {isAuthenticated ? (
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md transform hover:scale-105 transition-transform cursor-pointer">
                                {user?.name?.charAt(0) || 'U'}
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <h4 className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{user?.name || 'User'}</h4>
                                    <p className={`text-xs truncate capitalize ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{user?.tier} Plan</p>
                                </div>
                            )}

                            {!isCollapsed && (
                                <button
                                    onClick={logout}
                                    className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                                >
                                    <LogOut size={18} />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className={`flex flex-col gap-3 ${isCollapsed ? 'items-center' : ''}`}>
                            {!isCollapsed ? (
                                <>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className={`w-full ${isMobile ? 'py-1.5 text-sm' : 'py-2.5'} bg-purple-600 text-white rounded-xl font-semibold shadow-md hover:bg-purple-700 hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                                    >
                                        <LogIn size={isMobile ? 16 : 18} />
                                        <span>Log In</span>
                                    </button>
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className={`w-full ${isMobile ? 'py-1.5 text-sm' : 'py-2.5'} bg-white text-purple-600 border border-purple-200 rounded-xl font-semibold hover:bg-purple-50 transition-all flex items-center justify-center gap-2`}
                                    >
                                        <UserPlus size={isMobile ? 16 : 18} />
                                        <span>Sign Up</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-purple-700 transition-all"
                                >
                                    <LogIn size={20} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Login/Signup Modal */}
            {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}
        </>
    );
}
