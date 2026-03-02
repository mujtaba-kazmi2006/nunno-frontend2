# 📑 Nunno Finance: Project Summary & Directory Map

This document provides a structured map of the Nunno Finance repository for researchers, developers, and AI agents.

## 📂 Directory Structure

- **`/frontend`**: React (Vite) + TailwindCSS.
  - `src/components/EliteChart.jsx`: The core charting engine.
  - `src/services/api.js`: Centralized API handling (SSE, REST, WS).
- **`/backend`**: FastAPI (Python) service-oriented architecture.
  - `main.py`: Monolithic entry point.
  - `services/`: 20+ specialized modules for TA, Simulations, and AI logic.
  - `database.py`: SQLAlchemy models for users, messages, and predictions.
- **`/docs`**: (Reference documents)
  - [NUNNO_APP_DOCUMENTATION.md](file://./NUNNO_APP_DOCUMENTATION.md): Deep technical audit and feature catalog.
  - [COMMUNITY_HUB_VISION.md](file://./COMMUNITY_HUB_VISION.md): Roadmap for phase 2.
  - [EDUCATIONAL_GUIDE.md](file://./EDUCATIONAL_GUIDE.md): Explanation of features in a learning context.

## 🤖 AI & Search Crawler Optimization

- **[llms.txt](file://./llms.txt)**: High-level summary for LLM context injection.
- **[README.md](file://./README.md)**: Main landing page for the repository.
- **`frontend/index.html`**: Contains JSON-LD (Schema.org) for:
  - `SoftwareApplication`
  - `FAQPage`
  - `Course` (Academy)

## 📖 Key Educational Concepts

1. **Empathetic AI**: Lowers the barrier to entry using local language analogies.
2. **Probabilistic Charting**: Moving from "targets" to "probability fans" (Monte Carlo).
3. **Emotional Safeguards**: "Roast My Coin" and "FOMO Killer" as behavioral finance tools.

## 🚀 Quick Access for AI Agents

If you are an AI agent analyzing this repo:
1. Read `llms.txt` for the 10,000 ft view.
2. Check `NUNNO_APP_DOCUMENTATION.md` for API endpoints and schemas.
3. Review `backend/services/technical_analysis.py` for the core math/logic.

---

© 2026 Nunno Labs.
