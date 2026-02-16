import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NeuralActionContext = createContext();

export const NeuralActionProvider = ({ children }) => {
    const navigate = useNavigate();
    const [lastAction, setLastAction] = useState(null);

    const performAction = useCallback((actionString) => {
        // Parse [NAVIGATE: route, tab, input]
        const match = actionString.match(/\[NAVIGATE:\s*([^,\]]+)(?:,\s*([^,\]]*))?(?:,\s*([^,\]]*))?\]/);

        if (match) {
            const [, route, tab, input] = match.map(s => s?.trim());
            console.log('Neural Navigation Triggered:', { route, tab, input });

            setLastAction({ type: 'NAVIGATE', route, tab, input, timestamp: Date.now() });

            // Construct search params
            const params = new URLSearchParams();
            if (tab) params.append('tab', tab);
            if (input) params.append('ticker', input);

            const search = params.toString();
            navigate({
                pathname: route,
                search: search ? `?${search}` : ''
            });

            return true;
        }

        return false;
    }, [navigate]);

    // Handle global events for actions triggered outside React context
    useEffect(() => {
        const handleNeuralEvent = (e) => {
            if (e.detail) performAction(e.detail);
        };
        window.addEventListener('neural-action', handleNeuralEvent);
        return () => window.removeEventListener('neural-action', handleNeuralEvent);
    }, [performAction]);

    return (
        <NeuralActionContext.Provider value={{ performAction, lastAction }}>
            {children}
        </NeuralActionContext.Provider>
    );
};

export const useNeuralAction = () => {
    const context = useContext(NeuralActionContext);
    if (!context) {
        throw new Error('useNeuralAction must be used within a NeuralActionProvider');
    }
    return context;
};
