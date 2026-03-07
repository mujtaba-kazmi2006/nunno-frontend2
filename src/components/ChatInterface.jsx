import { useState, useRef, useEffect, useCallback, memo, forwardRef } from 'react'
import { Send, Loader, Sparkles, TrendingUp, TrendingDown, Search, ExternalLink, Activity, DollarSign, BookOpen, Square, Zap, Plus, PieChart, Info, Bot, User as UserIcon, Flame, AlertOctagon, Globe, ShieldAlert, Newspaper, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import EducationalCard from './EducationalCard'
import NunnoLogo from './NunnoLogo'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useChat } from '../contexts/ChatContext'
import { cn } from '../utils/cn'

import ThinkingLoader from './ThinkingLoader'
import { analytics } from '../utils/analytics'
import LoginSignup from './LoginSignup'
import {
    WebSearchCard,
    TokenomicsCard,
    OnChainCard,
    RoastCard,
    FOMOCard,
    NewsSentimentCard,
    MarketOverviewCard
} from './chat/ToolCards'

// Helper: format inline text (bold markers)
function formatInlineText(text) {
    if (!text) return text;
    const parts = text.split('**');
    if (parts.length <= 1) return text;
    return parts.map((part, j) =>
        j % 2 === 1
            ? <strong key={j} className="font-bold text-slate-900 dark:text-slate-50">{part}</strong>
            : part
    );
}

// Helper: parse a markdown table row into cell strings
function parseTableRow(row) {
    return row.trim().split('|')
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        .map(c => c.trim());
}

// Helper: check if a line is a markdown table separator (e.g. |---|---|)
function isTableSeparator(line) {
    return /^\|[\s\-:|]+\|$/.test(line.trim());
}

// Extracted utility outside component to avoid recreation
function formatMessageContent(content) {
    const safeContent = (content || '').replace(/\[NAVIGATE:[^\]]+\]/g, '');
    const lines = safeContent.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // ── Markdown Table Detection ──
        if (trimmed.startsWith('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|')) {
                tableLines.push(lines[i]);
                i++;
            }

            if (tableLines.length >= 2) {
                let separatorIdx = -1;
                for (let j = 0; j < tableLines.length; j++) {
                    if (isTableSeparator(tableLines[j])) {
                        separatorIdx = j;
                        break;
                    }
                }

                let headerCells = [];
                let bodyRows = [];

                if (separatorIdx >= 0) {
                    if (separatorIdx > 0) {
                        headerCells = parseTableRow(tableLines[separatorIdx - 1]);
                    }
                    bodyRows = tableLines.slice(separatorIdx + 1)
                        .filter(l => !isTableSeparator(l))
                        .map(parseTableRow);
                } else {
                    headerCells = parseTableRow(tableLines[0]);
                    bodyRows = tableLines.slice(1).map(parseTableRow);
                }

                elements.push(
                    <div key={`table - ${i} `} className="my-6 w-full max-w-full overflow-x-auto rounded-2xl border border-violet-500/20 bg-white/[0.02] dark:bg-white/[0.015] shadow-lg shadow-violet-500/5">
                        <table className="w-full min-w-max text-sm border-collapse">
                            {headerCells.length > 0 && (
                                <thead>
                                    <tr className="border-b border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-violet-500/5 to-transparent sticky top-0 z-10">
                                        {headerCells.map((cell, ci) => (
                                            <th key={ci} className="px-5 py-3.5 text-left font-black text-violet-400 dark:text-violet-300 uppercase tracking-widest text-[11px] whitespace-nowrap">
                                                {formatInlineText(cell)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                            )}
                            <tbody>
                                {bodyRows.map((row, ri) => (
                                    <tr
                                        key={ri}
                                        className={cn(
                                            "border-b border-white/5 transition-colors duration-200 hover:bg-violet-500/[0.06]",
                                            ri % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                                        )}
                                    >
                                        {row.map((cell, ci) => (
                                            <td key={ci} className={cn(
                                                "px-5 py-3 whitespace-nowrap",
                                                ci === 0
                                                    ? "font-semibold text-slate-600 dark:text-slate-300"
                                                    : "text-slate-700 dark:text-slate-200 font-mono tabular-nums"
                                            )}>
                                                {formatInlineText(cell)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            } else {
                tableLines.forEach((tl, ti) => {
                    elements.push(
                        <p key={`p - ${i} -${ti} `} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 msg-fade-in">
                            {formatInlineText(tl)}
                        </p>
                    );
                });
            }
            continue;
        }

        // ── Headers ──
        if (trimmed.startsWith('### ')) {
            elements.push(<h4 key={i} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 msg-fade-in">{formatInlineText(trimmed.substring(4))}</h4>);
            i++;
            continue;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(<h3 key={i} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 msg-fade-in">{formatInlineText(trimmed.substring(3))}</h3>);
            i++;
            continue;
        }
        if (trimmed.startsWith('# ')) {
            elements.push(<h2 key={i} className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 msg-fade-in">{formatInlineText(trimmed.substring(2))}</h2>);
            i++;
            continue;
        }

        // ── Bold inline formatting ──
        const boldFormatted = formatInlineText(line);

        // ── Bullet points ──
        if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            elements.push(<li key={i} className="ml-4 list-disc text-slate-700 dark:text-slate-300 my-1 msg-fade-in">{boldFormatted}</li>);
            i++;
            continue;
        }

        // ── Regular paragraph ──
        if (trimmed) {
            elements.push(<p key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4 msg-fade-in">{boldFormatted}</p>);
            i++;
            continue;
        }

        elements.push(<div key={i} className="h-2" />);
        i++;
    }

    return elements;
}

// Redesigned Message Component - Simple Text Mode
const MessageItem = memo(forwardRef(({ message, onDeepAnalysis }, ref) => {
    const isAssistant = message.role === 'assistant';
    const timestamp = message.timestamp || new Date();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                "flex flex-col gap-3 mb-12 w-full",
                isAssistant ? "items-start" : "items-end"
            )}
        >
            <div className={cn(
                "flex items-center gap-3 mb-1 px-1",
                isAssistant ? "flex-row" : "flex-row-reverse"
            )}>
                <div className={cn(
                    "flex items-center justify-center size-7 rounded-full overflow-hidden",
                    isAssistant ? "bg-white/10" : "bg-slate-200 dark:bg-white/10 text-slate-500"
                )}>
                    {isAssistant ? (
                        <img src="/logo.png" alt="Nunno" className="size-full object-contain p-1" loading="lazy" />
                    ) : (
                        <UserIcon size={14} />
                    )}
                </div>
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] italic",
                    isAssistant ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-slate-500"
                )}>
                    {isAssistant ? "Nunno Intelligence" : "You"}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-600 font-bold">
                    {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            <div className={cn(
                "w-full px-0 group",
                isAssistant ? "text-left" : "text-right"
            )}>
                {/* ── AGENTIC TOOL ARTIFACTS ── */}
                {isAssistant && message.dataUsed && (
                    <div className="flex flex-col gap-2 mb-4 w-full max-w-2xl">
                        {/* Web Research Results */}
                        {message.dataUsed.web_search && <WebSearchCard results={message.dataUsed.web_search} />}
                        {message.dataUsed.deep_research && <WebSearchCard results={message.dataUsed.deep_research} />}

                        {/* Market Intel Cards */}
                        {message.dataUsed.tokenomics && <TokenomicsCard data={message.dataUsed.tokenomics} />}
                        {message.dataUsed.onchain && <OnChainCard data={message.dataUsed.onchain} />}
                        {message.dataUsed.news_sentiment && <NewsSentimentCard data={message.dataUsed.news_sentiment} />}
                        {message.dataUsed.market_overview && <MarketOverviewCard data={message.dataUsed.market_overview} />}

                        {/* Specialized Analysis */}
                        {message.dataUsed.roast && <RoastCard data={message.dataUsed.roast} />}
                        {message.dataUsed.fomo && <FOMOCard data={message.dataUsed.fomo} />}

                        {/* Legacy Technical Analysis Card */}
                        {message.dataUsed.technical && (
                            <div className="flex flex-col gap-6 mb-4">
                                {(Array.isArray(message.dataUsed.technical)
                                    ? message.dataUsed.technical
                                    : [message.dataUsed.technical]
                                ).map((data, idx) => (
                                    <div key={idx} className="msg-fade-in" style={{ animationDelay: `${idx * 80} ms` }}>
                                        <EducationalCard data={data} onDeepAnalysis={onDeepAnalysis} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Determine if we should show message text */}
                {(message.content || (!message.dataUsed || Object.keys(message.dataUsed).length === 0)) && (
                    <div className={cn(
                        "relative inline-block",
                        isAssistant ? "w-full max-w-full sm:max-w-3xl" : "w-fit max-w-[85%]"
                    )}>
                        <div className={cn(
                            "relative z-10 text-lg leading-relaxed px-6 py-4 rounded-3xl",
                            isAssistant
                                ? "bg-white/5 dark:bg-white/[0.03] border border-white/10 dark:text-slate-200 shadow-xl shadow-black/5"
                                : "bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-medium shadow-2xl shadow-violet-500/20"
                        )}>
                            {isAssistant ? formatMessageContent(message.content) : message.content}
                        </div>

                        {!isAssistant && (
                            <div className="absolute inset-0 bg-violet-500/10 rounded-full scale-75 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        )}

                        {isAssistant && message.content && (
                            <div className="absolute -left-2 top-4 w-1 h-8 bg-violet-500/50 rounded-full" />
                        )}
                    </div>
                )}

                {isAssistant && message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="mt-6 flex items-center gap-3 text-[10px] text-violet-400 dark:text-violet-500/60 font-black uppercase tracking-[.25em] italic opacity-80 pl-2">
                        <div className="size-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span>Neural Execution Node: {message.toolCalls.join(' + ')}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}), (prevProps, nextProps) => {
    return (
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.dataUsed === nextProps.message.dataUsed &&
        prevProps.message.toolCalls === nextProps.message.toolCalls
    );
});

export default function ChatInterface({ userAge }) {
    const { user, isAuthenticated, refreshUser } = useAuth()
    const { theme } = useTheme()
    const [showLoginModal, setShowLoginModal] = useState(false)
    const {
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        loadingStatus,
        setLoadingStatus,
        showSuggestions,
        setShowSuggestions,
        currentConversationId,
        pendingMessage,
        setPendingMessage
    } = useChat()

    const [input, setInput] = useState('')
    const [webSearchEnabled, setWebSearchEnabled] = useState(false)
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
    const [showScrollDown, setShowScrollDown] = useState(false)
    const messagesContainerRef = useRef(null)
    const actionMenuRef = useRef(null)
    const abortController = useRef(null)
    const isAtBottom = useRef(true)

    const suggestions = [
        { icon: <TrendingUp size={16} />, text: "Analyze Bitcoin price" },
        { icon: <DollarSign size={16} />, text: "Explain tokenomics" },
        { icon: <BookOpen size={16} />, text: "What is RSI?" },
        { icon: <Sparkles size={16} />, text: "Build me a portfolio" }
    ]

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        isAtBottom.current = atBottom;
        // Show the "scroll to bottom" indicator when user scrolls up during loading
        setShowScrollDown(!atBottom && isLoading);
    }, [isLoading]);

    const scrollToBottom = useCallback((force = false) => {
        if (messagesContainerRef.current && (isAtBottom.current || force)) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: force ? 'smooth' : 'auto'
            })
        }
    }, []);

    useEffect(() => {
        scrollToBottom(false)
    }, [messages, loadingStatus, scrollToBottom])

    // Hide scroll-down indicator when loading stops
    useEffect(() => {
        if (!isLoading) setShowScrollDown(false);
    }, [isLoading])

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
            abortController.current.abort()
            abortController.current = null
        }
        setIsLoading(false)
        setLoadingStatus('Stopped manually.')
    }

    const handleDeepAnalysis = (ticker) => {
        if (!ticker) return;
        handleSend(`Provide a Deep Lab Breakdown for ${ticker}.Focus on high - level technical intent and structural sentiment.`);
    }

    useEffect(() => {
        if (pendingMessage && !isLoading) {
            handleSend(pendingMessage);
            setPendingMessage(null);
        }
    }, [pendingMessage, isLoading]);

    const handleSend = async (messageOverride = null) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        const overrideText = typeof messageOverride === 'string' ? messageOverride : null;
        const messageToSend = (overrideText || input).trim()
        if (!messageToSend || isLoading) return

        const userMessage = messageToSend
        if (!overrideText) setInput('')
        setShowSuggestions(false)
        setLoadingStatus('Thinking...')

        // Track GA4 event
        analytics.trackAIChat(userMessage.length);

        const userMsgObj = { role: 'user', content: userMessage, timestamp: new Date() };
        setMessages(prev => [...prev, userMsgObj])
        setIsLoading(true)

        if (abortController.current) abortController.current.abort()
        abortController.current = new AbortController()

        const assistantPlaceholder = {
            role: 'assistant',
            content: '',
            toolCalls: [],
            dataUsed: {},
            timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantPlaceholder])

        try {
            const { streamMessage } = await import('../services/api');
            const { useNeuralAction } = await import('../contexts/NeuralActionContext');

            let fullContent = '';
            let currentToolCalls = [];
            let currentDataUsed = {};
            let lastUpdateTime = 0;
            let handledActions = new Set();

            // Build recent history from current session (last 10 messages = 5 pairs)
            // Note: `messages` here is the state BEFORE the new userMsgObj and assistantPlaceholder
            // were added (React batches setMessages calls), so we just skip the welcome message
            const historyMessages = messages.slice(1) // skip welcome msg
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .filter(m => m.content && m.content.trim()) // skip empty
                .slice(-10) // last 10 messages (5 pairs)
                .map(m => ({ role: m.role, content: m.content.slice(0, 800) })); // truncate for token efficiency

            await streamMessage({
                message: userMessage,
                conversationId: currentConversationId,
                userAge,
                webSearchEnabled,
                recentHistory: historyMessages,
                onChunk: (chunk) => {
                    if (chunk.type === 'text') {
                        setLoadingStatus('');
                        fullContent += chunk.content;

                        // Periodic UI update for smoother streaming
                        const now = Date.now();
                        if (now - lastUpdateTime > 120) {
                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMsgIndex = newMessages.length - 1;
                                const lastMsg = newMessages[lastMsgIndex];
                                newMessages[lastMsgIndex] = {
                                    ...lastMsg,
                                    content: fullContent,
                                    toolCalls: lastMsg.toolCalls || currentToolCalls,
                                    dataUsed: lastMsg.dataUsed || currentDataUsed
                                };
                                return newMessages;
                            });
                            lastUpdateTime = now;
                        }
                    }
                    else if (chunk.type === 'status') {
                        setLoadingStatus(chunk.content);
                    }
                    else if (chunk.type === 'data') {
                        currentToolCalls = chunk.tool_calls;
                        currentDataUsed = chunk.data_used;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMsgIndex = newMessages.length - 1;
                            const lastMsg = newMessages[lastMsgIndex];
                            newMessages[lastMsgIndex] = {
                                ...lastMsg,
                                toolCalls: currentToolCalls,
                                dataUsed: currentDataUsed
                            };
                            return newMessages;
                        });
                    }
                    else if (chunk.type === 'error') {
                        fullContent += `\n\n⚠️ Error: ${chunk.content} `;
                        setMessages(prev => {
                            const newMessages = [...prev];
                            const lastMsgIndex = newMessages.length - 1;
                            newMessages[lastMsgIndex] = {
                                ...newMessages[lastMsgIndex],
                                content: fullContent
                            };
                            return newMessages;
                        });
                    }
                },
                signal: abortController.current?.signal
            });

            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsgIndex = newMessages.length - 1;
                const lastMsg = newMessages[lastMsgIndex];
                if (lastMsg.content !== fullContent) {
                    newMessages[lastMsgIndex] = {
                        ...lastMsg,
                        content: fullContent,
                        toolCalls: lastMsg.toolCalls || currentToolCalls,
                        dataUsed: lastMsg.dataUsed || currentDataUsed
                    };
                }
                return newMessages;
            });

        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsgIndex = newMessages.length - 1;
                newMessages[lastMsgIndex] = {
                    ...newMessages[lastMsgIndex],
                    content: (newMessages[lastMsgIndex].content || '') + `\n\n😅 Connection error: ${error.message} `
                };
                return newMessages;
            });
        } finally {
            setIsLoading(false)
            setLoadingStatus('')
            refreshUser()
        }
    }

    const handleFeedNunno = async () => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        if (isLoading) return
        setShowSuggestions(false)
        setLoadingStatus('Feeding Nunno...')
        const systemMessage = {
            role: 'user',
            content: '🔥 Feed Nunno - Market Briefing Request',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage])
        setIsLoading(true)
        if (abortController.current) abortController.current.abort()
        abortController.current = new AbortController()
        const assistantPlaceholder = {
            role: 'assistant',
            content: '',
            toolCalls: [],
            dataUsed: {},
            timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantPlaceholder])
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL} /api/v1 / analyze / feed - nunno`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token} `
                },
                body: JSON.stringify({
                    symbol: 'BTCUSDT',
                    timeframe: '15m',
                    conversation_id: currentConversationId
                }),
                signal: abortController.current.signal
            })
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status} `)
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullContent = ''
            let lastUpdateTime = 0
            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim()
                        if (!data) continue
                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.type === 'status') setLoadingStatus(parsed.message)
                            else if (parsed.type === 'done') setLoadingStatus('')
                            else if (parsed.type === 'text') {
                                fullContent += parsed.content
                                const now = Date.now()
                                if (now - lastUpdateTime > 120) {
                                    setMessages(prev => {
                                        const newMessages = [...prev]
                                        const lastMsgIndex = newMessages.length - 1
                                        newMessages[lastMsgIndex] = {
                                            ...newMessages[lastMsgIndex],
                                            content: fullContent
                                        }
                                        return newMessages
                                    })
                                    lastUpdateTime = now
                                }
                            }
                        } catch (e) {
                            console.log('Parse error for line:', data, e)
                        }
                    }
                }
            }
            setMessages(prev => {
                const newMessages = [...prev]
                const lastMsgIndex = newMessages.length - 1
                if (newMessages[lastMsgIndex].content !== fullContent) {
                    newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        content: fullContent
                    }
                }
                return newMessages
            })
        } catch (error) {
            if (error.name !== 'AbortError') {
                setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMsgIndex = newMessages.length - 1
                    newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        content: `⚠️ Error generating market briefing: ${error.message} `
                    }
                    return newMessages
                })
            }
        } finally {
            setIsLoading(false)
            setLoadingStatus('')
            refreshUser()
        }
    }

    const handleSuggestionClick = (suggestion) => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        setInput(suggestion)
        setShowSuggestions(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Centered Initial State (if only first assistant message is present)
    const isInitialState = messages.length <= 1 && !isLoading;

    return (
        <div className="flex flex-col h-full overflow-hidden relative chat-interface">
            {/* Background Welcome elements - Premium Rebrand */}
            <AnimatePresence>
                {isInitialState && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute inset-x-0 top-[15%] sm:top-[12%] flex flex-col items-center gap-4 sm:gap-8 px-4 sm:px-6 z-10"
                    >
                        <div className="text-center space-y-4 sm:space-y-6 max-w-full">
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]"
                            >
                                <img src="/logo.png" alt="" className="size-3.5 object-contain" />
                                <span>Intelligence Center Active</span>
                            </motion.div>
                            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none italic uppercase max-w-[95vw] sm:max-w-full px-2 lg:mt-4">
                                FINANCE, <br className="block sm:hidden" />
                                <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent underline decoration-violet-500/30 underline-offset-4 sm:underline-offset-8">SIMPLIFIED.</span>
                            </h1>

                            <p className="hidden md:block text-slate-500 dark:text-slate-400 text-base lg:text-lg max-w-xl mx-auto font-medium leading-relaxed italic px-4 text-center">
                                Your premium AI gateway to market knowledge and simple investing.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages Area - Fades in and occupies space above input */}
            <div
                className={cn(
                    "w-full flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 space-y-12 custom-scrollbar transition-opacity duration-1000",
                    isInitialState ? "opacity-0 pointer-events-none" : "opacity-100 mt-20"
                )}
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                <div className="max-w-4xl mx-auto pt-10 pb-20">
                    <AnimatePresence mode="popLayout">
                        {messages.slice(1).map((message, index) => (
                            <MessageItem key={index} message={message} onDeepAnalysis={handleDeepAnalysis} />
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex items-center gap-4 mb-12 pl-4 py-2">
                            <ThinkingLoader />
                            <span className="thinking-status-text text-[10px] font-black text-violet-400 dark:text-violet-500/60 uppercase tracking-[0.25em] italic">
                                {loadingStatus || 'Processing...'}
                                <span className="status-cursor" />
                            </span>
                        </div>
                    )}

                </div>

                {/* Scroll-to-bottom FAB — appears when user scrolls up during streaming */}
                {showScrollDown && (
                    <button
                        onClick={() => { scrollToBottom(true); setShowScrollDown(false); }}
                        className="sticky bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-xl shadow-violet-500/30 transition-all active:scale-95 backdrop-blur-sm border border-violet-400/20"
                    >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2v8M2 6l4 4 4-4" />
                        </svg>
                        New Response
                    </button>
                )}
            </div>

            {/* Input & Glass Window Container - Performance Optimized */}
            <motion.div
                initial={false}
                animate={{
                    paddingBottom: isInitialState ? "2rem" : "2.5rem",
                    width: "100%",
                }}
                className="w-full flex flex-col items-center px-4 md:px-8 z-10"
            >
                <div
                    className={cn(
                        "relative w-full transition-[background-color,border-color,box-shadow,transform] duration-700",
                        isInitialState ? "max-w-5xl bg-white dark:bg-[#0c0c14]/30 rounded-[2rem] sm:rounded-[3rem] p-4 sm:p-6 md:p-10 lg:p-12 border border-white/10 shadow-2xl backdrop-blur-3xl" : "max-w-5xl bg-transparent"
                    )}
                >
                    {isInitialState && (
                        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-violet-500/10 via-pink-400/5 to-transparent pointer-events-none opacity-50" />
                    )}

                    {/* Centered / Bottom Input Design */}
                    <div
                        id="chat-input-container"
                        className={cn(
                            "relative bg-white dark:bg-[#0c0c14] rounded-2xl sm:rounded-[2rem] shadow-2xl border border-violet-100/50 dark:border-white/10 p-2 sm:p-4 group ring-1 ring-white/5",
                            !isInitialState && "hover:border-violet-500/30 transition-[border-color]"
                        )}
                    >
                        <div className="relative flex gap-2 sm:gap-4 items-center">
                            <div className="relative" ref={actionMenuRef}>
                                <button
                                    onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                                    disabled={isLoading}
                                    className={cn(
                                        "p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-500 shadow-lg",
                                        isActionMenuOpen
                                            ? "bg-violet-600 text-white rotate-45 scale-110 shadow-violet-500/40"
                                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-violet-600 dark:hover:text-violet-400"
                                    )}
                                >
                                    <Plus size={20} className="sm:w-[22px] sm:h-[22px]" />
                                </button>
                                {isActionMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 15 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute bottom-full mb-6 left-0 w-72 bg-white dark:bg-[#12121a] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-violet-100/50 dark:border-white/10 overflow-hidden z-50 p-2 space-y-2"
                                    >
                                        <button onClick={() => setWebSearchEnabled(!webSearchEnabled)} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all group", webSearchEnabled ? "bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/30" : "hover:bg-violet-50 dark:hover:bg-white/5")}>
                                            <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg", webSearchEnabled ? "bg-violet-600 text-white shadow-violet-500/40" : "bg-violet-500/10 text-violet-500")}>
                                                <Globe size={20} className={cn(webSearchEnabled && "animate-pulse")} />
                                            </div>
                                            <div className="flex flex-col items-start text-left">
                                                <span className={cn("italic uppercase tracking-tight", webSearchEnabled ? "text-violet-600 dark:text-violet-400" : "text-slate-700 dark:text-slate-200")}>
                                                    {webSearchEnabled ? "Research Mode: ON" : "Web Intelligence"}
                                                </span>
                                                <span className="text-[10px] text-slate-500 font-medium">Live neural web scanning</span>
                                            </div>
                                            {webSearchEnabled && <div className="ml-auto size-2 rounded-full bg-violet-500 animate-pulse" />}
                                        </button>
                                        <button onClick={() => { handleFeedNunno(); setIsActionMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-white/5 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all group">
                                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                                            <div className="flex flex-col items-start">
                                                <span className="italic uppercase tracking-tight">Market Briefing</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Instant AI data compression</span>
                                            </div>
                                        </button>
                                        <button onClick={() => { handleSuggestionClick("Show me my portfolio breakdown"); setIsActionMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-white/5 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all group">
                                            <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform"><PieChart size={20} /></div>
                                            <div className="flex flex-col items-start">
                                                <span className="italic uppercase tracking-tight">Portfolio Analysis</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Neural asset breakdown</span>
                                            </div>
                                        </button>
                                        <button onClick={() => { handleSuggestionClick("Roast this coin: BTCUSDT"); setIsActionMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-white/5 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all group">
                                            <div className="size-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
                                            <div className="flex flex-col items-start">
                                                <span className="italic uppercase tracking-tight">Roast My Coin</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Brutal reality check</span>
                                            </div>
                                        </button>
                                        <button onClick={() => { handleSuggestionClick("Check FOMO signals for BTCUSDT, ETHUSDT, SOLUSDT"); setIsActionMenuOpen(false); }} className="w-full flex items-center gap-4 p-4 hover:bg-violet-50 dark:hover:bg-white/5 rounded-2xl text-slate-700 dark:text-slate-200 text-sm font-bold transition-all group">
                                            <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><AlertOctagon size={20} /></div>
                                            <div className="flex flex-col items-start">
                                                <span className="italic uppercase tracking-tight">FOMO Killer</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Don't buy the top!</span>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}
                            </div>



                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                onFocus={() => {
                                    if (!isAuthenticated) {
                                        setShowLoginModal(true);
                                    }
                                }}
                                placeholder="Enter market query..."
                                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium text-sm sm:text-base lg:text-lg py-2 sm:py-3 outline-none italic"
                                autoFocus
                                disabled={isLoading}
                            />

                            <div className="flex items-center gap-2">
                                {isLoading ? (
                                    <button
                                        onClick={handleStop}
                                        className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl sm:rounded-2xl shadow-xl shadow-red-500/20 transition-all hover:scale-110 active:scale-95 group"
                                    >
                                        <Square size={18} fill="currentColor" className="sm:w-[20px] sm:h-[20px] group-hover:scale-90 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!input.trim()}
                                        className={cn(
                                            "h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-500",
                                            "bg-white text-black hover:bg-violet-600 hover:text-white",
                                            "shadow-xl shadow-black/5 dark:shadow-violet-500/10",
                                            "hover:scale-110 active:scale-95 disabled:hover:scale-100",
                                            "disabled:opacity-20 disabled:grayscale"
                                        )}
                                    >
                                        <Send size={20} strokeWidth={2.5} className="sm:w-[22px] sm:h-[22px]" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {isInitialState && (
                        <div className="mt-6 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-full">
                            {suggestions.map((s, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    onClick={() => handleSuggestionClick(s.text)}
                                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.08] border border-white/5 hover:border-violet-500/30 rounded-2xl sm:rounded-3xl text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all group"
                                >
                                    <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-all ring-1 ring-white/10 flex-shrink-0">
                                        {s.icon}
                                    </div>
                                    <span className="italic uppercase tracking-tight text-left">{s.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {showLoginModal && <LoginSignup onClose={() => setShowLoginModal(false)} />}
        </div >
    )
}
