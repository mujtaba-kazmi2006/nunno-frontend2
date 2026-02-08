import React from 'react';
import { motion } from 'framer-motion';

const NunnoLogo = ({ size = 'md', className = '', animated = false }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Define the 'N' path points for the spine
  const nPath = "M 20 80 L 40 20 L 60 80 L 80 20";

  if (!animated) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="nGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>
          </defs>
          <path
            d={nPath}
            stroke="url(#nGradient)"
            strokeWidth="18"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="nGradientAnim" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
        </defs>

        {/* Tracing 'N' effect */}
        <motion.path
          d={nPath}
          stroke="url(#nGradientAnim)"
          strokeWidth="18"
          strokeLinejoin="round"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 2, ease: "easeInOut" },
            opacity: { duration: 0.3 }
          }}
        />

      </motion.svg>
    </div>
  );
};

export default NunnoLogo;