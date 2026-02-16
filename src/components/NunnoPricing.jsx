import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Zap, TrendingUp, Crown, Sparkles, Brain, Activity, Wallet, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { analytics } from '../utils/analytics';

const ComingSoonOverlay = () => {
    const [email, setEmail] = useState('');
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        try {
            await axios.post('/api/v1/waitlist', {
                email,
                source: 'pricing'
            });
            // Persist to local "database" for Investor Metrics page
            const existing = JSON.parse(localStorage.getItem('nunno_waitlist') || '[]');
            const updated = [{ email, timestamp: new Date().toISOString() }, ...existing];
            localStorage.setItem('nunno_waitlist', JSON.stringify(updated));
            setJoined(true);
        } catch (error) {
            console.error('Pricing Waitlist Error:', error);
            setJoined(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex flex-col items-center justify-center p-6 text-center bg-black/60 backdrop-blur-[20px] overflow-hidden pointer-events-auto">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl relative z-10 w-full px-4"
            >
                <div className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Phase 2: Global Expansion</span>
                </div>

                <h2 className="text-5xl sm:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[0.9] drop-shadow-2xl overflow-visible pr-4 md:pr-8">
                    FREE <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">UNFOLD</span>
                </h2>

                <p className="text-slate-300 text-sm md:text-lg font-medium max-w-md mx-auto mb-10 leading-relaxed opacity-80">
                    Paid subscriptions are coming soon. All premium intelligence nodes are UNLOCKED for everyone during our global debut.
                </p>

                <AnimatePresence mode="wait">
                    {!joined ? (
                        <motion.form
                            key="pricing-waitlist"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleJoin}
                            className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto w-full"
                        >
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Reserve your trader handle (email)"
                                className="w-full sm:flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm placeholder:text-slate-500"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest italic transition-all shadow-xl shadow-emerald-600/20 active:scale-95 text-xs whitespace-nowrap"
                            >
                                {loading ? 'Processing...' : 'Reserve Access'}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="pricing-success"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] backdrop-blur-md max-w-md mx-auto"
                        >
                            <div className="size-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/40">
                                <Check size={32} className="text-white" strokeWidth={4} />
                            </div>
                            <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-2">Priority Locked</h3>
                            <p className="text-slate-400 text-sm font-medium">Your handle is reserved. You'll switch to the High-Limit node automatically upon launch.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!joined && (
                    <button
                        onClick={() => window.history.back()}
                        className="mt-8 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest italic transition-all"
                    >
                        Return Home
                    </button>
                )}
            </motion.div>
        </div>
    );
};

export default function NunnoPricing() {
    const { theme } = useTheme();
    const [billingCycle, setBillingCycle] = useState('monthly');

    useEffect(() => {
        analytics.trackPricingView();
    }, []);

    const plans = [
        {
            name: 'Starter',
            price: 5,
            icon: Zap,
            tokens: '30,000',
            searches: 10,
            searchLimit: 100,
            tokensPerDay: 1000,
            features: [
                '30,000 AI tokens/month',
                '10 searches per day',
                '100 characters per search',
                'Basic financial analysis',
                'Market insights',
                'Educational content'
            ],
            popular: false
        },
        {
            name: 'Professional',
            price: 10,
            icon: TrendingUp,
            tokens: '75,000',
            searches: 25,
            searchLimit: 250,
            tokensPerDay: 2500,
            features: [
                '75,000 AI tokens/month',
                '25 searches per day',
                '250 characters per search',
                'Advanced market analysis',
                'Portfolio insights',
                'Real-time data access',
                'Priority support'
            ],
            popular: true
        },
        {
            name: 'Business',
            price: 30,
            icon: Crown,
            tokens: '210,000',
            searches: 70,
            searchLimit: 700,
            tokensPerDay: 7000,
            features: [
                '210,000 AI tokens/month',
                '70 searches per day',
                '700 characters per search',
                'Deep financial modeling',
                'Custom analysis reports',
                'API access',
                'Dedicated support',
                'Export capabilities'
            ],
            popular: false
        },
        {
            name: 'Enterprise',
            price: 50,
            icon: Sparkles,
            tokens: '450,000',
            searches: 150,
            searchLimit: 1500,
            tokensPerDay: 15000,
            features: [
                '450,000 AI tokens/month',
                '150 searches per day',
                '1,500 characters per search',
                'Unlimited analysis depth',
                'White-label options',
                'Team collaboration',
                'Custom integrations',
                '24/7 premium support'
            ],
            popular: false
        }
    ];

    return (
        <div className={`min-h-screen py-12 px-4 transition-colors duration-500 relative overflow-hidden ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-gradient-to-br from-gray-50 to-purple-50'}`}>
            <ComingSoonOverlay />
            <div className="max-w-7xl mx-auto opacity-20 filter grayscale pointer-events-none">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                        Choose Your <span className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}>Nunno</span> Plan
                    </h1>
                    <p className={`text-lg md:text-xl mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                        AI-powered financial education and analysis for every level
                    </p>

                    {/* Billing Toggle */}
                    <div className={`inline-flex items-center rounded-full p-1.5 shadow-lg border-2 transition-colors ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-purple-100'}`}>
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-full transition-all font-medium ${billingCycle === 'monthly'
                                ? (theme === 'dark' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-600 text-white shadow-md')
                                : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-purple-600')
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2.5 rounded-full transition-all font-medium ${billingCycle === 'annual'
                                ? (theme === 'dark' ? 'bg-purple-600 text-white shadow-md' : 'bg-purple-600 text-white shadow-md')
                                : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-purple-600')
                                }`}
                        >
                            Annual
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 md:px-0">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const finalPrice = billingCycle === 'annual' ? Math.round(plan.price * 0.8 * 12) : plan.price;

                        return (
                            <div
                                key={index}
                                className={`relative rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 ${plan.popular
                                    ? (theme === 'dark' ? 'border-4 border-purple-500 shadow-2xl shadow-purple-500/10' : 'border-4 border-purple-500 shadow-2xl shadow-purple-200')
                                    : (theme === 'dark' ? 'bg-[#1e2030] border-2 border-slate-700/50 shadow-lg' : 'bg-white border-2 border-gray-200 shadow-lg')
                                    } ${theme === 'dark' && plan.popular ? 'bg-[#1e2030]' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap ${theme === 'dark' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'}`}>
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 border-2 transition-colors ${theme === 'dark' ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-100 border-purple-200'}`}>
                                    <Icon className={`w-7 h-7 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                                </div>

                                <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>{plan.name}</h3>

                                <div className="mb-6">
                                    <span className={`text-5xl font-bold ${theme === 'dark' ? 'text-slate-50' : 'text-gray-900'}`}>
                                        ${finalPrice}
                                    </span>
                                    <span className={`ml-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                                        /{billingCycle === 'annual' ? 'year' : 'month'}
                                    </span>
                                </div>

                                {/* Usage Stats */}
                                <div className={`rounded-xl p-4 mb-6 space-y-2 border transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-purple-50 border-purple-100'}`}>
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Tokens</span>
                                        <span className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>{plan.tokens}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Daily Searches</span>
                                        <span className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>{plan.searches}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>Search Limit</span>
                                        <span className={`font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>{plan.searchLimit} chars</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'bg-green-500/10' : 'bg-purple-100'}`}>
                                                <Check className={`w-3 h-3 ${theme === 'dark' ? 'text-green-500' : 'text-purple-600'}`} />
                                            </div>
                                            <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-3 rounded-xl font-semibold transition-all shadow-md ${plan.popular
                                        ? (theme === 'dark' ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg' : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg')
                                        : (theme === 'dark' ? 'bg-slate-800 text-slate-200 border-2 border-slate-700 hover:bg-slate-700' : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50')
                                        }`}
                                >
                                    Get Started
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Pro Plan Info */}
                <div className={`mt-16 rounded-2xl p-6 md:p-10 border-4 shadow-xl transition-colors ${theme === 'dark' ? 'bg-[#1e2030] border-purple-500/30 shadow-purple-500/5' : 'bg-white border-purple-200 shadow-xl'}`}>
                    <div className="text-center">
                        <div className={`inline-block rounded-full px-4 py-2 mb-4 ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                            <span className={`font-bold text-sm ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>ELITE PLAN</span>
                        </div>
                        <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>
                            Need More Power? Try Our Elite Plan
                        </h3>
                        <p className={`mb-8 text-base md:text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                            Get 900,000 tokens per month with 300 daily searches for ultimate financial analysis
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className={`text-center rounded-xl p-6 border-2 transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-purple-50 border-purple-100'}`}>
                                <div className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>900K</div>
                                <div className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Tokens/month</div>
                            </div>
                            <div className={`text-center rounded-xl p-6 border-2 transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-purple-50 border-purple-100'}`}>
                                <div className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>300</div>
                                <div className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Searches/day</div>
                            </div>
                            <div className={`text-center rounded-xl p-6 border-2 transition-colors ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50' : 'bg-purple-50 border-purple-100'}`}>
                                <div className={`text-3xl md:text-4xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-700'}`}>3,000</div>
                                <div className={`text-sm font-medium mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-600'}`}>Chars/search</div>
                            </div>
                        </div>
                        <button className={`px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl w-full md:w-auto ${theme === 'dark' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                            Start Elite for $100/month
                        </button>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 text-center pb-8">
                    <div className={`inline-flex flex-col md:flex-row items-center md:space-x-8 space-y-4 md:space-y-0 rounded-2xl md:rounded-full px-8 py-4 shadow-lg border-2 transition-colors ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50' : 'bg-white border-purple-100'}`}>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>Powered by Nunno Private Intelligence</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>Cancel anytime</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'}`}></div>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-700'}`}>Secure payments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
