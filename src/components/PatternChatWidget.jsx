import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const PatternChatWidget = ({ onPatternGenerated, currentPrice = 50000 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! Ask me to show you chart patterns like "head and shoulders", "double top", "bull flag", etc. I\'ll visualize them on the main chart!'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Call pattern recognition API
            const API_URL = API_ENDPOINTS.BASE;

            const response = await fetch(`${API_URL}/api/v1/pattern/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: userMessage,
                    base_price: currentPrice || 50000,
                    num_points: 50
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}${errorText ? ': ' + errorText : ''}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error('Expected JSON, got:', text);
                throw new Error('Server returned non-JSON response. Check if backend is running correctly.');
            }

            const data = await response.json();

            if (data.success && data.pattern) {
                // Add success message
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `✨ ${data.message}!\n\n${data.pattern.description}\n\n**Pattern Type:** ${data.pattern.pattern_type}\n**Direction:** ${data.pattern.direction}`
                }]);

                // Notify parent component to display pattern on chart
                if (onPatternGenerated) {
                    onPatternGenerated(data.pattern);
                }
            } else {
                // Pattern not recognized
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.message || 'Sorry, I couldn\'t recognize that pattern. Try patterns like "head and shoulders", "double bottom", "ascending triangle", etc.'
                }]);
            }
        } catch (error) {
            console.error('Pattern recognition error:', error);
            let errorMessage = '❌ Sorry, there was an error processing your request.';

            // Provide more specific error messages
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                errorMessage = '❌ Cannot connect to backend server. Make sure the backend is running at http://localhost:8000';
            } else if (error.message) {
                errorMessage = `❌ Error: ${error.message}`;
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `${errorMessage}\n\n*Connection Details: Trying to reach ${API_URL}*`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickPatterns = [
        'Head and shoulders',
        'Double bottom',
        'Bull flag',
        'Ascending triangle'
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 group"
                title="Pattern Assistant"
            >
                <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="animate-pulse" />
                    <div>
                        <div className="font-bold text-sm">Pattern Assistant</div>
                        <div className="text-xs opacity-90">AI Chart Pattern Helper</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title={isMinimized ? 'Expand' : 'Minimize'}
                    >
                        {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${message.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                        }`}
                                >
                                    <div className="text-sm whitespace-pre-line leading-relaxed">
                                        {message.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-sm">Analyzing pattern...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Patterns */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
                            <div className="text-xs font-semibold text-slate-600 mb-2">Quick Patterns:</div>
                            <div className="flex flex-wrap gap-2">
                                {quickPatterns.map((pattern, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setInputValue(pattern);
                                            setTimeout(() => handleSendMessage(), 100);
                                        }}
                                        className="px-3 py-1.5 text-xs bg-white border border-purple-200 text-purple-700 rounded-full hover:bg-purple-50 hover:border-purple-300 transition-colors"
                                    >
                                        {pattern}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl">
                        <div className="flex items-end gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask for a pattern..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PatternChatWidget;
