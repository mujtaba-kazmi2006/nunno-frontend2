/**
 * Nunno Finance - GA4 Analytics Utility
 * Standardized event tracking for major features
 */

// Tracking function for general events
export const trackEvent = (eventName, params = {}) => {
    if (window.gtag) {
        window.gtag('event', eventName, {
            ...params,
            platform: 'web',
            project: 'nunno_finance'
        });
    } else {
        console.warn(`GA4: gtag not found. Event ${eventName} not tracked.`);
    }
};

// Feature-specific tracking helpers
export const analytics = {
    // Authentication
    trackLogin: (method) => trackEvent('login', { method }),
    trackSignup: (method) => trackEvent('sign_up', { method }),

    // Core AI Features
    trackAIChat: (messageLength) => trackEvent('ai_chat_interaction', { message_length: messageLength }),

    // Technical Features
    trackScan: (symbol, interval) => trackEvent('technical_scan', { symbol, interval }),
    trackMonteCarlo: (symbol) => trackEvent('monte_carlo_sim', { symbol }),
    trackRegimeInjection: (symbol, type) => trackEvent('regime_injection', { symbol, type }),
    trackTradeJudge: (symbol, verdict) => trackEvent('trade_judge', { symbol, verdict }),

    // Data Tools
    trackTokenomics: (coinId) => trackEvent('tokenomics_view', { coin_id: coinId }),
    trackNewsCheck: (symbol) => trackEvent('news_check', { symbol }),

    // Monetization/Discovery
    trackPricingView: () => trackEvent('pricing_view'),
    trackPlanSelect: (plan) => trackEvent('plan_select', { plan_name: plan })
};
