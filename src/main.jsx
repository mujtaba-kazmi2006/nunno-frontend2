import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/App.css'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from "@sentry/react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorBoundaryFallback from "./components/ErrorBoundaryFallback";

// Initialize Sentry for production monitoring
// Replace DSN with actual one from Sentry project settings
Sentry.init({
    dsn: "https://placeholder-dsn@sentry.io/nunno", // Replace with real DSN
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD, // Only enable Sentry in production
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary
            FallbackComponent={ErrorBoundaryFallback}
            onReset={() => {
                // Clear state or reload page if needed
                window.location.href = "/";
            }}
        >
            <HelmetProvider>
                <AuthProvider>
                    <ThemeProvider>
                        <App />
                    </ThemeProvider>
                </AuthProvider>
            </HelmetProvider>
        </ErrorBoundary>
    </React.StrictMode>,
)
