import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Book, Mail, Send, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function HelpSupport() {
    const { theme } = useTheme();
    const [activeCategory, setActiveCategory] = useState('all');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const categories = [
        { id: 'all', label: 'All Topics', icon: Book },
        { id: 'getting-started', label: 'Getting Started', icon: HelpCircle },
        { id: 'predictions', label: 'Predictions', icon: MessageCircle },
        { id: 'billing', label: 'Billing', icon: Mail },
    ];

    const faqs = [
        {
            category: 'getting-started',
            question: 'How do I get started with Nunno Finance?',
            answer: 'Simply sign up for an account, choose a plan that fits your needs, and start chatting with our AI assistant. You can ask questions about crypto markets, request predictions, and learn about financial concepts.'
        },
        {
            category: 'getting-started',
            question: 'What makes Nunno Finance different?',
            answer: 'Nunno Finance combines advanced AI technology with financial education. Our platform not only provides predictions but also explains the reasoning behind them, helping you learn and make informed decisions.'
        },
        {
            category: 'predictions',
            question: 'How accurate are the AI predictions?',
            answer: 'Our AI analyzes multiple data sources including technical indicators, market sentiment, and historical patterns. While no prediction is 100% accurate, our models are continuously improving. You can track accuracy in your prediction history.'
        },
        {
            category: 'predictions',
            question: 'Can I request predictions for any cryptocurrency?',
            answer: 'Yes! Our AI supports predictions for all major cryptocurrencies including Bitcoin, Ethereum, Solana, and many more. Simply ask in the chat interface.'
        },
        {
            category: 'predictions',
            question: 'What timeframes do predictions cover?',
            answer: 'Our predictions typically cover short-term (24 hours), medium-term (7 days), and long-term (30 days) timeframes. You can specify your preferred timeframe when requesting a prediction.'
        },
        {
            category: 'billing',
            question: 'Can I change my plan at any time?',
            answer: 'Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and billing is prorated.'
        },
        {
            category: 'billing',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards. All payments are processed securely through Stripe.'
        },
        {
            category: 'billing',
            question: 'Is there a free trial?',
            answer: 'New users get 1,000 free AI tokens to try out the platform. No credit card required for the trial period.'
        },
    ];

    const filteredFaqs = activeCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement contact form submission
        alert('Message sent! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className={`min-h-screen py-8 px-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-gradient-to-br from-gray-50 to-purple-50'}`}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Help & Support</h1>
                    <p className={`text-xl ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>We're here to help you succeed</p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className={`rounded-xl p-6 shadow-md border hover:shadow-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                            <Book className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Documentation</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Comprehensive guides and tutorials</p>
                    </div>

                    <div className={`rounded-xl p-6 shadow-md border hover:shadow-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-green-100'}`}>
                            <MessageCircle className="text-green-500" size={24} />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Live Chat</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Chat with our support team</p>
                    </div>

                    <div className={`rounded-xl p-6 shadow-md border hover:shadow-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 hover:border-purple-500/50' : 'bg-white border-gray-200 hover:border-purple-300'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                            <Mail className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={24} />
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Email Support</h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>support@nunnofinance.com</p>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className={`rounded-2xl shadow-lg border p-8 mb-8 ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Frequently Asked Questions</h2>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${activeCategory === cat.id
                                        ? (theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white shadow-md')
                                        : (theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                        }`}
                                >
                                    <Icon size={18} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ List */}
                    <div className="space-y-3">
                        {filteredFaqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`border-2 rounded-xl overflow-hidden transition-all ${theme === 'dark' ? (expandedFaq === index ? 'border-purple-500/50' : 'border-slate-800 hover:border-slate-700') : (expandedFaq === index ? 'border-purple-300' : 'border-gray-200 hover:border-purple-300')}`}
                            >
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className={`w-full flex items-center justify-between p-4 text-left transition-all ${theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}
                                >
                                    <span className={`font-semibold pr-4 ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <ChevronUp className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                    ) : (
                                        <ChevronDown className="text-slate-500" size={20} />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className={`px-4 pb-4 pt-2 border-t ${theme === 'dark' ? 'bg-slate-900/30 border-slate-700/50 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                        <p className="leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form */}
                <div className={`rounded-2xl shadow-lg border p-8 ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100' : 'bg-white border-gray-200'}`}>
                    <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>Still need help?</h2>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Send us a message and we'll get back to you as soon as possible</p>

                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={contactForm.name}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={contactForm.email}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                value={contactForm.subject}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                placeholder="How can we help?"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                                Message
                            </label>
                            <textarea
                                name="message"
                                value={contactForm.message}
                                onChange={handleInputChange}
                                required
                                rows={6}
                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all resize-none ${theme === 'dark' ? 'bg-[#16161e] border-slate-700 text-slate-200 focus:border-purple-500' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'}`}
                                placeholder="Tell us more about your question or issue..."
                            />
                        </div>

                        <button
                            type="submit"
                            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            <Send size={20} />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
