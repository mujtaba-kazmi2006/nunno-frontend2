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
        const newTheme = theme === 'light' ? 'dark' : 'light';

        if (!document.startViewTransition) {
            setTheme(newTheme);
            return;
        }

        // Calculate transition starting point from the event
        const x = e?.clientX ?? window.innerWidth / 2;
        const y = e?.clientY ?? window.innerHeight / 2;
        const right = window.innerWidth - x;
        const top = y;

        // Pass coordinates to CSS
        document.documentElement.style.setProperty('--transition-x', `${x}px`);
        document.documentElement.style.setProperty('--transition-y', `${y}px`);
        document.documentElement.style.setProperty('--transition-right', `${right}px`);
        document.documentElement.style.setProperty('--transition-top', `${top}px`);

        // Add a class to indicate a theme transition is in progress
        document.documentElement.classList.add('theme-transitioning');

        const transition = document.startViewTransition(() => {
            setTheme(newTheme);
        });

        transition.finished.finally(() => {
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
