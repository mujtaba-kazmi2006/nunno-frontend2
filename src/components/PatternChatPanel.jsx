import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, TrendingDown, Layers, Square, User, Bot } from 'lucide-react';
import { streamMessage } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const PatternChatPanel = ({ onPatternGenerated, currentPrice = 50000, interval = '1d' }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I can help you find chart patterns or answer questions about technical analysis. Try asking "show me a bull flag" or "how does a double top form?".'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const abortController = useRef(null);
    const { theme } = useTheme();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loadingStatus]);

    const handleStop = () => {
        if (abortController.current) {
            abortController.current.abort();
            abortController.current = null;
        }
        setIsLoading(false);
        setLoadingStatus('');
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setLoadingStatus('Checking patterns...');

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

            await streamMessage(
                userMessage,
                'User',
                18,
                messages, // History
                (chunk) => {
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
                abortController.current.signal
            );

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
        { name: 'Bull Flag', icon: <TrendingUp className="w-3 h-3" /> },
        { name: 'Head and Shoulders', icon: <Layers className="w-3 h-3" /> },
        { name: 'Ascending Triangle', icon: <TrendingUp className="w-3 h-3" /> },
        { name: 'Double Bottom', icon: <TrendingUp className="w-3 h-3" /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#16161e]' : 'bg-white'}`}>
            {/* Header Removed as requested */}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                    <div className="flex justify-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>
                            <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className={`px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                            <div className="flex items-center gap-2">
                                <Loader2 className={`w-4 h-4 animate-spin ${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'}`} />
                                <span className="text-sm font-medium">{loadingStatus}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
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

            {/* Input Overlay with Stop Button */}
            <div className={`p-4 border-t transition-colors ${theme === 'dark' ? 'bg-[#16161e] border-slate-800/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2">
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
