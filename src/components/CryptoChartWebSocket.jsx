import React from 'react';

// Placeholder component - redirects to EliteChart
const CryptoChartWebSocket = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          This component has been upgraded to Elite Chart
        </h2>
        <p className="text-slate-600 mb-6">
          Please use the Elite Chart from the sidebar navigation
        </p>
        <a
          href="/elite-chart"
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors inline-block"
        >
          Go to Elite Chart
        </a>
      </div>
    </div>
  );
};

export default CryptoChartWebSocket;