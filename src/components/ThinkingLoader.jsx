import React from 'react';
import './ThinkingLoader.css';

/**
 * ThinkingLoader — "Neural Pulse"
 * Pure CSS animation, GPU-composited.
 * Three orbital dots with connecting SVG lines and a pulsing core.
 * Total DOM nodes: 6 (far lighter than a 3D cube with 6 divs + perspective).
 */
const ThinkingLoader = () => {
    return (
        <div className="thinking-loader-container">
            <div className="neural-orbit">
                {/* Three orbital dots */}
                <div className="dot" />
                <div className="dot" />
                <div className="dot" />

                {/* Connecting lines (lightweight SVG) */}
                <svg className="connect-lines" viewBox="0 0 28 28" fill="none">
                    <line x1="14" y1="3" x2="5" y2="23" />
                    <line x1="5" y1="23" x2="23" y2="23" />
                    <line x1="23" y1="23" x2="14" y2="3" />
                </svg>

                {/* Central glow core */}
                <div className="core" />
            </div>
        </div>
    );
}

export default ThinkingLoader;
