import React, { useState } from 'react';
import { Check, Zap, TrendingUp, Crown, Sparkles } from 'lucide-react';

export default function NunnoPricing() {
    const [billingCycle, setBillingCycle] = useState('monthly');

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">
                        Choose Your <span className="text-purple-600">Nunno</span> Plan
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        AI-powered financial education and analysis for every level
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center bg-white rounded-full p-1.5 shadow-lg border-2 border-purple-100">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2.5 rounded-full transition-all font-medium ${billingCycle === 'monthly'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-purple-600'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('annual')}
                            className={`px-6 py-2.5 rounded-full transition-all font-medium ${billingCycle === 'annual'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-purple-600'
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const finalPrice = billingCycle === 'annual' ? Math.round(plan.price * 0.8 * 12) : plan.price;

                        return (
                            <div
                                key={index}
                                className={`relative bg-white rounded-2xl p-8 ${plan.popular
                                        ? 'border-4 border-purple-500 shadow-2xl shadow-purple-200'
                                        : 'border-2 border-gray-200 shadow-lg'
                                    } hover:shadow-xl transition-all duration-300`}
                                style={{
                                    boxShadow: plan.popular
                                        ? '0 20px 40px rgba(147, 51, 234, 0.2)'
                                        : '0 10px 30px rgba(0, 0, 0, 0.08)'
                                }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4 border-2 border-purple-200">
                                    <Icon className="w-7 h-7 text-purple-600" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>

                                <div className="mb-6">
                                    <span className="text-5xl font-bold text-gray-900">
                                        ${finalPrice}
                                    </span>
                                    <span className="text-gray-500 ml-2">
                                        /{billingCycle === 'annual' ? 'year' : 'month'}
                                    </span>
                                </div>

                                {/* Usage Stats */}
                                <div className="bg-purple-50 rounded-xl p-4 mb-6 space-y-2 border border-purple-100">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Tokens</span>
                                        <span className="text-purple-700 font-bold">{plan.tokens}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Daily Searches</span>
                                        <span className="text-purple-700 font-bold">{plan.searches}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 font-medium">Search Limit</span>
                                        <span className="text-purple-700 font-bold">{plan.searchLimit} chars</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-purple-600" />
                                            </div>
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-3 rounded-xl font-semibold transition-all shadow-md ${plan.popular
                                            ? 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                                            : 'bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50'
                                        }`}
                                >
                                    Get Started
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Pro Plan Info */}
                <div className="mt-16 bg-white rounded-2xl p-8 border-4 border-purple-200 shadow-xl">
                    <div className="text-center">
                        <div className="inline-block bg-purple-100 rounded-full px-4 py-2 mb-4">
                            <span className="text-purple-700 font-bold text-sm">ELITE PLAN</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                            Need More Power? Try Our Elite Plan
                        </h3>
                        <p className="text-gray-600 mb-8 text-lg">
                            Get 900,000 tokens per month with 300 daily searches for ultimate financial analysis
                        </p>
                        <div className="flex items-center justify-center space-x-12 mb-8">
                            <div className="text-center bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
                                <div className="text-4xl font-bold text-purple-700">900K</div>
                                <div className="text-gray-600 text-sm font-medium mt-1">Tokens/month</div>
                            </div>
                            <div className="text-center bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
                                <div className="text-4xl font-bold text-purple-700">300</div>
                                <div className="text-gray-600 text-sm font-medium mt-1">Searches/day</div>
                            </div>
                            <div className="text-center bg-purple-50 rounded-xl p-6 border-2 border-purple-100">
                                <div className="text-4xl font-bold text-purple-700">3,000</div>
                                <div className="text-gray-600 text-sm font-medium mt-1">Chars/search</div>
                            </div>
                        </div>
                        <button className="bg-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl">
                            Start Elite for $100/month
                        </button>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center space-x-8 bg-white rounded-full px-8 py-4 shadow-lg border-2 border-purple-100">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-700 text-sm font-medium">Powered by Claude Opus 4.5</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-700 text-sm font-medium">Cancel anytime</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-700 text-sm font-medium">Secure payments</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
