import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const WelcomeAnimation = ({ isVisible = true }) => {
  const { theme } = useTheme();
  if (!isVisible) return null;

  return (
    <div className="welcome-animation">
      <style jsx>{`
        .welcome-animation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          opacity: 0;
          animation: fadeInSlideUp 1.5s ease-out forwards;
        }
        
        @keyframes fadeInSlideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .welcome-logo {
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .welcome-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: ${theme === 'dark' ? '#f8fafc' : '#1e293b'};
          margin-bottom: 0.5rem;
          animation: fadeInDelay 1s ease-out 0.3s both;
        }
        
        .welcome-subtitle {
          color: ${theme === 'dark' ? '#94a3b8' : '#64748b'};
          font-size: 1rem;
          animation: fadeInDelay 1s ease-out 0.5s both;
        }
        
        @keyframes fadeInDelay {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      <div className="welcome-logo">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="welcomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="45" fill="url(#welcomeGradient)" />

          <path
            d="M30 40 C30 30, 40 20, 50 20 C60 20, 70 30, 70 40 C70 50, 60 60, 50 60 C40 60, 30 50, 30 40 Z"
            fill="white"
            opacity="0.9"
          />

          <path
            d="M40 45 C42 42, 45 42, 47 45 C49 48, 52 48, 54 45"
            stroke="white"
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />

          <circle cx="35" cy="35" r="3" fill="white" opacity="0.7" />
          <circle cx="65" cy="35" r="3" fill="white" opacity="0.7" />
          <circle cx="50" cy="55" r="2" fill="white" opacity="0.7" />
        </svg>
      </div>

      <h2 className="welcome-title">Welcome to Nunno!</h2>
      <p className="welcome-subtitle">Your empathetic AI financial educator</p>
    </div>
  );
};

export default WelcomeAnimation;