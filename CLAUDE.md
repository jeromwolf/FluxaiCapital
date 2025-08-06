# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
FluxAI Capital is an AI-powered asset management platform aiming to manage assets from 100M KRW to 1T KRW scale.

## Project Structure
```
FluxAIcapital/
├── backend/         # Python FastAPI backend
│   ├── src/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Core business logic
│   │   ├── models/      # Database models
│   │   ├── services/    # External services
│   │   ├── portfolio/   # Portfolio management
│   │   ├── risk/        # Risk management
│   │   └── data/        # Data pipeline
│   └── tests/
├── frontend/        # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
│   └── public/
└── database/        # Database schemas and migrations
```

## Common Commands

### Backend Development
```bash
# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI development server
cd backend && uvicorn src.main:app --reload --port 8000

# Run tests
pytest

# Lint code
ruff check src/
black src/
mypy src/
```

### Frontend Development
```bash
# Install dependencies
cd frontend && npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Database
```bash
# Run PostgreSQL migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"
```

## Architecture Overview

### Backend (FastAPI)
- **Portfolio Management**: CRUD operations for portfolios, positions, and transactions
- **Risk Engine**: VaR, CVaR calculations, stress testing
- **Data Pipeline**: Market data ingestion from yfinance, real-time price updates
- **API Authentication**: JWT-based authentication

### Frontend (Next.js)
- **Server Components**: For secure data fetching
- **Client Components**: For interactive dashboards
- **Real-time Updates**: WebSocket connection for live prices
- **Charts**: TradingView Lightweight Charts for financial visualizations

### Key APIs
- `/api/v1/portfolios` - Portfolio management
- `/api/v1/positions` - Position tracking
- `/api/v1/risk` - Risk metrics
- `/api/v1/market` - Market data