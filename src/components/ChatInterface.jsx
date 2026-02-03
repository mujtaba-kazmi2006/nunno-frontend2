import { useState, useRef, useEffect, memo } from 'react'
import { Send, Loader, Sparkles, TrendingUp, DollarSign, BookOpen, Square, Zap, Plus, PieChart, Info } from 'lucide-react'
import EducationalCard from './EducationalCard'
import WelcomeAnimation from './WelcomeAnimation'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

// Extracted utility outside component to avoid recreation
function formatMessageContent(content) {
    // Simple markdown-like formatting
    const safeContent = content || '';
    const lines = safeContent.split('\n')

    return lines.map((line, i) => {
        // Headers
        if (line.startsWith('## ')) {
            return <h3 key={i} className="message-heading">{line.substring(3)}</h3>
        }
        if (line.startsWith('# ')) {
            return <h2 key={i} className="message-heading">{line.substring(2)}</h2>
        }

        // Bold text
        const boldFormatted = line.split('**').map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )

        // Bullet points
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
            return <li key={i} className="message-list-item">{boldFormatted}</li>
        }

        // Regular paragraph
        if (line.trim()) {
            return <p key={i}>{boldFormatted}</p>
        }

        return <br key={i} />
    })
}

// Memoized Message Component to prevent re-renders of history
const MessageItem = memo(({ message }) => {
    return (
        <div className={`message ${message.role}`}>
            <div className="message-avatar">
                {message.role === 'assistant' ? (
                    <img src="/logo.png" alt="Nunno" className="avatar-image breathing" />
                ) : (
                    '👤'
                )}
            </div>
            <div className="message-content">
                {/* Render Educational Cards if data exists */}
                {message.dataUsed?.technical && (
                    <EducationalCard data={message.dataUsed.technical} />
                )}

                {/* Determine if we should show message text */}
                {(message.content || (!message.dataUsed?.technical)) && (
                    <div className="message-text">
                        {formatMessageContent(message.content)}
                    </div>
                )}

                {message.toolCalls && message.toolCalls.length > 0 && (
                    <div className="tool-calls">
                        <Sparkles size={14} />
                        <span>Used tools: {message.toolCalls.join(', ')}</span>
                    </div>
                )}
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Custom comparison function for performance
    // Only re-render if content, toolCalls, or dataUsed have changed
    return (
        prevProps.message.content === nextProps.message.content &&
        prevProps.message.dataUsed === nextProps.message.dataUsed &&
        prevProps.message.toolCalls === nextProps.message.toolCalls
    );
});

export default function ChatInterface({ userAge }) {
    const { user, refreshUser } = useAuth()
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

    const userName = user?.name || 'User'
    const [input, setInput] = useState('')
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)
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

    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        // If we are within 100px of the bottom, consider us "at bottom"
        isAtBottom.current = scrollHeight - scrollTop - clientHeight < 100;
    };

    const scrollToBottom = (force = false) => {
        if (messagesContainerRef.current && (isAtBottom.current || force)) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: force ? 'smooth' : 'auto'
            })
        }
    }

    useEffect(() => {
        scrollToBottom(false)
    }, [messages, loadingStatus])

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
            abortController.current.abort()
            abortController.current = null
        }
        setIsLoading(false)
        setLoadingStatus('Stopped manually.')
    }

    // React to pending messages from context
    useEffect(() => {
        if (pendingMessage && !isLoading) {
            handleSend(pendingMessage);
            setPendingMessage(null);
        }
    }, [pendingMessage, isLoading]);

    const handleSend = async (messageOverride = null) => {
        // Ensure messageOverride is a string, not an event object
        const overrideText = typeof messageOverride === 'string' ? messageOverride : null;
        const messageToSend = (overrideText || input).trim()
        if (!messageToSend || isLoading) return

        const userMessage = messageToSend
        if (!overrideText) setInput('')
        setShowSuggestions(false)
        setLoadingStatus('Thinking...')

        // Add user message
        const userMsgObj = { role: 'user', content: userMessage };
        setMessages(prev => [...prev, userMsgObj])
        setIsLoading(true)

        // Create placeholder for AI response
        if (abortController.current) abortController.current.abort()
        abortController.current = new AbortController()

        const assistantPlaceholder = {
            role: 'assistant',
            content: '',
            toolCalls: [],
            dataUsed: {}
        };

        setMessages(prev => [...prev, assistantPlaceholder])

        try {
            // Import streaming function dynamically
            const { streamMessage } = await import('../services/api');

            let fullContent = '';
            let currentToolCalls = [];
            let currentDataUsed = {};
            let lastUpdateTime = 0;

            // The backend now looks up history by conversationId, so we don't need to pass history locally
            await streamMessage({
                message: userMessage,
                conversationId: currentConversationId,
                userAge,
                onChunk: (chunk) => {
                    if (chunk.type === 'text') {
                        setLoadingStatus(''); // Clear status when text starts
                        fullContent += chunk.content;

                        // Throttle updates to ~30fps (33ms) for smoother streaming
                        const now = Date.now();
                        if (now - lastUpdateTime > 33) {
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

                        // Always update on data/tool usage (these are rare/one-off events)
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
                        fullContent += `\n\n⚠️ Error: ${chunk.content}`;
                        // Always update on error
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
                signal: abortController.current?.signal // Use optional chaining for safety
            });

            // Ensure final update with complete content is rendered
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsgIndex = newMessages.length - 1;
                const lastMsg = newMessages[lastMsgIndex];

                // Only update if not already up to date
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
                    content: (newMessages[lastMsgIndex].content || '') + `\n\n😅 Connection error: ${error.message}`
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
        if (isLoading) return

        setShowSuggestions(false)
        setLoadingStatus('Feeding Nunno...')

        // Add a system message indicating Feed Nunno was triggered
        const systemMessage = {
            role: 'user',
            content: '🔥 Feed Nunno - Market Briefing Request'
        };
        setMessages(prev => [...prev, systemMessage])
        setIsLoading(true)

        // Create placeholder for AI response
        if (abortController.current) abortController.current.abort()
        abortController.current = new AbortController()

        const assistantPlaceholder = {
            role: 'assistant',
            content: '',
            toolCalls: [],
            dataUsed: {}
        };

        setMessages(prev => [...prev, assistantPlaceholder])

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const token = localStorage.getItem('token')
            const response = await fetch(`${API_URL}/api/v1/analyze/feed-nunno`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    symbol: 'BTCUSDT',
                    timeframe: '15m',
                    conversation_id: currentConversationId
                }),
                signal: abortController.current.signal
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

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

                            if (parsed.type === 'status') {
                                setLoadingStatus(parsed.message)
                            } else if (parsed.type === 'done') {
                                setLoadingStatus('')
                            } else if (parsed.type === 'text') {
                                // This is the actual AI response text
                                fullContent += parsed.content

                                // Throttle updates for smooth streaming
                                const now = Date.now()
                                if (now - lastUpdateTime > 33) {
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
                            // If JSON parsing fails, it might be plain text
                            console.log('Parse error for line:', data, e)
                        }
                    }
                }
            }

            // Final update
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
            if (error.name === 'AbortError') {
                console.log('Feed Nunno request aborted')
            } else {
                setMessages(prev => {
                    const newMessages = [...prev]
                    const lastMsgIndex = newMessages.length - 1
                    newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        content: `⚠️ Error generating market briefing: ${error.message}`
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
        setInput(suggestion)
        setShowSuggestions(false)
    }

    return (
        <div className="chat-interface">
            <div
                className="messages-container"
                ref={messagesContainerRef}
                onScroll={handleScroll}
            >
                {messages.map((message, index) => (
                    <MessageItem key={index} message={message} />
                ))}

                {isLoading && loadingStatus && (
                    <div className="message assistant loading">
                        <div className="message-avatar">
                            <img src="/logo.png" alt="Nunno" className="avatar-image pulse breathing" />
                        </div>
                        <div className="message-content">
                            <div className="loading-indicator">
                                <Loader className="spinner" size={16} />
                                <span>{loadingStatus}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showSuggestions && messages.length === 1 && (
                <div className="suggestions">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            className="suggestion-chip"
                            onClick={() => handleSuggestionClick(suggestion.text)}
                        >
                            {suggestion.icon}
                            <span>{suggestion.text}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="input-container">
                {/* Action Menu (Replaces prominent Feed Nunno button) */}
                <div className="action-menu-container" ref={actionMenuRef}>
                    <button
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        disabled={isLoading}
                        className={`action-toggle-button ${isActionMenuOpen ? 'active' : ''}`}
                        title="More actions"
                    >
                        <Plus size={20} className={isActionMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
                    </button>

                    {isActionMenuOpen && (
                        <div className="action-dropdown-menu">
                            <button
                                onClick={() => {
                                    handleFeedNunno();
                                    setIsActionMenuOpen(false);
                                }}
                                className="action-menu-item"
                            >
                                <Zap size={16} className="text-amber-500" />
                                <span>Feed Nunno Briefing</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleSuggestionClick("Show me my portfolio breakdown");
                                    setIsActionMenuOpen(false);
                                }}
                                className="action-menu-item"
                            >
                                <PieChart size={16} className="text-purple-500" />
                                <span>Portfolio Analysis</span>
                            </button>
                            <div className="action-menu-divider"></div>
                            <button
                                onClick={() => {
                                    handleSuggestionClick("How can Nunno help me?");
                                    setIsActionMenuOpen(false);
                                }}
                                className="action-menu-item"
                            >
                                <Info size={16} className="text-slate-400" />
                                <span>Learn More</span>
                            </button>
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about finance..."
                    disabled={isLoading}
                />

                {isLoading ? (
                    <button
                        onClick={handleStop}
                        className="send-button stop-button bg-red-500 hover:bg-red-600"
                        title="Stop generating"
                    >
                        <Square size={20} fill="currentColor" />
                    </button>
                ) : (
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="send-button"
                    >
                        <Send size={20} />
                    </button>
                )}
            </div>
        </div>
    )
}
