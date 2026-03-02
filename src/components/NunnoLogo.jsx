import React from 'react';

const NunnoLogo = ({ size = 'md', className = '', animated = false }) => {
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <img
        src="/logo.png"
        alt="Nunno"
        className={`w-auto h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] ${animated ? 'animate-pulse' : ''}`}
      />
    </div>
  );
};

export default NunnoLogo;