import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export function useChat() {
    return useContext(ChatContext);
}

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const userName = user?.name || 'User';

    const [currentConversationId, setCurrentConversationId] = useState(() => {
        // Simple UUID generation for the conversation
        return crypto.randomUUID();
    });
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi ${userName}! 👋 I'm Nunno, your friendly AI financial educator. I'm here to help you understand trading and investing in the simplest way possible.\n\n**What would you like to learn about today?**\n\n💡 Try asking me:\n- "Is Bitcoin a good buy right now?"\n- "What is Ethereum and should I invest?"\n- "Explain RSI to me like I'm 15"\n- "Help me build a crypto portfolio with $1000"`
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [pendingMessage, setPendingMessage] = useState(null);

    const addMessage = useCallback((message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const updateLastMessage = useCallback((updater) => {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg) {
                // If updater is a function, call it with previous content
                if (typeof updater === 'function') {
                    updater(lastMsg);
                } else {
                    // Otherwise just merge properties
                    Object.assign(lastMsg, updater);
                }
            }
            return newMessages;
        });
    }, []);

    const value = {
        messages,
        setMessages,
        isLoading,
        setIsLoading,
        loadingStatus,
        setLoadingStatus,
        showSuggestions,
        setShowSuggestions,
        addMessage,
        updateLastMessage,
        currentConversationId,
        setCurrentConversationId,
        pendingMessage,
        setPendingMessage
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}
