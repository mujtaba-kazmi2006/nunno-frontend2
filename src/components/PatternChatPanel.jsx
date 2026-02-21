import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, TrendingDown, Layers, Square, User, Bot, Plus, PieChart, Info, Zap, ChevronDown, CheckCircle2, X, Search, Activity, Brain, Target, ShieldCheck, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamMessage } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ThinkingLoader from './ThinkingLoader';
import { analytics } from '../utils/analytics';

const PatternChatPanel = ({ onPatternGenerated, currentPrice = 50000, interval = '1d', getTechnicalContext, onUnauthorized }) => {
    const { isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'SYSTEM_READY: I am synced with your live chart data. Ask me to "Deep Scan" or identify specific price patterns.',
            isSystem: true
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
        if (!isAuthenticated) {
            onUnauthorized?.();
            return;
        }
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

        setMessages(prev => [...prev, {
            role: 'user',
            content: `🔍 [INTEL_SCAN] Comprehensive Analysis Request for ${context.symbol}`,
            isIntelRequest: true
        }]);

        setIsLoading(true);
        setLoadingStatus('Initializing Neural Scan...');

        analytics.trackScan(context.symbol, context.interval);

        try {
            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            const assistantPlaceholder = {
                role: 'assistant',
                content: '',
                isIntelResponse: true,
                symbol: context.symbol
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
                content: '❌ Quantum Link Severed. Analysis aborted.',
                isSystem: true
            }]);
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const handleSendMessage = async () => {
        if (!isAuthenticated) {
            onUnauthorized?.();
            return;
        }
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);
        setLoadingStatus('Processing Signal...');

        analytics.trackAIChat(userMessage.length);

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            if (API_URL === 'your_key_here' || !API_URL.startsWith('http')) {
                API_URL = 'http://localhost:8000';
            }

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

            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();

            const assistantPlaceholder = {
                role: 'assistant',
                content: patternFound
                    ? `[PATTERN_SYNC] **${patternFound.pattern_name.replace(/_/g, ' ').toUpperCase()}** located. Mapping identified coordinates to chart.\n\n`
                    : '',
                pattern: patternFound
            };

            setMessages(prev => [...prev, assistantPlaceholder]);
            setLoadingStatus('Calculating Probabilities...');

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
                content: '❌ Logic Error. Communication interface degraded.',
                isSystem: true
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
        { name: 'Deep Scan Chart', icon: <Cpu className="w-3.5 h-3.5" />, action: handleAnalyzeChart },
        { name: 'Pattern Hunt', icon: <Search className="w-3.5 h-3.5" /> },
        { name: 'Bias Verdict', icon: <Target className="w-3.5 h-3.5" /> },
        { name: 'Strategy Guide', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-slate-50'}`}>
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 custom-scrollbar"
            >
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${message.role === 'user'
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                                : (theme === 'dark' ? 'bg-[#1e2030] border border-white/5' : 'bg-white border border-slate-200 shadow-xl')
                                }`}>
                                {message.role === 'user' ? <User size={18} /> : <img src="/logo.png" alt="Nunno AI" className="w-6 h-6 object-contain" />}
                            </div>

                            <div
                                className={`max-w-[88%] flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`px-5 py-4 rounded-[2rem] shadow-2xl border backdrop-blur-md transition-all ${message.role === 'user'
                                        ? 'bg-purple-600/90 text-white border-purple-500 rounded-tr-sm'
                                        : message.isIntelResponse
                                            ? (theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/20 text-slate-100 rounded-tl-sm w-full' : 'bg-indigo-50 border-indigo-100 text-slate-800 rounded-tl-sm w-full')
                                            : message.isSystem
                                                ? (theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50 text-slate-400 italic text-[11px] font-mono' : 'bg-slate-100 border-slate-200 text-slate-500 italic text-[11px] font-mono')
                                                : (theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100 rounded-tl-sm' : 'bg-white border-slate-200 text-slate-800 rounded-tl-sm shadow-xl')
                                        }`}
                                >
                                    {message.isIntelResponse && (
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-indigo-500/10">
                                            <div className="p-1.5 rounded-lg bg-indigo-500/10">
                                                <Activity size={14} className="text-indigo-400" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Intelligence Feed // {message.symbol}</span>
                                        </div>
                                    )}

                                    <div className={`text-[13px] whitespace-pre-line leading-[1.6] ${message.isSystem ? 'opacity-80' : 'font-medium'}`}>
                                        {message.content.split('**').map((part, i) =>
                                            i % 2 === 1 ? <strong key={i} className="text-purple-400 font-black">{part}</strong> : part
                                        )}
                                        {message.content === '' && isLoading && <div className="flex gap-1 items-center opacity-40"><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} /></div>}
                                    </div>

                                    {message.pattern && (
                                        <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-4 text-[10px] ${message.role === 'user' ? 'border-white/10' : (theme === 'dark' ? 'border-slate-800' : 'border-slate-100')}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg font-black uppercase tracking-widest transition-all ${message.pattern.direction === 'bullish' ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                                                    message.pattern.direction === 'bearish' ? (theme === 'dark' ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700') :
                                                        (theme === 'dark' ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-700')
                                                    }`}>
                                                    {message.pattern.direction}
                                                </span>
                                                <span className="font-black text-slate-500">{(message.pattern.success_rate * 100).toFixed(0)}% EST. ACCURACY</span>
                                            </div>
                                            <Zap size={14} className="text-amber-500 animate-pulse" />
                                        </div>
                                    )}
                                </div>
                                {message.role === 'assistant' && !message.isSystem && (
                                    <div className="flex gap-4 items-center pl-2 opacity-30 hover:opacity-100 transition-opacity">
                                        <button className="text-[10px] uppercase font-black tracking-widest hover:text-purple-500 transition-colors">Copy Intel</button>
                                        <button className="text-[10px] uppercase font-black tracking-widest hover:text-purple-500 transition-colors">Explain Pattern</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && loadingStatus && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-start gap-4 items-center"
                    >
                        <div className={`px-6 py-4 rounded-[1.5rem] rounded-tl-sm shadow-2xl border flex items-center gap-5 ${theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100' : 'bg-white border-slate-200 text-slate-800 shadow-xl'}`}>
                            <div className="relative">
                                <img src="/logo.png" alt="Nunno Thinking" className="w-6 h-6 object-contain animate-pulse" />
                                <div className="absolute inset-0 bg-purple-500/10 blur-lg rounded-full animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] animate-pulse italic">Thinking Engine</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate max-w-[200px]">{loadingStatus}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Premium Action Menu Area */}
            <div className={`p-6 border-t space-y-4 transition-colors ${theme === 'dark' ? 'bg-[#0f111a] border-white/5' : 'bg-white border-slate-200'}`}>
                {messages.length <= 1 && (
                    <div className="space-y-4 mb-2">
                        <div className="flex items-center justify-between px-1">
                            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Suggested Operations</span>
                            <div className="w-12 h-[1px] bg-slate-800" />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {quickPatterns.map((pattern, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            onUnauthorized?.();
                                            return;
                                        }
                                        if (pattern.action) {
                                            pattern.action();
                                        } else {
                                            setInputValue(pattern.name);
                                            setTimeout(() => handleSendMessage(), 100);
                                        }
                                    }}
                                    className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 border whitespace-nowrap active:scale-95 ${theme === 'dark'
                                        ? 'bg-[#1e2030] border-slate-700/50 text-slate-300 hover:border-purple-500 hover:text-white shadow-xl'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600 hover:bg-white shadow-md'
                                        }`}
                                >
                                    {pattern.icon}
                                    {pattern.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <div className="relative" ref={actionMenuRef}>
                        <button
                            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                            disabled={isLoading}
                            className={`p-3.5 rounded-2xl transition-all shadow-2xl border flex items-center justify-center active:scale-90 ${isActionMenuOpen
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : (theme === 'dark' ? 'bg-[#1e2030] border-white/5 text-slate-400 hover:text-purple-400' : 'bg-white border-slate-200 text-slate-500 hover:text-purple-600 shadow-xl')
                                }`}
                        >
                            <Plus size={22} className={`transition-transform duration-500 ${isActionMenuOpen ? 'rotate-90 scale-110' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isActionMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className={`absolute bottom-full left-0 mb-4 w-72 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border backdrop-blur-3xl z-[100] overflow-hidden ${theme === 'dark' ? 'bg-[#1e2030]/95 border-white/10' : 'bg-white/95 border-slate-200'
                                        }`}
                                >
                                    <div className="p-3 space-y-1">
                                        {[
                                            { label: 'Deep Scan Chart', desc: 'Full AI data extraction', icon: <Sparkles size={18} />, color: 'purple', action: handleAnalyzeChart },
                                            { label: 'Pattern Briefing', desc: 'Details on active setup', icon: <Layers size={18} />, color: 'blue', action: () => { setInputValue("Analyze current chart patterns"); handleSendMessage(); } },
                                            { label: 'Market Sentiment', desc: 'Fear & Greed analysis', icon: <Target size={18} />, color: 'amber', action: () => { setInputValue("What is the current market sentiment?"); handleSendMessage(); } }
                                        ].map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setIsActionMenuOpen(false);
                                                    item.action();
                                                }}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${theme === 'dark' ? 'hover:bg-white/5 group' : 'hover:bg-slate-50'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${theme === 'dark' ? `bg-${item.color}-500/10 text-${item.color}-400 group-hover:bg-${item.color}-500/20` : `bg-${item.color}-100 text-${item.color}-600`}`}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <div className={`text-sm font-black uppercase tracking-tight ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.label}</div>
                                                    <div className={`text-[9px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{item.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex-1 relative group">
                        <textarea
                            ref={inputRef}
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onFocus={() => {
                                if (!isAuthenticated) {
                                    onUnauthorized?.();
                                    inputRef.current?.blur();
                                }
                            }}
                            placeholder="Connect vision into intelligence..."
                            disabled={isLoading}
                            className={`w-full px-6 py-4 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all text-sm disabled:opacity-50 resize-none font-medium custom-scrollbar ${theme === 'dark'
                                ? 'bg-[#1e2030] border-white/5 text-slate-100 placeholder:text-slate-600'
                                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-inner'
                                }`}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isLoading ? (
                                <button
                                    onClick={handleStop}
                                    className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg group"
                                    title="Stop Agent"
                                >
                                    <Square size={16} className="fill-current" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90 flex-shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-center">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-700 opacity-50">Experimental Neural Link v4.2.0</span>
                </div>
            </div>
        </div>
    );
};

export default PatternChatPanel;
