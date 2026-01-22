import { useState, useRef, useEffect, memo } from 'react'
import { Send, Loader, Sparkles, TrendingUp, DollarSign, BookOpen, Square } from 'lucide-react'
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
    const { user } = useAuth()
    const {
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        loadingStatus,
        setLoadingStatus,
        showSuggestions,
        setShowSuggestions
    } = useChat()

    const userName = user?.name || 'User'
    const [input, setInput] = useState('')
    const messagesContainerRef = useRef(null)
    const abortController = useRef(null)

    const suggestions = [
        { icon: <TrendingUp size={16} />, text: "Analyze Bitcoin price" },
        { icon: <DollarSign size={16} />, text: "Explain tokenomics" },
        { icon: <BookOpen size={16} />, text: "What is RSI?" },
        { icon: <Sparkles size={16} />, text: "Build me a portfolio" }
    ]

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, loadingStatus])

    const handleStop = () => {
        if (abortController.current) {
            abortController.current.abort()
            abortController.current = null
        }
        setIsLoading(false)
        setLoadingStatus('Stopped manually.')
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = input.trim()
        setInput('')
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

            // Pass history excluding the placeholder we just added
            // Since setState is async/batched, 'messages' here might not have the placeholder yet.
            const historyForApi = [...messages, userMsgObj];

            await streamMessage(userMessage, userName, userAge, historyForApi, (chunk) => {
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
            }, abortController.current.signal);

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
        }
    }

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion)
        setShowSuggestions(false)
    }

    return (
        <div className="chat-interface">
            <div className="messages-container" ref={messagesContainerRef}>
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
