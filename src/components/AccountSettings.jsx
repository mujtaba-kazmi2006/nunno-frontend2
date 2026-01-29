import React, { useState } from 'react';
import { User, Mail, Lock, Bell, CreditCard, Shield, Save, Camera } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function AccountSettings() {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: 'User',
        email: 'user@example.com',
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
                                        <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>{formData.name}</h3>
                                        <p className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>{formData.email}</p>
                                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                            Pro Member
                                        </span>
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

                        {/* Notifications Tab */}
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
