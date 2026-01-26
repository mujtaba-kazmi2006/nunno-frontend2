import React, { useState } from 'react';
import { TrendingUp, Info, X, Sparkles, Target, AlertCircle } from 'lucide-react';

const PatternInfoCard = ({ pattern, onClose }) => {
    if (!pattern) return null;

    const getDirectionColor = (direction) => {
        if (direction === 'bullish') return 'text-green-600 bg-green-50 border-green-200';
        if (direction === 'bearish') return 'text-red-600 bg-red-50 border-red-200';
        return 'text-orange-600 bg-orange-50 border-orange-200';
    };

    const getDirectionIcon = (direction) => {
        if (direction === 'bullish') return '📈';
        if (direction === 'bearish') return '📉';
        return '↔️';
    };

    const successRateColor = (rate) => {
        if (rate >= 0.80) return 'text-green-600';
        if (rate >= 0.70) return 'text-yellow-600';
        return 'text-orange-600';
    };

    return (
        <div className="absolute top-4 right-4 z-30 w-96 bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h3 className="font-bold text-white text-lg">
                        {pattern.pattern_name?.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Direction & Type */}
                <div className="flex gap-2">
                    <div className={`flex-1 px-3 py-2 rounded-lg border-2 ${getDirectionColor(pattern.direction)}`}>
                        <div className="text-xs font-semibold opacity-75 mb-1">Direction</div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getDirectionIcon(pattern.direction)}</span>
                            <span className="font-bold capitalize">{pattern.direction}</span>
                        </div>
                    </div>
                    <div className="flex-1 px-3 py-2 rounded-lg border-2 border-blue-200 bg-blue-50">
                        <div className="text-xs font-semibold text-blue-600 opacity-75 mb-1">Type</div>
                        <div className="font-bold text-blue-700 capitalize">{pattern.pattern_type}</div>
                    </div>
                </div>

                {/* Success Rate */}
                {pattern.success_rate && (
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Success Rate</span>
                            <span className={`text-2xl font-bold ${successRateColor(pattern.success_rate)}`}>
                                {(pattern.success_rate * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${pattern.success_rate >= 0.80 ? 'bg-green-500' :
                                        pattern.success_rate >= 0.70 ? 'bg-yellow-500' : 'bg-orange-500'
                                    }`}
                                style={{ width: `${pattern.success_rate * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-purple-900 leading-relaxed">
                            {pattern.description}
                        </p>
                    </div>
                </div>

                {/* Key Levels */}
                {pattern.key_levels && (
                    <div className="space-y-2">
                        <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Key Levels
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                                <div className="text-xs text-green-600 font-semibold">High</div>
                                <div className="text-sm font-mono font-bold text-green-700">
                                    ${pattern.key_levels.high?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                <div className="text-xs text-red-600 font-semibold">Low</div>
                                <div className="text-sm font-mono font-bold text-red-700">
                                    ${pattern.key_levels.low?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                            </div>
                            {pattern.key_levels.breakout_level && (
                                <div className="col-span-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                                    <div className="text-xs text-orange-600 font-semibold">Breakout Level</div>
                                    <div className="text-sm font-mono font-bold text-orange-700">
                                        ${pattern.key_levels.breakout_level?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Trading Tips */}
                {pattern.trading_tips && pattern.trading_tips.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Trading Tips
                        </div>
                        <div className="space-y-1.5">
                            {pattern.trading_tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </div>
                                    <span className="text-slate-700 leading-relaxed">{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Annotations */}
                {pattern.annotations && pattern.annotations.length > 0 && (
                    <div className="space-y-2">
                        <div className="text-sm font-bold text-slate-700">Pattern Features</div>
                        <div className="flex flex-wrap gap-2">
                            {pattern.annotations.map((annotation, index) => (
                                <div
                                    key={index}
                                    className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700"
                                >
                                    {annotation.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatternInfoCard;
