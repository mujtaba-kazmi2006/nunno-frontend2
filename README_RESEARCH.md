# 🧠 Nunno Finance — AI-Powered Crypto Intelligence & Education

**Nunno Finance** is an advanced AI-driven crypto analysis and financial education platform designed for Pakistani beginners and global crypto enthusiasts. It combines institutional-grade technical analysis with empathetic, multi-lingual AI to de-risk the crypto experience for everyone.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

---

## 🌟 Vision & Purpose (Educational Context)

The goal of Nunno Finance is not just to provide data, but to **teach financial literacy**. While many platforms show numbers, Nunno explains what those numbers mean in simple English, Urdu, and Roman Urdu. It acts as a digital mentor, protecting beginners from emotional trading decisions.

### Core Educational Tracks:
- **📊 Technical Analysis (TA)**: Real-time detection of RSI, MACD, EMA, and Bollinger Bands with plain-language explanations.
- **📚 Chart Pattern Recognition**: Automated identification of Hammer, Engulfing, Doji, and 30+ other patterns.
- **🎲 Probability & Risk**: Interactive Monte Carlo simulations visualizing 100+ potential future price paths.
- **🛡️ Emotional Shielding**: "Roast My Coin" and "FOMO Killer" tools that use humor and data to prevent impulsive trades.

---

## 🛠️ Complete Feature Suite

### 1. **Nunno AI Companion**
A sophisticated multi-lingual AI that can chat about anything from Bitcoin's history to suggesting safe entry points for Solana. It automatically detects ticker symbols and fetches real-time data to support its answers.

### 2. **Elite Charting (Institutional Grade)**
A high-performance charting interface with WebSocket streaming directly from Binance. It includes:
- **Multi-Timeframe Analysis**: 1m to 1d intervals.
- **Real-time Indicators**: EMA 20/50/100/200, Bollinger Bands, and Support/Resistance zones.
- **Liquidity Heatmaps**: Visualizes Binance order book depth (bid/ask walls).

### 3. **Monte Carlo simulations**
Simulates possible price movements using current volatility and historical regimes. It provides probability fans (P25/P50/P75 cones) to show likely outcomes rather than just a single price target.

### 4. **Community Discovery Feed (FYP)**
A TikTok-style feed where AI and users share trade ideas, news flashes, and sentiment analysis. This creates a learning ecosystem for community-driven discovery.

### 5. **Pakistani-Market Localized Tools**
- **🔥 Roast My Coin**: Brutally honest risk analysis in Roman Urdu/English mix.
- **⚠️ FOMO Killer**: Scans for overpriced "moonboys" coins to warn against buying at the top.
- **🎯 Safe Entry**: Suggests pullback levels (EMA20/50) for lower-risk entries.

---

## 🏗️ Technical Architecture

### **Frontend** (Vite + React + TailwindCSS)
A glassmorphic, responsive UI built for speed and aesthetics.
- **EliteChart.jsx**: A 184KB high-performance component handling all visualization logic.
- **Streaming**: WebSocket (ws) for real-time prices & SSE (Server-Sent Events) for AI streaming.

### **Backend** (FastAPI)
- **Architecture**: Service-oriented monolith with 20+ specialized modules (technical analysis, simulation, liquidity, etc.).
- **Async Processing**: High-concurrency handling of real-time market data and LLM requests.
- **Caching**: 3-tier system (Redis → SQL → In-Memory) to optimize API usage and costs.

---

## 🚀 Getting Started

### Prerequisites:
- Python 3.9+
- Node.js 18+
- [OpenRouter API Key](https://openrouter.ai/) for AI features.

### Quick Setup:
1. **Clone the repo.**
2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📄 Documentation Links
- **[Full App Documentation](./NUNNO_APP_DOCUMENTATION.md)**: Deep dive into all endpoints, features, and schemas.
- **[Community Hub Vision](./COMMUNITY_HUB_VISION.md)**: Roadmap for the influencer and educator ecosystem.
- **[Educational Guide](./EDUCATIONAL_GUIDE.md)**: A module-by-module guide on how to use Nunno for learning.
- **[Deployment Guide](./backend/DEPLOYMENT.md)**: Instructions for Docker, Render, and Netlify.

---

## 🛡️ SEO & AI Crawler Friendly
This repository is optimized for AI search crawlers (like Perplexity, Google Gemini, and OpenAI Search). Use the structured **[llms.txt](./llms.txt)** or the **[NUNNO_APP_DOCUMENTATION.md](./NUNNO_APP_DOCUMENTATION.md)** for deep context extraction.

---

© 2026 Nunno Labs. All rights reserved. _Not financial advice._
