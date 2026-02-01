import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Bell, CreditCard, Shield, Save, Camera, Zap, Info } from 'lucide-react';
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

    const handleSave = (e) => {
        e.preventDefault();
        // TODO: Implement save functionality
        alert('Settings saved successfully!');
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'usage', label: 'Usage & Quota', icon: Zap },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'billing', label: 'Billing', icon: CreditCard },
    ];

    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-gradient-to-br from-gray-50 to-purple-50'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Account Settings</h1>
                    <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Manage your account preferences and settings</p>
                </div>

                {/* Tabs */}
                <div className={`rounded-2xl shadow-lg border overflow-hidden transition-colors ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-gray-200'}`}>
                    <div className={`flex border-b overflow-x-auto transition-colors ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'}`}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? (theme === 'dark' ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5' : 'text-purple-600 border-b-2 border-purple-600 bg-purple-50')
                                        : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50' : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50')
                                        }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-8">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${theme === 'dark' ? 'bg-gradient-to-tr from-purple-600 to-purple-400' : 'bg-gradient-to-tr from-purple-500 to-purple-400'}`}>
                                            {formData.name.charAt(0)}
                                        </div>
                                        <button className={`absolute bottom-0 right-0 rounded-full p-2 shadow-lg border-2 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-purple-200 hover:bg-purple-50'}`}>
                                            <Camera size={16} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                        </button>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>{user?.name}</h3>
                                        <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>{user?.email}</p>
                                        <div className="flex gap-2 items-center mt-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                                {user?.tier || 'Free'} Member
                                            </span>
                                            {user?.tier === 'whale' && <Zap size={16} className="text-amber-400 fill-amber-400" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg w-full md:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <Save size={20} />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className={`border-l-4 p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-purple-500/5 border-purple-500/50' : 'bg-purple-50 border-purple-600'}`}>
                                    <div className="flex items-start gap-3">
                                        <Shield className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                        <div>
                                            <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-900'}`}>Security Tip</h4>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-purple-200/60' : 'text-purple-700'}`}>
                                                Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="newPassword"
                                                value={formData.newPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg w-full md:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <Lock size={20} />
                                    Update Password
                                </button>
                            </div>
                        )}

                        {/* Usage Tab */}
                        {activeTab === 'usage' && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500"><Zap size={20} /></div>
                                            <h4 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Daily Token Limit</h4>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${theme === 'dark' ? 'text-blue-400 bg-blue-200/10' : 'text-blue-600 bg-blue-100'}`}>
                                                        {((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 1)).toLocaleString(undefined, { style: 'percent' })} Used
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-semibold inline-block ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                                        {user?.tokens_used_today || 0} / {user?.limits?.daily_token_limit || 15000}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                                <div style={{ width: `${Math.min(100, ((user?.tokens_used_today || 0) / (user?.limits?.daily_token_limit || 15000)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                                            </div>
                                        </div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Tokens are used by the AI to process and generate chat responses. Limits reset daily.</p>
                                    </div>

                                    <div className={`p-6 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200 shadow-sm'}`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500"><Shield size={20} /></div>
                                            <h4 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Daily Intelligence Quota</h4>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${theme === 'dark' ? 'text-purple-400 bg-purple-200/10' : 'text-purple-600 bg-purple-100'}`}>
                                                        {((user?.searches_today || 0) / (user?.limits?.daily_searches || 1)).toLocaleString(undefined, { style: 'percent' })} Used
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-semibold inline-block ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                                                        {user?.searches_today || 0} / {user?.limits?.daily_searches || 10}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                                                <div style={{ width: `${Math.min(100, ((user?.searches_today || 0) / (user?.limits?.daily_searches || 10)) * 100)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-500"></div>
                                            </div>
                                        </div>
                                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Used for deep market analysis and "Feed Nunno" operations. Limits reset daily.</p>
                                    </div>
                                </div>

                                <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Info className="text-amber-500" size={20} />
                                        <h4 className={`font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-900'}`}>Total Credit Balance</h4>
                                    </div>
                                    <p className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-900'}`}>{user?.tokens_remaining?.toLocaleString() || 0} Tokens</p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>This is your permanent credit balance. It does not reset over time.</p>
                                </div>
                            </div>
                        )}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <Mail className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                            <div>
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Email Notifications</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Receive updates via email</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="emailNotifications"
                                                checked={formData.emailNotifications}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-all ${theme === 'dark' ? 'bg-slate-700 peer-focus:ring-purple-900/50' : 'bg-gray-300 peer-focus:ring-purple-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600`}></div>
                                        </label>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <Bell className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                            <div>
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Market Alerts</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Get notified about significant market changes</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="marketAlerts"
                                                checked={formData.marketAlerts}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-all ${theme === 'dark' ? 'bg-slate-700 peer-focus:ring-purple-900/50' : 'bg-gray-300 peer-focus:ring-purple-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600`}></div>
                                        </label>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex items-start gap-3">
                                            <Mail className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                            <div>
                                                <h4 className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Weekly Report</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Receive a weekly summary of your activity</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="weeklyReport"
                                                checked={formData.weeklyReport}
                                                onChange={handleInputChange}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-focus:ring-4 transition-all ${theme === 'dark' ? 'bg-slate-700 peer-focus:ring-purple-900/50' : 'bg-gray-300 peer-focus:ring-purple-200'} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600`}></div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className={`flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg w-full md:w-auto ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                                >
                                    <Save size={20} />
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <div className={`border-2 p-6 rounded-xl transition-colors ${theme === 'dark' ? 'bg-purple-900/10 border-purple-500/30' : 'bg-gradient-to-r from-purple-50 to-purple-50 border-purple-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Current Plan</h3>
                                            <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Professional Plan</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>$10</div>
                                            <div className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>per month</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button className={`px-4 py-2 text-white rounded-lg font-semibold transition-all ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                                            Upgrade Plan
                                        </button>
                                        <button className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${theme === 'dark' ? 'bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}>
                                            Cancel Subscription
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Payment Method</h4>
                                    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                        <CreditCard className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={32} />
                                        <div className="flex-1">
                                            <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>•••• •••• •••• 4242</p>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Expires 12/25</p>
                                        </div>
                                        <button className={`px-4 py-2 font-semibold rounded-lg transition-all ${theme === 'dark' ? 'text-purple-400 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'}`}>
                                            Update
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>Billing History</h4>
                                    <div className="space-y-3">
                                        {[
                                            { date: 'Jan 1, 2026', amount: '$10.00', status: 'Paid' },
                                            { date: 'Dec 1, 2025', amount: '$10.00', status: 'Paid' },
                                            { date: 'Nov 1, 2025', amount: '$10.00', status: 'Paid' },
                                        ].map((invoice, index) => (
                                            <div key={index} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-700/50' : 'bg-gray-50 border-gray-200'}`}>
                                                <div>
                                                    <p className={`font-semibold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{invoice.date}</p>
                                                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Professional Plan</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{invoice.amount}</p>
                                                    <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                                        {invoice.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
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
