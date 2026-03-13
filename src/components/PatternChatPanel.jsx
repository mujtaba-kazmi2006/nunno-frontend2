import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, TrendingUp, TrendingDown, Layers, Square, User, Bot, Plus, PieChart, Info, Zap, ChevronDown, CheckCircle2, X, Search, Activity, Brain, Target, ShieldCheck, Cpu, Microscope } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamEliteMessage, streamMessage } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import ThinkingLoader from './ThinkingLoader';
import { analytics } from '../utils/analytics';
import { generateUUID } from '../utils/uuid';

const PatternChatPanel = ({ onPatternGenerated, onLivePatternDetected, currentPrice = 50000, interval = '1d', symbol = 'BTCUSDT', getTechnicalContext, onUnauthorized, onHighlightLevels, onWhatIfScenario, onSymbolChange, onCorrelationOverlay }) => {
    const { isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '🧠 **Intelligence Core Online.** I\'m embedded in your chart — I see price, indicators, S/R levels, and patterns in real-time. Ask me anything: \n\n• _"Where is the strongest support?"_ \n• _"What if price drops 3%?"_ \n• _"Show me a bull flag"_ \n• Or hit **Deep Scan** for a full briefing.',
            isSystem: true
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [chatConversationId] = useState(() => generateUUID());
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

        const ms = context.marketStructure || {};
        const analysisPrompt = `[INTEL_FEED] Perform a high-fidelity 'Deep Scan' technical analysis for ${context.symbol} on the ${context.interval} timeframe.
    
PRESENT DATA MATRIX:
- Current Spot: $${context.currentPrice.toLocaleString()}
- OHLC: O:$${context.open.toLocaleString()} H:$${context.high.toLocaleString()} L:$${context.low.toLocaleString()} C:$${context.currentPrice.toLocaleString()}
- Current Candle Volume: ${context.volume.toLocaleString()}

MARKET STRUCTURE OVERVIEW (Last 30 ${context.interval} periods):
- 30-Period High: $${ms.periodHigh?.toLocaleString() || 'N/A'}
- 30-Period Low: $${ms.periodLow?.toLocaleString() || 'N/A'}
- Price Range: $${ms.range?.toLocaleString() || 'N/A'} (${ms.rangePct || 0}%)
- Trend Direction: ${ms.trendDirection || 'N/A'} (${ms.trendPct || 0}% over 30 periods)
- Average Volume: ${ms.avgVolume?.toLocaleString() || 'N/A'}
- Total Volume: ${ms.totalVolume?.toLocaleString() || 'N/A'}
- Current vs Avg Volume: ${ms.currentVsAvgVol || 'N/A'}%

HISTORICAL OHLCV DATA (Last 30 periods):
${context.recentHistory.map(d => `T:${new Date(d.t * 1000).toLocaleTimeString()} | O:${d.o} H:${d.h} L:${d.l} C:${d.c} V:${(d.v || 0).toLocaleString()}`).join('\n')}

MACRO CLOSE SERIES (Last ${context.closeSeries?.length || 0} candles, oldest→newest):
${context.closeSeries?.join(', ') || 'N/A'}

ACTIVE NEURAL INDICATORS:
${Object.entries(context.indicatorValues).map(([name, val]) => {
            if (typeof val === 'object') {
                return `- ${name.toUpperCase()}: ${JSON.stringify(val, null, 1)}`;
            }
            return `- ${name.toUpperCase()}: ${val}`;
        }).join('\n')}

INSTRUCTIONS FOR OUTPUT:
You are the Nunno Intelligence Core. Deliver a professional, structured market briefing. Use Markdown headings (###).

### 1. Birds-Eye Market Perspective
Analyze the broad trend over the last 30 periods using the MARKET STRUCTURE data. Reference the 30-period high/low, trend direction percentage, and volume dynamics. Is this a distribution, accumulation, or trending phase?

### 2. Micro-Structural Dynamics
Deep dive into the immediate price action (last 3-5 candles from the OHLCV data). Identify specific candlestick patterns (Hammers, Engulfing, Dojis). Compare current volume to the average — is volume confirming or diverging from price?

### 3. Indicator Confluence & Strategic Levels
Synthesize ALL the indicators above. Where is price relative to EMAs? Is RSI showing divergence? What does MACD histogram direction tell us? Cross-reference with Support/Resistance levels.

### 4. Tactical Verdict
Deliver a high-confidence bias (Bullish/Bearish/Neutral) with a conviction percentage for the next 1-3 periods.

### 5. Simulator Activation
CRITICAL: Explicitly ask the user if they want to physically see what this looks like simulated on their chart. You MUST organically mention a specific common chart pattern (like "ascending triangle", "falling wedge", "head and shoulders", "bull flag", etc.) that fits your analysis.`;

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

            await streamEliteMessage({
                message: analysisPrompt,
                conversationId: chatConversationId,
                ticker: symbol,
                interval: interval,
                forceRefresh: true,
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
                    } else if (chunk.type === 'tool_result') {
                        if (chunk.tool === 'visualize_pattern' && onPatternGenerated) {
                            onPatternGenerated(chunk.data);
                        } else if (chunk.tool === 'highlight_levels' && onHighlightLevels) {
                            onHighlightLevels(chunk.data);
                        } else if (chunk.tool === 'what_if_scenario' && onWhatIfScenario) {
                            onWhatIfScenario(chunk.data);
                        }
                    } else if (chunk.type === 'error') {
                        fullContent += `\n\n⚠️ **Neural Scan Error:** ${chunk.content}`;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = {
                                ...newMsgs[newMsgs.length - 1],
                                content: fullContent
                            };
                            return newMsgs;
                        });
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
                // Determine if this is an affirmation of a previously suggested pattern
                // We exclude 'show' and 'please' because they are often part of direct commands
                const isAffirmation = /^(yes|sure|ok|okay|do it|yeah|yep|go ahead|y|affirmative)$|^(yes|sure|ok|okay|yeah),?\s.+/i.test(userMessage);
                
                let patternQuery = userMessage;
                
                // If it's an affirmation and we have context, combine them
                if (isAffirmation && messages.length > 0) {
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg.role === 'assistant') {
                        // Priority: If the user explicitly mentions a pattern in their message, 
                        // even with an affirmation like 'Yes, show me the bear flag', 
                        // the recognizer should handle it correctly.
                        // We combine for context but we'll ensure the recognizer is robust.
                        patternQuery = `${lastMsg.content} ${userMessage}`;
                    }
                }

                const patResponse = await fetch(`${API_URL}/api/v1/pattern/recognize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: patternQuery,
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

            await streamEliteMessage({
                message: userMessage,
                conversationId: chatConversationId,
                ticker: symbol,
                interval: interval,
                recentHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
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
                    } else if (chunk.type === 'tool_result') {
                        // Handle Elite Charts tool results
                        if (chunk.tool === 'visualize_pattern') {
                            if (onPatternGenerated) {
                                onPatternGenerated(chunk.data);
                            }
                            // Prepend a visual sync marker
                            const patternName = (chunk.data?.pattern_name || 'pattern').replace(/_/g, ' ').toUpperCase();
                            const syncMsg = `[PATTERN_SYNC] **${patternName}** visualized on chart.\n\n`;
                            if (!fullContent.includes('[PATTERN_SYNC]')) {
                                fullContent = syncMsg + fullContent;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    if (newMsgs.length > 0) {
                                        newMsgs[newMsgs.length - 1] = {
                                            ...newMsgs[newMsgs.length - 1],
                                            content: fullContent,
                                            pattern: chunk.data
                                        };
                                    }
                                    return newMsgs;
                                });
                            }
                        } else if (chunk.tool === 'highlight_levels') {
                            if (onHighlightLevels) {
                                onHighlightLevels(chunk.data);
                            }
                        } else if (chunk.tool === 'market_scan') {
                            // Store scan results in the message for rendering
                            setMessages(prev => {
                                const newMsgs = [...prev];
                                if (newMsgs.length > 0) {
                                    newMsgs[newMsgs.length - 1] = {
                                        ...newMsgs[newMsgs.length - 1],
                                        scanResults: chunk.data
                                    };
                                }
                                return newMsgs;
                            });
                        } else if (chunk.tool === 'correlation_overlay') {
                            if (onCorrelationOverlay) {
                                onCorrelationOverlay(chunk.data);
                            }
                        } else if (chunk.tool === 'what_if_scenario') {
                            if (onWhatIfScenario) {
                                onWhatIfScenario(chunk.data);
                            }
                        }
                    } else if (chunk.type === 'error') {
                        fullContent += `\n\n⚠️ **Neural Link Error:** ${chunk.content}`;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            newMsgs[newMsgs.length - 1] = {
                                ...newMsgs[newMsgs.length - 1],
                                content: fullContent
                            };
                            return newMsgs;
                        });
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

    const handleDetectLivePatterns = async () => {
        if (!isAuthenticated) { onUnauthorized?.(); return; }
        if (!getTechnicalContext || isLoading) return;
        setIsActionMenuOpen(false);

        const context = getTechnicalContext();
        if (!context || !context.recentHistory || context.recentHistory.length < 30) {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Not enough chart data loaded. Wait for candles to populate.', isSystem: true }]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: `🔬 [PATTERN_DETECT] Scanning ${context.symbol} for live chart patterns...`, isIntelRequest: true }]);
        setIsLoading(true);
        setLoadingStatus('Scanning price structure...');

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            if (API_URL === 'your_key_here' || !API_URL.startsWith('http')) API_URL = 'http://localhost:8000';

            // Use closeSeries for a wider window, fallback to recentHistory
            const closes = context.closeSeries || context.recentHistory.map(d => d.c);
            const highs = context.closeSeries ? [] : context.recentHistory.map(d => d.h);
            const lows = context.closeSeries ? [] : context.recentHistory.map(d => d.l);
            const times = context.recentHistory.map(d => d.t);

            // For live detection we want OHLC from the full chart data
            // The component passes recentHistory (30 candles) - we need to call the API with all available data
            const response = await fetch(`${API_URL}/api/v1/pattern/detect-live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    closes: context.recentHistory.map(d => d.c),
                    highs: context.recentHistory.map(d => d.h),
                    lows: context.recentHistory.map(d => d.l),
                    times: context.recentHistory.map(d => d.t),
                    lookback: 100
                })
            });

            const data = await response.json();

            if (data.success && data.patterns && data.patterns.length > 0) {
                const patternList = data.patterns.map(p => `**${p.pattern.replace(/_/g, ' ').toUpperCase()}** (${p.direction}, ${p.confidence}% confidence)`).join('\n- ');
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `### 🔬 Live Pattern Detection\n\nI found **${data.patterns.length}** pattern(s) on your ${context.symbol} chart:\n\n- ${patternList}\n\nThese patterns are highlighted on your chart now.`,
                    isIntelResponse: true,
                    symbol: context.symbol
                }]);

                // Send detected patterns to chart for rendering
                if (onLivePatternDetected) {
                    onLivePatternDetected(data.patterns);
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `### 🔬 Live Pattern Detection\n\nNo clear structural patterns (double tops, triangles, flags, etc.) detected on the current ${context.symbol} ${context.interval} chart in the visible range. The price action may be in a transitional phase.\n\nTry switching to a higher timeframe for broader pattern visibility.`,
                    isIntelResponse: true,
                    symbol: context.symbol
                }]);
            }
        } catch (error) {
            console.error('Live pattern detection error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Pattern detection scan failed.', isSystem: true }]);
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const quickPatterns = [
        { name: 'Deep Scan Chart', icon: <Cpu className="w-3.5 h-3.5" />, action: handleAnalyzeChart },
        { name: 'Detect Patterns', icon: <Microscope className="w-3.5 h-3.5" />, action: handleDetectLivePatterns },
        { name: 'Bias Verdict', icon: <Target className="w-3.5 h-3.5" /> },
        { name: 'Strategy Guide', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className={`flex flex-col h-full min-h-0 overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f111a]' : 'bg-slate-50'}`}>
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 min-h-0 custom-scrollbar"
            >
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${message.role === 'user'
                                ? 'bg-gradient-to-br from-violet-600 to-violet-600 text-white'
                                : (theme === 'dark' ? 'bg-[#1e2030] border border-white/5' : 'bg-white border border-slate-200 shadow-xl')
                                }`}>
                                {message.role === 'user' ? <User size={18} /> : <img src="/logo.png" alt="Nunno AI" className="w-6 h-6 object-contain" />}
                            </div>

                            <div
                                className={`max-w-[88%] min-w-0 flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div
                                    className={`px-4 py-3 md:px-5 md:py-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border backdrop-blur-md transition-all ${message.role === 'user'
                                        ? 'bg-violet-600/90 text-white border-violet-500 rounded-tr-sm'
                                        : message.isIntelResponse
                                            ? (theme === 'dark' ? 'bg-violet-500/5 border-violet-500/20 text-slate-100 rounded-tl-sm w-full' : 'bg-indigo-50 border-indigo-100 text-slate-800 rounded-tl-sm w-full')
                                            : message.isSystem
                                                ? (theme === 'dark' ? 'bg-slate-900/50 border-slate-700/50 text-slate-400 italic text-[11px] font-mono' : 'bg-slate-100 border-slate-200 text-slate-500 italic text-[11px] font-mono')
                                                : (theme === 'dark' ? 'bg-[#1e2030] border-slate-700/50 text-slate-100 rounded-tl-sm' : 'bg-white border-slate-200 text-slate-800 rounded-tl-sm shadow-xl')
                                        }`}
                                >
                                    {message.isIntelResponse && (
                                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-violet-500/10">
                                            <div className="p-1.5 rounded-lg bg-violet-500/10">
                                                <Activity size={14} className="text-violet-400" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Intelligence Feed // {message.symbol}</span>
                                        </div>
                                    )}

                                    <div className={`text-[13px] whitespace-pre-line leading-[1.6] ${message.isSystem ? 'opacity-80' : 'font-medium'}`}>
                                        {(() => {
                                            const contentLines = message.content.split('\n');
                                            const rendered = [];
                                            let li = 0;
                                            while (li < contentLines.length) {
                                                const cLine = contentLines[li];
                                                const cTrimmed = cLine.trim();

                                                // ── Table detection ──
                                                if (cTrimmed.startsWith('|')) {
                                                    const tblLines = [];
                                                    while (li < contentLines.length && contentLines[li].trim().startsWith('|')) {
                                                        tblLines.push(contentLines[li]);
                                                        li++;
                                                    }
                                                    if (tblLines.length >= 2) {
                                                        const parseCells = (row) => row.trim().split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
                                                        const isSep = (l) => /^\|[\s\-:|]+\|$/.test(l.trim());
                                                        let sepIdx = tblLines.findIndex(isSep);
                                                        let hdCells = [];
                                                        let bdRows = [];
                                                        if (sepIdx >= 0) {
                                                            if (sepIdx > 0) hdCells = parseCells(tblLines[sepIdx - 1]);
                                                            bdRows = tblLines.slice(sepIdx + 1).filter(l => !isSep(l)).map(parseCells);
                                                        } else {
                                                            hdCells = parseCells(tblLines[0]);
                                                            bdRows = tblLines.slice(1).map(parseCells);
                                                        }
                                                        const fmtCell = (t) => {
                                                            const ps = t.split('**');
                                                            if (ps.length <= 1) return t;
                                                            return ps.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-violet-400 font-black">{p}</strong> : p);
                                                        };
                                                        rendered.push(
                                                            <div key={`tbl-${li}`} className="my-4 w-full max-w-full overflow-x-auto rounded-2xl border border-violet-500/20 bg-white/[0.02] dark:bg-white/[0.015] shadow-lg shadow-violet-500/5 backdrop-blur-sm">
                                                                <table className="w-full min-w-max text-[12px] border-collapse">
                                                                    {hdCells.length > 0 && (
                                                                        <thead>
                                                                            <tr className={`border-b ${theme === 'dark' ? 'border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent' : 'border-violet-200 bg-violet-50'}`}>
                                                                                {hdCells.map((c, ci) => (
                                                                                    <th key={ci} className={`px-4 py-3 text-left font-black uppercase tracking-widest text-[10px] whitespace-nowrap ${theme === 'dark' ? 'text-violet-300' : 'text-violet-600'}`}>
                                                                                        {fmtCell(c)}
                                                                                    </th>
                                                                                ))}
                                                                            </tr>
                                                                        </thead>
                                                                    )}
                                                                    <tbody>
                                                                        {bdRows.map((row, ri) => (
                                                                            <tr key={ri} className={`border-b transition-colors duration-200 ${theme === 'dark' ? 'border-white/5 hover:bg-violet-500/[0.06]' : 'border-slate-100 hover:bg-violet-50/50'} ${ri % 2 === 0 ? (theme === 'dark' ? 'bg-white/[0.01]' : 'bg-slate-50/50') : 'bg-transparent'}`}>
                                                                                {row.map((cell, ci) => (
                                                                                    <td key={ci} className={`px-4 py-2.5 whitespace-nowrap ${ci === 0 ? (theme === 'dark' ? 'font-semibold text-slate-300' : 'font-semibold text-slate-700') : (theme === 'dark' ? 'text-slate-200 font-mono tabular-nums' : 'text-slate-600 font-mono tabular-nums')}`}>
                                                                                        {fmtCell(cell)}
                                                                                    </td>
                                                                                ))}
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        );
                                                    } else {
                                                        tblLines.forEach((tl, ti) => {
                                                            rendered.push(<span key={`s-${li}-${ti}`}>{tl}{'\n'}</span>);
                                                        });
                                                    }
                                                    continue;
                                                }

                                                // ### Heading
                                                const headingMatch = cLine.match(/^###\s*(.+)/);
                                                if (headingMatch) {
                                                    rendered.push(
                                                        <h3 key={li} className={`text-[14px] font-black uppercase tracking-widest mt-5 mb-2 pb-1.5 border-b ${theme === 'dark' ? 'text-violet-400 border-violet-500/20' : 'text-violet-600 border-violet-200'}`}>
                                                            {headingMatch[1]}
                                                        </h3>
                                                    );
                                                    li++;
                                                    continue;
                                                }
                                                // Bullet list
                                                if (cLine.match(/^\s*[-•]\s/)) {
                                                    const bContent = cLine.replace(/^\s*[-•]\s/, '');
                                                    rendered.push(
                                                        <div key={li} className="flex gap-2 items-start pl-2 my-0.5">
                                                            <span className="text-violet-500 mt-1 text-[8px]">●</span>
                                                            <span>{bContent.split('**').map((p, j) => j % 2 === 1 ? <strong key={j} className="text-violet-400 font-black">{p}</strong> : p)}</span>
                                                        </div>
                                                    );
                                                    li++;
                                                    continue;
                                                }
                                                // Regular text with **bold** support
                                                rendered.push(
                                                    <span key={li}>
                                                        {cLine.split('**').map((part, pi) =>
                                                            pi % 2 === 1 ? <strong key={pi} className="text-violet-400 font-black">{part}</strong> : part
                                                        )}
                                                        {'\n'}
                                                    </span>
                                                );
                                                li++;
                                            }

                                            // ── Discovery Cards for Market Scan ──
                                            if (message.scanResults && message.scanResults.length > 0) {
                                                rendered.push(
                                                    <div key={`scan-${index}`} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {message.scanResults.map((res, ri) => (
                                                            <div 
                                                                key={ri}
                                                                className={`p-3 rounded-2xl border transition-all hover:scale-[1.02] cursor-default ${
                                                                    theme === 'dark' 
                                                                    ? 'bg-white/[0.03] border-white/10 hover:border-violet-500/30' 
                                                                    : 'bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-sm'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div>
                                                                        <h4 className={`text-[14px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                                                            {res.ticker.replace('USDT', '')}
                                                                            <span className="text-[10px] font-normal opacity-50 ml-1">/ USDT</span>
                                                                        </h4>
                                                                        <p className="text-[11px] font-mono text-violet-400">${res.price?.toLocaleString()}</p>
                                                                    </div>
                                                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                        res.rsi < 35 ? 'bg-green-500/10 text-green-400' : 'bg-violet-500/10 text-violet-400'
                                                                    }`}>
                                                                        {res.rsi ? `RSI: ${res.rsi}` : 'PATTERN'}
                                                                    </div>
                                                                </div>
                                                                <p className={`text-[11px] mb-3 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                                                                    {res.reason}
                                                                </p>
                                                                <button
                                                                    onClick={() => onSymbolChange && onSymbolChange(res.ticker)}
                                                                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    <Search size={12} />
                                                                    Investigate
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            return rendered;
                                        })()}
                                        {message.content === '' && isLoading && <div className="flex gap-1 items-center opacity-40"><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} /><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} /><div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} /></div>}
                                    </div>


                                    {message.pattern && (
                                        <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-4 text-[10px] ${message.role === 'user' ? 'border-white/10' : (theme === 'dark' ? 'border-slate-800' : 'border-slate-100')}`}>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-lg font-black uppercase tracking-widest transition-all ${message.pattern.direction === 'bullish' ? (theme === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700') :
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
                                        <button className="text-[10px] uppercase font-black tracking-widest hover:text-violet-500 transition-colors">Copy Intel</button>
                                        <button className="text-[10px] uppercase font-black tracking-widest hover:text-violet-500 transition-colors">Explain Pattern</button>
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
                        className="flex justify-start gap-4 items-center mb-6 pl-2"
                    >
                        <div className="flex items-center gap-4 bg-transparent border-none shadow-none outline-none">
                            <ThinkingLoader />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-violet-400/60 uppercase tracking-[0.2em] animate-pulse italic">Thinking Engine</span>
                                <span className="text-[9px] text-slate-500/60 font-bold uppercase tracking-widest truncate max-w-[200px]">{loadingStatus}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Premium Action Menu Area */}
            <div className={`p-4 md:p-6 border-t space-y-3 md:space-y-4 transition-colors ${theme === 'dark' ? 'bg-[#0f111a] border-white/5' : 'bg-white border-slate-200'}`}>
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
                                        ? 'bg-[#1e2030] border-slate-700/50 text-slate-300 hover:border-violet-500 hover:text-white shadow-xl'
                                        : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:bg-white shadow-md'
                                        }`}
                                >
                                    {pattern.icon}
                                    {pattern.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative" ref={actionMenuRef}>
                        <button
                            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                            disabled={isLoading}
                            className={`p-2.5 md:p-3.5 rounded-2xl transition-all shadow-2xl border flex items-center justify-center active:scale-90 ${isActionMenuOpen
                                ? 'bg-violet-600 border-violet-500 text-white'
                                : (theme === 'dark' ? 'bg-[#1e2030] border-white/5 text-slate-400 hover:text-violet-400' : 'bg-white border-slate-200 text-slate-500 hover:text-violet-600 shadow-xl')
                                }`}
                        >
                            <Plus size={isActionMenuOpen ? 22 : 20} className={`transition-transform duration-500 ${isActionMenuOpen ? 'rotate-90 scale-110' : ''}`} />
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
                                            { label: 'Detect Live Patterns', desc: 'Find patterns on chart', icon: <Microscope size={18} />, color: 'purple', action: handleDetectLivePatterns },
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
                            className={`w-full px-4 md:px-6 py-3 md:py-4 border rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all text-[13px] md:text-sm disabled:opacity-50 resize-none font-medium custom-scrollbar ${theme === 'dark'
                                ? 'bg-[#1e2030] border-white/5 text-slate-100 placeholder:text-slate-600'
                                : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 shadow-inner'
                                }`}
                        />
                        <div className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isLoading ? (
                                <button
                                    onClick={handleStop}
                                    className="p-2 md:p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg group"
                                    title="Stop Agent"
                                >
                                    <Square size={14} className="fill-current" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className="p-2 md:p-2.5 bg-gradient-to-tr from-violet-600 to-violet-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-0 disabled:scale-90 flex-shrink-0"
                                >
                                    <Send size={16} />
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
