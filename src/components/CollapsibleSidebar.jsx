import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    TrendingUp,
    GraduationCap,
    CreditCard,
    HelpCircle,
    User,
    LogOut,
    Sun,
    Moon,
    X,
    Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';
import LoginSignup from './LoginSignup';

export default function CollapsibleSidebar({ isCollapsed: isMobileCollapsed, setIsCollapsed: setIsMobileCollapsed }) {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsMobileCollapsed(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setIsMobileCollapsed]);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: TrendingUp, label: 'Elite Charts', path: '/elite-chart', badge: true },
        { icon: GraduationCap, label: 'Nunno Academy', path: '/academy' },
        { icon: CreditCard, label: 'Pricing', path: '/pricing' },
    ];

    const bottomItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: HelpCircle, label: 'Help & Support', path: '/support' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && !isMobileCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-[1190] backdrop-blur-sm"
                        onClick={() => setIsMobileCollapsed(true)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Shell - Integrated and Blended */}
            <div
                className={cn(
                    "flex flex-col z-[1200] transition-all duration-[420ms] cubic-bezier(0.34,1.38,0.64,1) overflow-hidden group/sidebar",
                    // Mobile: floating slide-in with Glassmorphism
                    isMobile
                        ? (isMobileCollapsed
                            ? "fixed -translate-x-[150%] w-[220px] h-[calc(100vh-32px)] my-4 ml-4 rounded-[26px]"
                            : cn(
                                "fixed translate-x-0 w-[220px] h-[calc(100vh-32px)] my-4 ml-4 rounded-[26px] shadow-2xl border backdrop-blur-xl transition-all",
                                theme === 'dark'
                                    ? "bg-[#08080c]/85 border-white/10 [background:radial-gradient(circle_at_top_left,rgba(120,80,255,0.08),transparent_50%),rgba(8,8,12,0.85)]"
                                    : "bg-white/85 border-slate-200/60"
                            ))
                        : cn(
                            "relative h-screen w-[68px] hover:w-[240px] transition-[width] sticky top-0 border-none shadow-none",
                            theme === 'dark'
                                ? "bg-[#08080c] [background:radial-gradient(circle_at_top_left,rgba(120,80,255,0.05),transparent_40%),#08080c]"
                                : "bg-white"
                        )
                )}
            >
                {/* Logo Row - Refined Pro Layout */}
                <div className="flex items-center h-[72px] px-3 gap-3 mt-3 shrink-0 overflow-hidden relative">
                    <div className="relative shrink-0 flex items-center justify-center w-[46px] h-[46px]">
                        <img
                            src="/logo.png"
                            alt="Nunno"
                            className="w-[40px] h-[40px] object-contain brightness-[1.1] drop-shadow-2xl"
                        />
                        {/* Status pin integrated with logo for high-tech look */}
                        <div className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full border-2 border-[#08080c] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    </div>

                    <div className={cn(
                        "flex flex-col justify-center transition-all duration-[400ms] delay-75 whitespace-nowrap",
                        "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                        isMobile && "opacity-100 translate-x-0"
                    )}>
                        <h1 className={cn(
                            "text-[17.5px] font-black italic uppercase tracking-tighter leading-none font-heading transition-colors",
                            theme === 'dark' ? "text-white" : "text-slate-900"
                        )}>
                            Nunno<span className="text-purple-500">Labs</span>
                        </h1>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[8.5px] font-black uppercase tracking-[0.18em] text-slate-500 font-mono opacity-80">
                                Global // v2.4.1
                            </span>
                        </div>
                    </div>
                </div>

                {/* Micro Divider */}
                <div className={cn(
                    "w-full h-px mt-4 mb-3 shrink-0 transition-all",
                    theme === 'dark' ? "bg-gradient-to-r from-transparent via-white/5 to-transparent" : "bg-slate-200/40"
                )} />

                {/* Navigation Groups */}
                <nav className="flex-1 flex flex-col gap-[4px] px-3 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setIsMobileCollapsed(true)}
                                className={cn(
                                    "flex items-center h-[50px] px-[8px] gap-[12px] rounded-xl relative group/item transition-all duration-200",
                                    active
                                        ? (theme === 'dark' ? "bg-white/5 text-white shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]" : "bg-purple-100 text-purple-600")
                                        : (theme === 'dark' ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-purple-700 hover:bg-purple-50/50")
                                )}
                            >
                                <div className={cn(
                                    "w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                                    active ? "text-purple-400" : "group-hover/item:text-purple-400"
                                )}>
                                    <item.icon
                                        size={20}
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                    {item.badge && !active && (
                                        <div className="absolute top-[12px] left-[32px] w-2 h-2 bg-purple-500 rounded-full border-2 border-[#08080c] group-hover/sidebar:opacity-0 transition-opacity" />
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[13px] font-bold tracking-wide transition-all duration-[220ms] delay-[70ms] whitespace-nowrap font-heading",
                                    "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                                    isMobile && "opacity-100 translate-x-0",
                                    active
                                        ? (theme === 'dark' ? "text-white" : "text-purple-600")
                                        : (theme === 'dark' ? "text-slate-500 group-hover/item:text-white" : "text-slate-500 group-hover/item:text-purple-700")
                                )}>
                                    {item.label}
                                </span>

                                {/* Tooltip */}
                                {!isMobile && (
                                    <div className={cn(
                                        "absolute left-[70px] top-1/2 -translate-y-1/2 px-3 py-1.5 border rounded-lg text-[11px] font-bold whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none transition-all duration-150 shadow-2xl z-[200] group-hover/item:group-not-hover-sidebar:opacity-100 group-hover/item:group-not-hover-sidebar:translate-x-0",
                                        theme === 'dark' ? "bg-[#0f0f15] border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-xl"
                                    )}>
                                        {item.label}
                                    </div>
                                )}

                                {active && (
                                    <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[4px] h-6 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Fixed Footer Section - Always Visible */}
                <div className={cn(
                    "mt-auto flex flex-col gap-[2px] p-3 border-t",
                    theme === 'dark' ? "border-white/5 bg-[#08080c]" : "border-slate-200 bg-white"
                )}>
                    {/* Theme Toggle */}
                    <div
                        onClick={toggleTheme}
                        className={cn(
                            "flex items-center h-[50px] px-[8px] gap-[12px] rounded-xl transition-all duration-200 group/theme cursor-pointer",
                            theme === 'dark' || isMobile ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        )}
                    >
                        <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
                            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                        </div>
                        <div className={cn(
                            "flex items-center flex-1 justify-between transition-all duration-[220ms] delay-[70ms] whitespace-nowrap",
                            "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                            isMobile && "opacity-100 translate-x-0"
                        )}>
                            <span className="text-[13px] font-bold font-heading">
                                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </span>
                            <div className={cn(
                                "w-[30px] h-[16px] rounded-full relative transition-all duration-300 border",
                                theme === 'dark' || isMobile ? "bg-purple-900/40 border-white/10" : "bg-slate-200 border-slate-300"
                            )}>
                                <div className={cn(
                                    "absolute top-1/2 -translate-y-1/2 size-[10px] rounded-full transition-all duration-300 shadow-sm",
                                    theme === 'dark' ? "left-[3px] bg-purple-400" : "left-[15px] bg-white"
                                )} />
                            </div>
                        </div>
                    </div>

                    {bottomItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center h-[50px] px-[8px] gap-[12px] rounded-xl transition-all duration-200 group/item",
                                theme === 'dark' || isMobile ? "text-slate-500 hover:text-white hover:bg-white/5" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            )}
                        >
                            <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
                                <item.icon size={18} />
                            </div>
                            <span className={cn(
                                "text-[13px] font-bold transition-all duration-[220ms] delay-[70ms] whitespace-nowrap font-heading",
                                "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                                isMobile && "opacity-100 translate-x-0"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    ))}

                    {/* Profile Row */}
                    {isAuthenticated ? (
                        <div className={cn(
                            "flex items-center h-[56px] px-[8px] gap-[12px] rounded-xl transition-all duration-200 group/profile mt-2 cursor-pointer",
                            theme === 'dark' || isMobile ? "hover:bg-white/5" : "hover:bg-slate-100"
                        )}>
                            <Link to="/settings" className="size-[34px] rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shrink-0 text-white font-black italic text-[12px] shadow-lg group-hover/profile:scale-110 transition-all">
                                {user?.name?.charAt(0) || 'U'}
                            </Link>
                            <div className={cn(
                                "flex flex-col transition-all duration-300 delay-75 overflow-hidden",
                                "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                                isMobile && "opacity-100 translate-x-0"
                            )}>
                                <p className={cn(
                                    "text-[12.5px] font-black italic uppercase leading-none truncate font-heading",
                                    theme === 'dark' || isMobile ? "text-white" : "text-slate-900"
                                )}>{user?.name || 'Member'}</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-1 font-heading">Elite Member</p>
                            </div>
                            <button
                                onClick={logout}
                                className={cn(
                                    "ml-auto p-2 text-slate-500 hover:text-rose-500 transition-all opacity-0 group-hover/sidebar:opacity-100",
                                    isMobile && "opacity-100"
                                )}
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLoginModal(true)}
                            className={cn(
                                "flex items-center h-[50px] px-[8px] gap-[12px] rounded-xl transition-all duration-200 group/login mt-2",
                                theme === 'dark' || isMobile ? "hover:bg-white/5" : "hover:bg-slate-100"
                            )}
                        >
                            <div className="w-[34px] h-[34px] rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-slate-500 group-hover/login:text-purple-500">
                                <User size={18} />
                            </div>
                            <span className={cn(
                                "text-[12px] font-black italic uppercase tracking-widest transition-all duration-300 delay-75 font-heading text-left",
                                "opacity-0 -translate-x-4 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0",
                                isMobile && "opacity-100 translate-x-0",
                                theme === 'dark' || isMobile ? "text-white" : "text-slate-900"
                            )}>
                                Sign In
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}
        </>
    );
}

