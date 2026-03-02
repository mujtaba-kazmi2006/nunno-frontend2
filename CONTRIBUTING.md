# 🛠️ Contributing to Nunno Finance

Welcome! Nunno Finance is a collaborative AI-powered crypto intelligence ecosystem. This document outlines the standards and patterns used in the project to maintain its integrity, performance, and SEO/AI-friendliness.

---

## 🏗️ Architecture Standards

We use a **Service-Oriented Monolith** on the backend and a **Component-Based Glassmorphic UI** on the frontend.

### 🐍 Backend Patterns (FastAPI)
- **Service Isolation**: All business logic (Technical Analysis, Simulations, LLM calls) MUST live in the `backend/services/` directory.
- **Async First**: Use `async def` for all I/O bound operations (API calls, DB queries).
- **Caching**: Always check the 3-tier cache (`cache_service.py`) before making external API requests to Binance or OpenRouter.
- **Prompt Engineering**: AI prompts live in specialized files (e.g., `IMPROVED_FEED_PROMPT.py`). Use structured JSON output where possible.

### ⚛️ Frontend Patterns (React + Vite)
- **Atomic Components**: Keep components small and focused. 
- **TailwindCSS**: Use utility classes (v3.0+) for styling. Avoid inline styles.
- **Streaming**: AI responses MUST use Server-Sent Events (SSE) for a snappy user experience.
- **WebSocket**: Price data MUST be streamed via the `/ws/prices` endpoint.

---

## 📈 SEO & AI Crawler Integrity

To keep this project highly discoverable and readable by Al:
1. **Semantic HTML**: Always use `<main>`, `<section>`, `<h1>-<h6>`, and `alt` tags for images.
2. **Metadata**: Any new page or major feature must have corresponding meta tags and, if applicable, JSON-LD structured data.
3. **Internal Documentation**: If you add a new service, update `NUNNO_APP_DOCUMENTATION.md` and `SUMMARY.md`.
4. **README Consistency**: The `README.md` and `llms.txt` are the primary entry points for AI crawlers. Keep them updated with current project status.

---

## 🧪 Testing Guidelines

- **Unit Tests**: Place Python tests in `backend/tests/` (if not already there, create it).
- **Manual Verification**: We use scripts like `verify_roast.py` and `test_websocket.py` for quick verification. 
- **Linting**: Please ensure your code follows PEP8 (Python) and Prettier/ESLint (React) standards.

---

## 🚀 Deployment Workflow

We deploy using **Docker** as the universal format.
- **Main Branch**: Automatically deploys to HuggingFace Spaces/Render (Production).
- **Dev Branch**: Staging environment for testing new features.

---

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

© 2026 Nunno Labs.
