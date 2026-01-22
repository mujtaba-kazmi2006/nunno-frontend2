import React from 'react';

const NunnoLogo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient background circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        
        {/* Main circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
        
        {/* Brain-like shape */}
        <path 
          d="M30 40 C30 30, 40 20, 50 20 C60 20, 70 30, 70 40 C70 50, 60 60, 50 60 C40 60, 30 50, 30 40 Z" 
          fill="white" 
          opacity="0.9"
        />
        
        {/* Neural connections */}
        <path 
          d="M40 45 C42 42, 45 42, 47 45 C49 48, 52 48, 54 45" 
          stroke="white" 
          strokeWidth="2" 
          fill="none"
          opacity="0.8"
        />
        
        {/* Small neuron dots */}
        <circle cx="35" cy="35" r="3" fill="white" opacity="0.7" />
        <circle cx="65" cy="35" r="3" fill="white" opacity="0.7" />
        <circle cx="50" cy="55" r="2" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
};

export default NunnoLogo;