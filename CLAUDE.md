# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔄 Session Continuity

**IMPORTANT**: When starting a new session, always read `docs/SESSION_CONTEXT_2025-08-10.md` first to understand the current project status and recent work completed. This ensures continuity between sessions.

## Project Overview

**FLUX AI Capital** (https://flux.ai.kr) is an AI-powered strategic asset management platform built with Next.js 14 fullstack architecture. The platform aims to manage assets starting from 100M KRW with strategic growth targets to 1T KRW.

Previously known as "Kailya Arc", the project has been rebranded to FLUX AI Capital to better represent the AI-driven asset flow optimization concept.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI, Lucide Icons, Custom Components
- **Charts**: Recharts (implemented)
- **Real-time**: WebSocket with auto-reconnect
- **Fonts**: Inter + Noto Sans KR
- **Database**: PostgreSQL + Prisma (planned)
- **Auth**: Supabase (planned)
- **State Management**: React Hooks + Context

## Common Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:4321
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript compiler check
npm run format       # Format with Prettier

# Database (when Prisma is set up)
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio
```

## Project Structure

```
/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── layout.tsx  # Dashboard layout
│   │   │   └── page.tsx    # Main dashboard
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components
│   │   ├── charts/        # Chart components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── layout/        # Layout components
│   │   └── realtime/      # Real-time components
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   │   ├── utils/         # Helper functions
│   │   └── websocket/     # WebSocket implementation
│   └── styles/            # Global styles
├── public/                # Static assets
├── prisma/               # Database schema
└── docs/                 # Documentation
```

## Key Architecture Decisions

1. **Next.js App Router**: Using the latest App Router for better performance and server components
2. **API Routes**: Leveraging Next.js API routes for backend functionality
3. **Server Components by Default**: Use client components only when necessary (interactivity, browser APIs)
4. **TypeScript Strict Mode**: Ensuring type safety across the application
5. **Tailwind CSS**: Utility-first styling with custom design tokens
6. **WebSocket for Real-time**: Custom WebSocket client with auto-reconnect and mock server for development

## Development Guidelines

1. **Component Structure**:
   - Use server components by default
   - Add "use client" directive only when needed
   - Keep components small and focused
   - Follow the established component hierarchy

2. **API Design**:
   - RESTful endpoints under `/api/v1/`
   - Use proper HTTP methods and status codes
   - Implement error handling middleware

3. **State Management**:
   - Server state: React hooks for API data
   - Client state: useState/useContext for local state
   - Form state: Controlled components
   - Real-time state: WebSocket hooks

4. **Responsive Design**:
   - Mobile-first approach
   - Use useMediaQuery hook for responsive logic
   - Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## Current Development Status

### Completed (Week 1-3) ✅

1. **Chart System**: Recharts-based components with theme system
2. **Dashboard UI**: Period tabs, portfolio overview, holdings table
3. **Responsive Design**: Mobile/tablet/desktop optimization
4. **Real-time Integration**: WebSocket client with auto-reconnect
5. **Components**: 30+ reusable components across charts, dashboard, layout, and realtime

### Next Steps 🚧

1. **Authentication**: Supabase Auth integration
2. **Database**: Prisma + PostgreSQL setup
3. **API Routes**: RESTful endpoints implementation
4. **Risk Management**: VaR calculations, stress testing
5. **AI Integration**: ML-based strategy recommendations

## Important Files

### Configuration

- `tailwind.config.ts`: Tailwind configuration with custom fonts
- `src/config/chart-theme.ts`: Chart theming system
- `.env.example`: Environment variables template

### Core Components

- `src/app/layout.tsx`: Root layout with font configuration
- `src/app/dashboard/layout.tsx`: Dashboard layout wrapper
- `src/app/dashboard/page.tsx`: Main dashboard page

### Key Libraries

- `src/lib/websocket/client.ts`: WebSocket client implementation
- `src/lib/utils/period-filters.ts`: Period-based data filtering
- `src/lib/utils/returns-calculator.ts`: Financial calculations

### Hooks

- `src/hooks/useWebSocket.ts`: WebSocket connection management
- `src/hooks/useMediaQuery.ts`: Responsive design utilities
- `src/hooks/usePeriodData.ts`: Period-based data management

### Component Systems

- `src/components/charts/`: Chart components (PieChart, MiniChart, etc.)
- `src/components/dashboard/`: Dashboard-specific components
- `src/components/layout/`: Layout components (Sidebar, MobileNav, etc.)
- `src/components/realtime/`: Real-time components (PriceTicker, etc.)
- `src/components/ui/`: Base UI components

## Testing & Running

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## Recent Updates (Week 1-3)

1. **Week 1**: Built comprehensive chart system with Recharts
2. **Week 2**: Implemented dashboard UI with period filtering and responsive design
3. **Week 3**: Added real-time WebSocket integration with mock server for development

## WebSocket Mock Server

For development, a mock WebSocket server is available that simulates:

- Real-time price updates (1-second intervals)
- Portfolio value changes (2-second intervals)
- Random alerts (10-second intervals)

The mock server automatically starts when using WebSocket components in development mode.

## Code Style

- Use TypeScript for all new files
- Follow ESLint rules (run `npm run lint`)
- Use Prettier for formatting
- Prefer functional components with hooks
- Use proper TypeScript types (avoid `any`)
- Keep components focused and reusable
- Add proper error handling
- Use semantic HTML and ARIA attributes for accessibility
