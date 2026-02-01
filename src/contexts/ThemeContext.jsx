import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = (e) => {
        if (!document.startViewTransition) {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
            return;
        }

        // Add a class to indicate a theme transition is in progress
        document.documentElement.classList.add('theme-transitioning');

        document.startViewTransition(() => {
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
        }).finished.finally(() => {
            document.documentElement.classList.remove('theme-transitioning');
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
