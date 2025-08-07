# FLUX AI Capital

> **AI-powered Strategic Asset Management Platform**  
> 🌐 **Domain**: [https://flux.ai.kr](https://flux.ai.kr)

## 🎯 Overview

FLUX AI Capital is an AI-driven strategic asset management platform built with Next.js 14. Starting with 100M KRW in initial assets, the platform aims for strategic growth targeting 1T KRW through systematic investment approaches.

### Key Features

- **📊 Real-time Dashboard**: Comprehensive portfolio monitoring and analytics
- **🧠 AI-Powered Strategies**: Machine learning-based investment decision making  
- **📈 Backtesting Engine**: Historical strategy performance analysis
- **⚡ Risk Management**: VaR/CVaR calculations and stress testing
- **📱 Modern UI/UX**: Responsive design with dark/light mode support
- **🔒 Secure Authentication**: Supabase-based user management

## 🛠️ Tech Stack

**Frontend & Backend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI, Lucide React
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Supabase Auth

**Development Tools**
- **Code Quality**: ESLint, Prettier, Husky
- **Type Safety**: TypeScript strict mode
- **Git Hooks**: lint-staged for pre-commit checks

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FluxAIcapital.git
   cd FluxAIcapital
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Optional: Seed initial data
   npm run db:seed
   ```

### Development

**Option 1: Using the development script**
```bash
chmod +x dev.sh
./dev.sh
# Select option 1 to start development server
```

**Option 2: Direct command**
```bash
npm run dev
```

Visit [http://localhost:4321](http://localhost:4321) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Main application routes
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── portfolio/     # Portfolio management
│   │   └── backtest/      # Backtesting interface
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard components
│   ├── portfolio/        # Portfolio components
│   └── backtest/         # Backtesting components
├── lib/                  # Utility functions
│   ├── backtest/         # Backtesting engine
│   ├── db/              # Database operations
│   └── supabase/        # Supabase clients
└── types/               # TypeScript definitions
```

## 💼 Available Scripts

```bash
npm run dev              # Start development server (port 4321)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Database commands
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database  
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed initial data
```

## 🎨 Key Components

### Dashboard
- Real-time portfolio performance monitoring
- Interactive charts and analytics
- Asset allocation visualization

### Portfolio Management
- Multi-portfolio creation and management
- Asset allocation strategies
- Performance tracking

### Backtesting Engine
- Strategy performance analysis
- Historical data simulation
- Risk metrics calculation
- Multiple strategy support:
  - Buy & Hold
  - Moving Average
  - Rebalancing
  - Custom strategies

### Risk Management
- Value at Risk (VaR) calculations
- Stress testing scenarios
- Position sizing controls

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example`):

```env
# Application
NEXT_PUBLIC_APP_URL=https://flux.ai.kr

# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database
DATABASE_URL=file:./dev.db  # SQLite for development

# Feature Flags
NEXT_PUBLIC_ENABLE_TRADING=false
NEXT_PUBLIC_ENABLE_AI_FEATURES=false
```

## 🚢 Deployment

The application is optimized for deployment on:

- **Frontend**: Vercel (recommended)
- **Database**: PostgreSQL (production)
- **Monitoring**: Sentry integration ready

```bash
npm run build && npm start
```

## 🤝 Development Workflow

1. **Code Quality**: Automated linting and formatting
2. **Type Safety**: TypeScript strict mode enforcement  
3. **Git Hooks**: Pre-commit checks via Husky
4. **Testing**: Comprehensive strategy backtesting

## 📊 Current Status

- ✅ **Phase 1**: MVP with core dashboard and portfolio management
- 🚧 **Phase 2**: Advanced backtesting and risk management (in progress)
- 📋 **Phase 3**: AI/ML integration and automated strategies
- 📋 **Phase 4**: Mobile app and API platform

## 📞 Support

For questions and support:
- Review the [PLANNING.md](./PLANNING.md) for detailed project roadmap
- Check [CLAUDE.md](./CLAUDE.md) for development guidelines

---

**Built with ❤️ using Next.js 14 and modern web technologies**