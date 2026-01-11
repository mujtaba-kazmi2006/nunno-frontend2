import React, { useState } from 'react';
import { User, Mail, Lock, Bell, CreditCard, Shield, Save, Camera } from 'lucide-react';

export default function AccountSettings() {
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Settings</h1>
                    <p className="text-gray-600">Manage your account preferences and settings</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                            : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
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
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {formData.name.charAt(0)}
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-indigo-200 hover:bg-indigo-50 transition-colors">
                                            <Camera size={16} className="text-indigo-600" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{formData.name}</h3>
                                        <p className="text-gray-600">{formData.email}</p>
                                        <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                            Pro Member
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <Save size={20} />
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-lg mb-6">
                                    <div className="flex items-start gap-3">
                                        <Shield className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-indigo-900 mb-1">Security Tip</h4>
                                            <p className="text-sm text-indigo-700">
                                                Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
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
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <Mail className="text-indigo-600 mt-1" size={20} />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Email Notifications</h4>
                                                <p className="text-sm text-gray-600">Receive updates via email</p>
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
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <Bell className="text-indigo-600 mt-1" size={20} />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Market Alerts</h4>
                                                <p className="text-sm text-gray-600">Get notified about significant market changes</p>
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
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="flex items-start gap-3">
                                            <Mail className="text-indigo-600 mt-1" size={20} />
                                            <div>
                                                <h4 className="font-semibold text-gray-800">Weekly Report</h4>
                                                <p className="text-sm text-gray-600">Receive a weekly summary of your activity</p>
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
                                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                >
                                    <Save size={20} />
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 p-6 rounded-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">Current Plan</h3>
                                            <p className="text-gray-600">Professional Plan</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-purple-600">$10</div>
                                            <div className="text-sm text-gray-600">per month</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all">
                                            Upgrade Plan
                                        </button>
                                        <button className="px-4 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-lg font-semibold hover:bg-purple-50 transition-all">
                                            Cancel Subscription
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Payment Method</h4>
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <CreditCard className="text-indigo-600" size={32} />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-gray-600">Expires 12/25</p>
                                        </div>
                                        <button className="px-4 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-all">
                                            Update
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-4">Billing History</h4>
                                    <div className="space-y-3">
                                        {[
                                            { date: 'Jan 1, 2026', amount: '$10.00', status: 'Paid' },
                                            { date: 'Dec 1, 2025', amount: '$10.00', status: 'Paid' },
                                            { date: 'Nov 1, 2025', amount: '$10.00', status: 'Paid' },
                                        ].map((invoice, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{invoice.date}</p>
                                                    <p className="text-sm text-gray-600">Professional Plan</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-800">{invoice.amount}</p>
                                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
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
