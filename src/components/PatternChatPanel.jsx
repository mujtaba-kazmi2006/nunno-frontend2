import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, TrendingDown, Layers, Square, User, Bot, Plus, PieChart, Info, Zap } from 'lucide-react';
import { streamMessage } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import ThinkingLoader from './ThinkingLoader';
import { analytics } from '../utils/analytics';

const PatternChatPanel = ({ onPatternGenerated, currentPrice = 50000, interval = '1d', getTechnicalContext }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can help you find chart patterns or answer questions about technical analysis. Try asking "show me a bull flag" or "how does a double top form?".'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const inputRef = useRef(null);
    const actionMenuRef = useRef(null);
    const abortController = useRef(null);
    const messagesContainerRef = useRef(null);
    const isAtBottom = useRef(true);
    const { theme } = useTheme();

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        isAtBottom.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    const scrollToBottom = (force = false) => {
        if (messagesContainerRef.current && (isAtBottom.current || force)) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: force ? 'smooth' : 'auto'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loadingStatus]);

    // Close action menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
                setIsActionMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        setIsLoading(false);
        setLoadingStatus('');
    };

    const handleAnalyzeChart = async () => {
        if (!getTechnicalContext || isLoading) return;
        setIsActionMenuOpen(false);

        const context = getTechnicalContext();
        if (!context) return;

        const analysisPrompt = `[INTEL_FEED] Perform an elite-tier technical deep dive for ${context.symbol} on the ${context.interval} timeframe.
        
CURRENT MARKET SNAPSHOT:
- Spot Price: $${context.currentPrice.toLocaleString()}
- Current Candle OHLC: O:$${context.open.toLocaleString()} H:$${context.high.toLocaleString()} L:$${context.low.toLocaleString()} C:$${context.currentPrice.toLocaleString()}
- Volume: ${context.volume.toLocaleString()}

RECENT OHLCV HISTORY (Last 5 periods):
${context.recentHistory.map(d => `- T:${d.t}: O:${d.o}, H:${d.h}, L:${d.l}, C:${d.c}, V:${d.v}`).join('\n')}

ACTIVE TECHNICAL INDICATORS:
${Object.entries(context.indicatorValues).map(([name, val]) => {
            if (typeof val === 'object') {
                return `- ${name.toUpperCase()}: ${JSON.stringify(val, null, 1)}`;
            }
            return `- ${name.toUpperCase()}: ${val}`;
        }).join('\n')}

INSTRUCTION: You are given direct "live feed" access to the user's chart technicals. Create a comprehensive, premium market intelligence report. Analyze price action momentum across the recent history, identify indicator confluence, identify any clear candlestick patterns (like pinbars, hammers, or engulfing candles), and break down support/resistance dynamics. Provide a high-confidence verdict on the imminent chart bias. Explore the educational aspect of any patterns found.`;

        // Add user notification message
        setMessages(prev => [...prev, {
            role: 'user',
            content: `🔍 [SYSTEM_FEED] Deep Analysis: ${context.symbol} (${context.interval})`
        }]);

        setIsLoading(true);
        setLoadingStatus('Feeding AI Data Matrix...');

        // Track GA4 event
        analytics.trackScan(context.symbol, context.interval);

        try {
            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            const assistantPlaceholder = {
                role: 'assistant',
                content: ''
            };

            setMessages(prev => [...prev, assistantPlaceholder]);
            let fullContent = '';

            await streamMessage({
                message: analysisPrompt,
                conversationId: `chart-analysis-${context.symbol}-${Date.now()}`,
                userAge: 18,
                onChunk: (chunk) => {
                    if (chunk.type === 'text') {
                        setLoadingStatus('');
                        fullContent += chunk.content;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = {
                                ...newMsgs[newMsgs.length - 1],
                                content: fullContent
                            };
                            return newMsgs;
                        });
                    } else if (chunk.type === 'status') {
                        setLoadingStatus(chunk.content);
                    }
                },
                signal: abortController.current.signal
            });

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Analysis error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Analysis failed. Please check your connection.'
            }]);
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setLoadingStatus('Checking patterns...');

        // Track GA4 event
        analytics.trackAIChat(userMessage.length);

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            if (API_URL === 'your_key_here' || !API_URL.startsWith('http')) {
                API_URL = 'http://localhost:8000';
            }

            // 1. Try pattern recognition first for the visual layer
            let patternFound = null;
            try {
                const patResponse = await fetch(`${API_URL}/api/v1/pattern/recognize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: userMessage,
                        base_price: currentPrice || 50000,
                        num_points: 50,
                        interval: interval
                    })
                });

                if (patResponse.ok) {
                    const patData = await patResponse.json();
                    if (patData.success && patData.pattern) {
                        patternFound = patData.pattern;
                        if (onPatternGenerated) {
                            onPatternGenerated(patternFound);
                        }
                    }
                }
            } catch (err) {
                console.error('Pattern check failed:', err);
            }

            // 2. Start streaming AI response
            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            const assistantPlaceholder = {
                role: 'assistant',
                content: patternFound
                    ? `✨ Identified **${patternFound.pattern_name.replace(/_/g, ' ').toUpperCase()}** pattern! Drawing it on your chart now.\n\n`
                    : '',
                pattern: patternFound
            };

            setMessages(prev => [...prev, assistantPlaceholder]);
            setLoadingStatus('Thinking...');

            let fullContent = assistantPlaceholder.content;

            await streamMessage({
                message: userMessage,
                conversationId: `chat-${Date.now()}`,
                userAge: 18,
                onChunk: (chunk) => {
                    if (chunk.type === 'text') {
                        setLoadingStatus('');
                        fullContent += chunk.content;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = {
                                ...newMsgs[newMsgs.length - 1],
                                content: fullContent
                            };
                            return newMsgs;
                        });
                    } else if (chunk.type === 'status') {
                        setLoadingStatus(chunk.content);
                    }
                },
                signal: abortController.current.signal
            });

        } catch (error) {
            if (error.name === 'AbortError') return;
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please check your connection.'
            }]);
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickPatterns = [
        { name: 'Hammer Pattern', icon: <Zap className="w-3 h-3" /> },
        { name: 'Bullish Engulfing', icon: <TrendingUp className="w-3 h-3" /> },
        { name: 'Doji Meaning', icon: <Layers className="w-3 h-3" /> },
        { name: 'Price Prediction', icon: <Sparkles className="w-3 h-3" /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-white'}`}>
            {/* Header Removed as requested */}

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                            ? (theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600')
                            : (theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600')
                            }`}>
                            {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 shadow-sm" />}
                        </div>
                        <div
                            className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm border transition-colors ${message.role === 'user'
                                ? 'bg-purple-600 text-white border-purple-500 rounded-tr-sm'
                                : (theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100 rounded-tl-sm' : 'bg-slate-50 border-slate-200 text-slate-800 rounded-tl-sm')
                                }`}
                        >
                            <div className="text-sm whitespace-pre-line leading-relaxed">
                                {message.content.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )}
                            </div>
                            {message.pattern && (
                                <div className={`mt-3 pt-2 border-t flex items-center gap-3 text-xs ${message.role === 'user'
                                    ? 'border-purple-400'
                                    : (theme === 'dark' ? 'border-slate-700' : 'border-slate-200')
                                    }`}>
                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase transition-all ${message.pattern.direction === 'bullish' ? (theme === 'dark' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-green-100 text-green-700') :
                                        message.pattern.direction === 'bearish' ? (theme === 'dark' ? 'bg-rose-900/40 text-rose-400' : 'bg-red-100 text-red-700') :
                                            (theme === 'dark' ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-700')
                                        }`}>
                                        {message.pattern.direction}
                                    </span>
                                    <span className={message.role === 'user' ? 'text-purple-100' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-500')}>
                                        {(message.pattern.success_rate * 100).toFixed(0)}% accuracy
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && loadingStatus && (
                    <div className="flex justify-start gap-3 items-center">
                        <div className={`px-4 py-2 rounded-[1.5rem] rounded-tl-sm shadow-sm border flex items-center gap-4 ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <ThinkingLoader />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse italic">Thinking</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter truncate max-w-[150px]">{loadingStatus}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Patterns */}
            {messages.length <= 1 && (
                <div className={`px-4 py-3 border-t transition-colors ${theme === 'dark' ? 'bg-[#16161e]/80 border-slate-800/50' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Suggested Patterns</div>
                    <div className="flex flex-wrap gap-2">
                        {quickPatterns.map((pattern, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setInputValue(pattern.name);
                                    setTimeout(() => handleSendMessage(), 100);
                                }}
                                className={`px-3 py-1.5 text-xs rounded-full transition-all shadow-sm flex items-center gap-1.5 border ${theme === 'dark'
                                    ? 'bg-[#1e2030] border-slate-700/50 text-slate-300 hover:border-purple-500 hover:text-white'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50'
                                    }`}
                            >
                                {pattern.icon}
                                {pattern.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Overlay with Action Menu */}
            <div className={`p-4 border-t transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-800/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    {/* Plus Icon Action Menu */}
                    <div className="relative" ref={actionMenuRef}>
                        <button
                            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                            disabled={isLoading}
                            className={`p-3 rounded-xl transition-all shadow-sm border flex items-center justify-center ${isActionMenuOpen
                                ? (theme === 'dark' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-purple-600 border-purple-500 text-white')
                                : (theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-400 hover:text-purple-400' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-purple-600')
                                }`}
                        >
                            <Plus size={20} className={`transition-transform duration-300 ${isActionMenuOpen ? 'rotate-45' : ''}`} />
                        </button>

                        {isActionMenuOpen && (
                            <div className={`absolute bottom-full left-0 mb-3 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200 z-[100] ${theme === 'dark' ? 'bg-[#1e2030]/95 border-slate-700' : 'bg-white/95 border-slate-200'
                                }`}>
                                <div className="p-2 space-y-1">
                                    <button
                                        onClick={handleAnalyzeChart}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${theme === 'dark' ? 'hover:bg-purple-500/10 text-slate-200 hover:text-purple-400' : 'hover:bg-purple-50 text-slate-700 hover:text-purple-600'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                                            <Sparkles size={18} className={theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">Deep Scan Chart</div>
                                            <div className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>AI Analysis of live chart data</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setInputValue("Explain the current pattern setup");
                                            setIsActionMenuOpen(false);
                                            setTimeout(() => handleSendMessage(), 100);
                                        }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${theme === 'dark' ? 'hover:bg-blue-500/10 text-slate-200 hover:text-blue-400' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-600'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                                            <Layers size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold">Pattern Briefing</div>
                                            <div className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Get details on active setup</div>
                                        </div>
                                    </button>

                                    <div className={`my-1 h-px ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`} />

                                    <button
                                        onClick={() => setIsActionMenuOpen(false)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                            }`}
                                    >
                                        <div className="w-8 h-8 flex items-center justify-center">
                                            <Info size={18} />
                                        </div>
                                        <div className="text-sm font-medium">Help & Tips</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything..."
                            disabled={isLoading}
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm disabled:opacity-50 ${theme === 'dark'
                                ? 'bg-[#1e2030] border-slate-700/50 text-slate-100 focus:bg-[#1e2030]'
                                : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                        />
                    </div>
                    {isLoading ? (
                        <button
                            onClick={handleStop}
                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-md transition-all flex-shrink-0"
                        >
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim()}
                            className="p-3 bg-gradient-to-tr from-purple-600 to-purple-400 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 flex-shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatternChatPanel;
