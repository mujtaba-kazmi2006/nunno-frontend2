import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, CreditCard, Shield, Save, Camera, Zap, Info, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function AccountSettings() {
    const { theme } = useTheme();
    const { user, refreshUser } = useAuth();

    useEffect(() => {
        refreshUser();
    }, []);

    const [formData, setFormData] = useState({
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        language: user?.language || 'en',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        emailNotifications: true,
        marketAlerts: true,
        weeklyReport: false,
    });

    const [activeTab, setActiveTab] = useState('profile');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const [status, setStatus] = useState({ type: '', message: '' });
    const { updateProfile } = useAuth();

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        const result = await updateProfile({
            name: formData.name,
            language: formData.language,
            experience_level: user?.experience_level
        });

        if (result.success) {
            setStatus({ type: 'success', message: 'Settings saved successfully!' });
        } else {
            setStatus({ type: 'error', message: result.error });
        }
        setLoading(false);
    };

    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'usage', label: 'Usage & Quota', icon: Zap },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className={`min-h-screen py-6 sm:py-8 px-4 transition-colors duration-500 pb-24 md:pb-8 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-gradient-to-br from-gray-50 to-purple-50'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 pl-12 md:pl-0">
                    <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>Account Settings</h1>
                    <p className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Manage your neural preferences and institutional protocol</p>
                </div>

                {/* Tabs */}
                <div className={`rounded-[2rem] shadow-2xl border overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#1e2030]/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-200'}`}>
                    <div className={`flex border-b overflow-x-auto no-scrollbar transition-colors ${theme === 'dark' ? 'border-white/5' : 'border-gray-200'}`}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-4 font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all whitespace-nowrap italic relative ${activeTab === tab.id
                                        ? (theme === 'dark' ? 'text-purple-400 bg-purple-500/5' : 'text-purple-600 bg-purple-50')
                                        : (theme === 'dark' ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5' : 'text-gray-500 hover:text-purple-600 hover:bg-gray-50')
                                        }`}
                                >
                                    <Icon size={16} className="sm:size-5" />
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 sm:p-6 md:p-10">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                                    <div className="relative group">
                                        <div className={`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black italic shadow-2xl transition-transform group-hover:rotate-6 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-purple-400'}`}>
                                            {formData.name.charAt(0)}
                                        </div>
                                        <button className={`absolute -bottom-2 -right-2 rounded-2xl p-2.5 shadow-2xl border-2 transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'bg-[#0c0c14] border-white/10 hover:border-purple-500/50' : 'bg-white border-purple-200 hover:bg-purple-50'}`}>
                                            <Camera size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className={`text-xl sm:text-2xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>{user?.name}</h3>
                                        <p className={`text-xs sm:text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{user?.email}</p>
                                        <div className="flex gap-2 items-center justify-center sm:justify-start mt-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                                {user?.tier || 'Free'} Specialist
                                            </span>
                                            {user?.tier === 'whale' && <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${theme === 'dark' ? 'bg-[#0c0c14] border-white/5 text-slate-200 focus:border-purple-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${theme === 'dark' ? 'bg-[#0c0c14] border-white/5 text-slate-200 focus:border-purple-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                        Language Protocol
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { id: 'en', label: 'English', sub: 'Standard' },
                                            { id: 'ur', label: 'Urdu', sub: 'اردو' },
                                            { id: 'roman_ur', label: 'Roman Urdu', sub: 'Transliterated' }
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, language: lang.id }))}
                                                className={`p-4 rounded-[1.5rem] border-2 text-left transition-all group active:scale-95 ${formData.language === lang.id
                                                    ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                                    : theme === 'dark' ? 'border-white/5 bg-white/[0.02] hover:border-white/10' : 'border-gray-100 bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <p className={`font-black italic uppercase tracking-tight text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{lang.label}</p>
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{lang.sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {status.message && (
                                    <div className={`md:col-span-2 p-4 rounded-xl text-sm font-bold uppercase tracking-wider ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {status.type === 'success' ? '✅' : '⚠️'} {status.message}
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <button
                                        onClick={handleSave}
                                        className={`flex items-center justify-center gap-3 px-8 py-4 text-white rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-xs transition-all shadow-2xl active:scale-95 group w-full sm:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                    >
                                        <Save size={18} className="group-hover:scale-110 transition-transform" />
                                        Commit Changes
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (user) {
                                                localStorage.removeItem(`tutorial_seen_${user.id}`);
                                                window.location.href = '/dashboard?tutorial=force';
                                            }
                                        }}
                                        className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-xs transition-all border-2 active:scale-95 w-full sm:w-auto ${theme === 'dark' ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                                    >
                                        <Zap size={18} />
                                        Neural Reset
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div className={`border-l-4 p-5 rounded-2xl mb-8 ${theme === 'dark' ? 'bg-purple-500/5 border-purple-500/50' : 'bg-purple-50 border-purple-600'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <h4 className={`text-xs font-black uppercase tracking-widest mb-1 italic ${theme === 'dark' ? 'text-purple-300' : 'text-purple-900'}`}>Security Protocol</h4>
                                            <p className={`text-[11px] sm:text-xs font-medium leading-relaxed ${theme === 'dark' ? 'text-purple-200/60' : 'text-purple-700'}`}>
                                                Maintain institutional safety: Use 8+ characters including mixed cases, numbers, and neural entropy (symbols).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                            Current Authorization
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${theme === 'dark' ? 'bg-[#0c0c14] border-white/5 text-slate-200 focus:border-purple-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                New Protocol
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${theme === 'dark' ? 'bg-[#0c0c14] border-white/5 text-slate-200 focus:border-purple-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                                placeholder="New password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                                Confirm Protocol
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border-2 rounded-2xl outline-none transition-all font-bold ${theme === 'dark' ? 'bg-[#0c0c14] border-white/5 text-slate-200 focus:border-purple-500/50' : 'bg-white border-gray-100 text-gray-900 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'}`}
                                                placeholder="Repeat password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center gap-3 px-8 py-4 text-white rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-xs transition-all shadow-2xl active:scale-95 group w-full sm:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <Lock size={18} className="group-hover:rotate-12 transition-transform" />
                                    Update Security Link
                                </button>
                            </div>
                        )}

                        {/* Usage Tab */}
                        {/* Usage Tab */}
                        {activeTab === 'usage' && (
                            <div className="space-y-6 sm:space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Daily Token Limit */}
                                    <div className={`p-5 sm:p-8 rounded-[2rem] border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500"><Zap size={24} /></div>
                                                <div className="flex flex-col">
                                                    <h4 className={`text-sm font-black uppercase tracking-widest italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Token Consumption</h4>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Daily Neural Link Processing</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-black italic uppercase px-2.5 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                                    {((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 1)).toLocaleString(undefined, { style: 'percent' })} Depth
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative pt-1 mb-4">
                                            <div className="flex mb-3 items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Transmission Status</span>
                                                <span className={`text-xs font-black italic ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{user?.tokens_used_today?.toLocaleString() || 0} / {user?.limits?.daily_token_limit?.toLocaleString() || 15000}</span>
                                            </div>
                                            <div className={`overflow-hidden h-2.5 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-200'}`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, ((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 15000)) * 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                                />
                                            </div>
                                        </div>
                                        <p className={`text-[10px] font-medium leading-relaxed italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Tokens facilitate real-time logic synthesis. Daily quotas synchronize at UTC 00:00.</p>
                                    </div>

                                    {/* Daily Intelligence Quota */}
                                    <div className={`p-5 sm:p-8 rounded-[2rem] border transition-all hover:scale-[1.02] ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500"><Shield size={24} /></div>
                                                <div className="flex flex-col">
                                                    <h4 className={`text-sm font-black uppercase tracking-widest italic ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Market Scans</h4>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Deep Asset Investigation</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-[10px] font-black italic uppercase px-2.5 py-1 rounded-lg ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                                    {((user?.searches_today || 0) / (user?.limits?.daily_searches || 1)).toLocaleString(undefined, { style: 'percent' })} Load
                                                </span>
                                            </div>
                                        </div>
                                        <div className="relative pt-1 mb-4">
                                            <div className="flex mb-3 items-center justify-between">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Intelligence Flux</span>
                                                <span className={`text-xs font-black italic ${theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>{user?.searches_today || 0} / {user?.limits?.daily_searches || 10}</span>
                                            </div>
                                            <div className={`overflow-hidden h-2.5 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-200'}`}>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, ((user?.searches_today || 0) / (user?.limits?.daily_searches || 10)) * 100)}%` }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                                />
                                            </div>
                                        </div>
                                        <p className={`text-[10px] font-medium leading-relaxed italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>High-load operations like asset "Roasts" and sentiment technicals consume intelligence points.</p>
                                    </div>
                                    <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><Bell size={20} /></div>
                                            <h4 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Daily Chat Quota</h4>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${theme === 'dark' ? 'text-emerald-400 bg-emerald-200/10' : 'text-emerald-600 bg-emerald-100'}`}>
                                                        {((user?.chat_messages_today || 0) / (user?.limits?.daily_chat_messages || 1)).toLocaleString(undefined, { style: 'percent' })} Used
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-semibold inline-block ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                                        {user?.chat_messages_today || 0} / {user?.limits?.daily_chat_messages || 20}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                                <div style={{ width: `${Math.min(100, ((user?.chat_messages_today || 0) / (user?.limits?.daily_chat_messages || 20)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"></div>
                                            </div>
                                        </div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Explicit message count for chat interactions. Limits reset daily.</p>
                                    </div>
                                </div>

                                <div className={`p-6 sm:p-8 rounded-[2rem] border overflow-hidden relative group ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/20 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-amber-50 border-amber-200 shadow-sm'}`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-colors" />
                                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20"><Info size={28} /></div>
                                            <div className="flex flex-col text-center sm:text-left">
                                                <h4 className={`text-xs font-black uppercase tracking-widest italic mb-1 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>Protocol Credits</h4>
                                                <p className={`text-3xl font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>{user?.tokens_remaining?.toLocaleString() || 0} <span className="text-sm">TOKENS</span></p>
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <div className={`text-[10px] font-black uppercase tracking-widest italic bg-amber-500 text-white px-3 py-1.5 rounded-lg shadow-xl shadow-amber-500/20`}>Permanent Reserve</div>
                                            <p className={`mt-2 text-[10px] font-bold italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Non-resetting institutional credits</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'emailNotifications', icon: Mail, label: 'Direct Protocol Update', sub: 'Receive institutional briefings via email', color: 'purple' },
                                        { id: 'marketAlerts', icon: Bell, label: 'Volatility Triggers', sub: 'Critical notifications for delta market flux', color: 'emerald' },
                                        { id: 'weeklyReport', icon: Activity, label: 'Mission Summary', sub: 'Consolidated performance overview (7-day cycle)', color: 'blue' }
                                    ].map((item) => (
                                        <div key={item.id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-white text-gray-500 shadow-sm'}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <div className="flex flex-col pr-4">
                                                    <h4 className={`text-xs font-black uppercase tracking-widest italic mb-0.5 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.label}</h4>
                                                    <p className={`text-[10px] font-medium italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>{item.sub}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    name={item.id}
                                                    checked={formData[item.id]}
                                                    onChange={handleInputChange}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-12 h-6 rounded-full peer transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-200'} peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-lg peer-checked:bg-purple-600`}></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center gap-3 px-8 py-4 text-white rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-xs transition-all shadow-2xl active:scale-95 group w-full sm:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <Save size={18} />
                                    Save Frequency
                                </button>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-8">
                                <div className={`border-2 p-6 sm:p-8 rounded-[2.5rem] transition-all relative overflow-hidden group ${user?.tier === 'free'
                                    ? (theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100')
                                    : (theme === 'dark' ? 'bg-purple-600/10 border-purple-500/30' : 'bg-purple-50 border-purple-200')
                                    }`}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 sm:gap-4 mb-8">
                                        <div className="text-center sm:text-left">
                                            <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                                                <h3 className={`text-xl sm:text-2xl font-black italic uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>Current Protocol</h3>
                                                {user?.tier !== 'free' && (
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white shadow-xl shadow-emerald-500/20`}>
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-4xl font-black italic uppercase tracking-tighter sm:mb-2 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                                                {user?.tier || 'Free'} Specialist
                                            </p>
                                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Institutional Access Level</p>
                                        </div>
                                        <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                                            <div className={`text-5xl font-black italic tracking-tighter leading-none mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                                                {user?.tier === 'free' ? '$0' : user?.tier === 'pro' ? '$10' : '$50'}
                                            </div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full italic ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>per month cycle</div>
                                        </div>
                                    </div>

                                    <div className="relative flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => window.location.href = '/pricing'}
                                            className={`px-8 py-4 text-white rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-xs transition-all shadow-2xl active:scale-95 w-full sm:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600 hover:bg-purple-700'}`}
                                        >
                                            {user?.tier === 'free' ? 'Unlock Elite Access' : 'Switch Protocol'}
                                        </button>
                                        {user?.tier !== 'free' && (
                                            <button className={`px-8 py-4 border-2 rounded-[1.25rem] font-black uppercase tracking-[.15em] italic text-[10px] sm:text-xs transition-all active:scale-95 w-full sm:w-auto ${theme === 'dark' ? 'bg-transparent border-white/10 text-slate-500 hover:text-rose-400 hover:border-rose-500/30' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50 hover:text-rose-600'}`}>
                                                Terminate Subscription
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] italic px-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Payment Link</h4>
                                    {user?.tier === 'free' ? (
                                        <div className={`p-10 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center transition-all group ${theme === 'dark' ? 'bg-white/[0.01] border-white/5 hover:border-white/10' : 'bg-gray-50/50 border-gray-100'}`}>
                                            <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform"><CreditCard size={32} /></div>
                                            <p className={`font-black uppercase italic text-xs mb-1 tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>No Secure Link Found</p>
                                            <p className={`text-[10px] font-medium italic opacity-50 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Initialize elite access to secure payment gateway</p>
                                        </div>
                                    ) : (
                                        <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="size-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500"><CreditCard size={32} /></div>
                                            <div className="flex-1 text-center sm:text-left">
                                                <p className={`text-lg font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>•••• •••• •••• 4242</p>
                                                <p className={`text-[10px] font-black uppercase tracking-widest text-slate-500 italic`}>Protocol Expiry: 12/25</p>
                                            </div>
                                            <button className={`px-6 py-3 font-black uppercase tracking-[0.2em] italic text-[10px] rounded-xl transition-all ${theme === 'dark' ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'}`}>
                                                Update Link
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] italic px-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>Transmission History</h4>
                                    <div className={`rounded-[2rem] border transition-all overflow-hidden ${theme === 'dark' ? 'bg-white/[0.01] border-white/5' : 'bg-white border-gray-100'}`}>
                                        {user?.tier === 'free' ? (
                                            <div className="p-8 text-center">
                                                <p className={`text-[10px] font-black uppercase tracking-widest italic ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`}>Zero transmission records detected</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {[
                                                    { date: 'Jan 1, 2026', amount: '$10.00', status: 'Authorized' },
                                                    { date: 'Dec 1, 2025', amount: '$10.00', status: 'Authorized' },
                                                    { date: 'Nov 1, 2025', amount: '$10.00', status: 'Authorized' },
                                                ].map((invoice, index) => (
                                                    <div key={index} className={`flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors`}>
                                                        <div>
                                                            <p className={`text-xs font-black italic uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{invoice.date}</p>
                                                            <p className={`text-[10px] font-bold uppercase tracking-widest text-slate-500`}>Neural Specialist Pro</p>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1.5">
                                                            <p className={`text-sm font-black italic ${theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>{invoice.amount}</p>
                                                            <span className={`inline-block px-2 py-0.5 text-[8px] rounded-md font-black uppercase tracking-widest leading-none ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-green-100 text-green-700'}`}>
                                                                {invoice.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
