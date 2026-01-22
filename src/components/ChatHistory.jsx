import React, { useState } from 'react';
import { Clock, TrendingUp, TrendingDown, Calendar, Filter, Search, ChevronRight } from 'lucide-react';

export default function ChatHistory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    // Mock data for prediction history
    const predictions = [
        {
            id: 1,
            coin: 'Bitcoin',
            ticker: 'BTC',
            prediction: 'Bullish',
            confidence: 85,
            date: '2026-01-08',
            time: '14:30',
            currentPrice: '$42,150',
            predictedPrice: '$45,000',
            accuracy: 'Pending'
        },
        {
            id: 2,
            coin: 'Ethereum',
            ticker: 'ETH',
            prediction: 'Bullish',
            confidence: 72,
            date: '2026-01-07',
            time: '09:15',
            currentPrice: '$2,245',
            predictedPrice: '$2,400',
            accuracy: 'Correct'
        },
        {
            id: 3,
            coin: 'Solana',
            ticker: 'SOL',
            prediction: 'Bearish',
            confidence: 68,
            date: '2026-01-06',
            time: '16:45',
            currentPrice: '$98.50',
            predictedPrice: '$92.00',
            accuracy: 'Correct'
        },
        {
            id: 4,
            coin: 'Cardano',
            ticker: 'ADA',
            prediction: 'Bullish',
            confidence: 55,
            date: '2026-01-05',
            time: '11:20',
            currentPrice: '$0.52',
            predictedPrice: '$0.58',
            accuracy: 'Incorrect'
        },
        {
            id: 5,
            coin: 'Ripple',
            ticker: 'XRP',
            prediction: 'Bearish',
            confidence: 78,
            date: '2026-01-04',
            time: '13:00',
            currentPrice: '$0.63',
            predictedPrice: '$0.58',
            accuracy: 'Correct'
        },
    ];

    const filteredPredictions = predictions.filter(pred => {
        const matchesSearch = pred.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pred.ticker.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' ||
            (filterType === 'bullish' && pred.prediction === 'Bullish') ||
            (filterType === 'bearish' && pred.prediction === 'Bearish');
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: predictions.length,
        correct: predictions.filter(p => p.accuracy === 'Correct').length,
        pending: predictions.filter(p => p.accuracy === 'Pending').length,
        avgConfidence: Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Prediction History</h1>
                    <p className="text-gray-600">Track your AI-powered crypto predictions and their accuracy</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Total Predictions</p>
                                <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Clock className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Correct</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{stats.correct}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Pending</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Calendar className="text-orange-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Avg Confidence</p>
                                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.avgConfidence}%</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by coin name or ticker..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-4 py-3 rounded-xl font-semibold transition-all ${filterType === 'all'
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilterType('bullish')}
                                className={`px-4 py-3 rounded-xl font-semibold transition-all ${filterType === 'bullish'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Bullish
                            </button>
                            <button
                                onClick={() => setFilterType('bearish')}
                                className={`px-4 py-3 rounded-xl font-semibold transition-all ${filterType === 'bearish'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Bearish
                            </button>
                        </div>
                    </div>
                </div>

                {/* Predictions List */}
                <div className="space-y-4">
                    {filteredPredictions.length > 0 ? (
                        filteredPredictions.map((pred) => (
                            <div
                                key={pred.id}
                                className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${pred.prediction === 'Bullish' ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            {pred.prediction === 'Bullish' ? (
                                                <TrendingUp className="text-green-600" size={32} />
                                            ) : (
                                                <TrendingDown className="text-red-600" size={32} />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{pred.coin}</h3>
                                            <p className="text-gray-600">{pred.ticker}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={14} className="text-gray-400" />
                                                <span className="text-sm text-gray-500">{pred.date} at {pred.time}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Current Price</p>
                                            <p className="text-lg font-bold text-gray-800">{pred.currentPrice}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Predicted Price</p>
                                            <p className="text-lg font-bold text-purple-600">{pred.predictedPrice}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Confidence</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${pred.confidence >= 70 ? 'bg-green-500' :
                                                            pred.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${pred.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700">{pred.confidence}%</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium mb-1">Accuracy</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${pred.accuracy === 'Correct' ? 'bg-green-100 text-green-700' :
                                                pred.accuracy === 'Incorrect' ? 'bg-red-100 text-red-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {pred.accuracy}
                                            </span>
                                        </div>
                                    </div>

                                    <ChevronRight className="text-gray-400 hidden md:block" size={24} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No predictions found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
