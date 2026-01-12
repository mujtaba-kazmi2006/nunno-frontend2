import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Sparkles, TrendingUp, DollarSign, BookOpen, Square } from 'lucide-react'
import { sendMessage } from '../services/api'
import EducationalCard from './EducationalCard'
import TermDefinition from './TermDefinition'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'

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
    // Input remains local
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
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setIsLoading(true)

        // Create placeholder for AI response
        if (abortController.current) abortController.current.abort()
        abortController.current = new AbortController()

        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            toolCalls: [],
            dataUsed: {}
        }])

        try {
            // Import streaming function dynamically or assume updated import
            const { streamMessage } = await import('../services/api');

            let fullContent = '';
            let currentToolCalls = [];
            let currentDataUsed = {};

            await streamMessage(userMessage, userName, userAge, messages, (chunk) => {
                if (chunk.type === 'text') {
                    setLoadingStatus(''); // Clear status when text starts
                    fullContent += chunk.content;

                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        lastMsg.content = fullContent;
                        // Preserve existing data
                        lastMsg.toolCalls = lastMsg.toolCalls || currentToolCalls;
                        lastMsg.dataUsed = lastMsg.dataUsed || currentDataUsed;
                        return newMessages;
                    });
                }
                else if (chunk.type === 'status') {
                    setLoadingStatus(chunk.content);
                }
                else if (chunk.type === 'data') {
                    currentToolCalls = chunk.tool_calls;
                    currentDataUsed = chunk.data_used;

                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        lastMsg.toolCalls = currentToolCalls;
                        lastMsg.dataUsed = currentDataUsed;
                        return newMessages;
                    });
                }
                else if (chunk.type === 'error') {
                    fullContent += `\n\n⚠️ Error: ${chunk.content}`;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].content = fullContent;
                    });
                }
            }, abortController.current.signal);

        } catch (error) {
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                lastMsg.content = lastMsg.content + `\n\n😅 Connection error: ${error.message}`;
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
                    <div key={index} className={`message ${message.role}`}>
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
                                    {formatMessage(message.content)}
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

function formatMessage(content) {
    if (!content) return null
    // Simple markdown-like formatting
    const lines = content.split('\n')

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
