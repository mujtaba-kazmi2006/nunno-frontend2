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
    Moon,
    Newspaper,
    GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginSignup from './LoginSignup';
import MarketTemperature from './MarketTemperature';
import CryptoPriceCard from './CryptoPriceCard';
import ThemeSwitch from './ThemeSwitch';
import { cn } from '../utils/cn';

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
        { icon: GraduationCap, label: 'Nunno Academy', path: '/academy' },
        { icon: CreditCard, label: 'Pricing', path: '/pricing' },
        { icon: History, label: 'Prediction History', path: '/history' },
        { icon: HelpCircle, label: 'Help & Support', path: '/support' },
    ];

    const userItems = [
        { icon: User, label: 'Account Settings', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    // Render Overlay for Mobile - Removed Blur
    const MobileOverlay = () => (
        isMobile && !isCollapsed && (
            <div
                className="fixed inset-0 bg-black/60 z-[1190]"
                onClick={() => setIsCollapsed(true)}
            />
        )
    );

    return (
        <>
            <MobileOverlay />
            <div
                className={cn(
                    "flex flex-col h-screen transition-[width,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-[1200] relative shadow-[0_0_50px_rgba(0,0,0,0.3)] will-change-[width,transform]",
                    isMobile ? "fixed inset-y-0 left-0" : "relative",
                    isCollapsed ? (isMobile ? "-translate-x-full" : "w-24") : "w-[300px]",
                    theme === 'dark' ? "bg-[#0c0c14] border-r border-white/5" : "bg-white border-r border-slate-200"
                )}
            >
                {/* Premium Effects - Optimized */}
                {theme === 'dark' && (
                    <>
                        <div className="absolute top-20 -left-20 w-40 h-40 bg-[radial-gradient(circle,rgba(139,92,246,0.1),transparent_70%)] rounded-full pointer-events-none" />
                    </>
                )}


                {/* Toggle Button - Redesigned & Fixed Clipping */}
                {!isMobile && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "absolute translate-x-1/2 -right-0 top-12 size-8 flex items-center justify-center rounded-full z-[1300] transition-all duration-500 border",
                            theme === 'dark'
                                ? "bg-[#16161f] text-purple-400 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:border-purple-500/50"
                                : "bg-white text-purple-600 border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:border-purple-300",
                            "hover:scale-110 active:scale-95 group/toggle"
                        )}
                    >
                        <div className="absolute inset-0 rounded-full bg-purple-500/5 opacity-0 group-hover/toggle:opacity-100 transition-opacity" />
                        <motion.div
                            initial={false}
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            className="relative z-10 flex items-center justify-center"
                        >
                            <ChevronLeft size={16} strokeWidth={3} />
                        </motion.div>
                    </button>
                )}

                <div className={cn(
                    "relative z-10 flex items-center p-8 mb-4",
                    isCollapsed ? "justify-center" : "justify-between gap-4"
                )}>
                    <div className="flex items-center gap-4">
                        <div className="relative group/logo">
                            <div className="absolute inset-0 bg-purple-500/10 rounded-full scale-150 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                            <img
                                src="/logo.png"
                                alt="Nunno Finance"
                                className={cn(
                                    "relative transition-[width,height] duration-500 will-change-[width,height]",
                                    isCollapsed ? "w-10 h-10" : "w-12 h-12",
                                    "object-contain select-none"
                                )}
                            />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden whitespace-nowrap">
                                <h1 className={cn(
                                    "text-xl font-black italic uppercase tracking-tighter transition-colors",
                                    theme === 'dark' ? "text-white" : "text-slate-900"
                                )}>
                                    NUNNO <span className="text-purple-500">LABS</span>
                                </h1>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Financial Helper</span>
                                <div className="mt-1 flex gap-1">
                                    <span className="px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[8px] font-bold text-purple-500 uppercase tracking-widest leading-none">
                                        Urdu Available
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Close Button */}
                    {isMobile && !isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="relative z-10 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar overflow-x-hidden">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setIsCollapsed(true)}
                                className={cn(
                                    "flex items-center px-4 py-3.5 rounded-2xl transition-[background-color,color,box-shadow,transform] duration-300 group relative overflow-hidden whitespace-nowrap",
                                    active
                                        ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                        : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "flex-shrink-0 transition-transform duration-500",
                                        active ? "scale-110" : "group-hover:scale-110"
                                    )}
                                    size={22}
                                    strokeWidth={active ? 2.5 : 2}
                                />

                                <span
                                    className={cn(
                                        "ml-4 text-xs font-black uppercase tracking-[0.15em] transition-all duration-500 italic",
                                        isCollapsed ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
                                    )}
                                >
                                    {item.label}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {isCollapsed && !isMobile && (
                                    <div className="absolute left-full ml-4 px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 shadow-2xl">
                                        {item.label}
                                    </div>
                                )}

                                {active && !isCollapsed && (
                                    <div className="absolute right-2 w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>


                <div className="mt-auto h-px bg-white/5 w-full relative z-10" />

                {/* Bottom Actions */}
                <div className="relative z-10 p-4 space-y-2">
                    {isAuthenticated && userItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.path}
                            onClick={() => isMobile && setIsCollapsed(true)}
                            className={cn(
                                "flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group text-slate-500 hover:text-white hover:bg-white/5",
                                isCollapsed && !isMobile ? "justify-center" : ""
                            )}
                        >
                            <item.icon className="flex-shrink-0 group-hover:scale-110 transition-transform" size={20} />
                            {!isCollapsed && (
                                <span className="ml-4 text-xs font-black uppercase tracking-[0.15em] italic">{item.label}</span>
                            )}
                        </Link>
                    ))}

                    {/* Custom Theme Switch */}
                    <div className={cn(
                        "flex items-center justify-center transition-all duration-300",
                        isCollapsed && !isMobile ? "opacity-100" : "px-4"
                    )}>
                        <ThemeSwitch />
                        {!isCollapsed && (
                            <span className="ml-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                                {theme === 'dark' ? 'Lunar' : 'Solar'} System
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Component */}
                <div className={cn(
                    "relative z-10 p-6 border-t transition-all duration-500",
                    theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"
                )}>
                    {isAuthenticated ? (
                        <div className="flex flex-col gap-6">
                            {/* Neural Usage Trackers */}
                            {!isCollapsed && (
                                <div className="space-y-4">
                                    {/* Daily Tokens */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Daily Limit</span>
                                            <span className="text-purple-400">{((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 15000) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, ((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 15000) * 100))}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Daily Searches */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Market Scans</span>
                                            <span className="text-emerald-400">{user?.searches_today || 0}/{user?.limits?.daily_searches || 10}</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, ((user?.searches_today || 0) / (user?.limits?.daily_searches || 10) * 100))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-4")}>
                                <div className="size-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-black italic shadow-xl group/avatar cursor-pointer hover:rotate-6 transition-transform">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>

                                {!isCollapsed && (
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className={cn(
                                            "text-xs font-black uppercase tracking-tight mb-0.5 transition-colors",
                                            theme === 'dark' ? "text-white" : "text-slate-900"
                                        )}>{user?.name || 'Member'}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="size-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic truncate">Level 4 {user?.tier} Member</span>
                                        </div>
                                    </div>
                                )}

                                {!isCollapsed && (
                                    <button
                                        onClick={logout}
                                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={cn("flex flex-col gap-3", isCollapsed ? "items-center" : "")}>
                            {!isCollapsed ? (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest italic hover:bg-purple-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <LogIn size={18} />
                                    <span>SIGN IN</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="size-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-purple-600 hover:text-white transition-all active:scale-90"
                                >
                                    <LogIn size={20} />
                                </button>
                            )}
                        </div>
                    )}
                </div >
            </div >

            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 italic">
                    Developed by the Nunno Team
                </span>
            </div>

            {/* Login/Signup Modal */}
            {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}
        </>
    );
}
