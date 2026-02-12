import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitch = () => {
    const { theme, toggleTheme } = useTheme();

    const handleToggle = (e) => {
        // Stop propagation to prevent sidebar from reacting if nested (though it shouldn't be)
        e.stopPropagation();
        toggleTheme(e);
    };

    return (
        <div className="flex items-center justify-center py-2" onClick={(e) => e.stopPropagation()}>
            <label htmlFor="theme-switch" className="theme-switch">
                <input
                    id="theme-switch"
                    type="checkbox"
                    checked={theme === 'light'}
                    onChange={handleToggle}
                />
                <span className="slider" />
                <span className="decoration" />
            </label>
        </div>
    );
}

export default ThemeSwitch;
