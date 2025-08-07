# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FLUX AI Capital** (https://flux.ai.kr) is an AI-powered strategic asset management platform built with Next.js 14 fullstack architecture. The platform aims to manage assets starting from 100M KRW with strategic growth targets to 1T KRW.

Previously known as "Kailya Arc", the project has been rebranded to FLUX AI Capital to better represent the AI-driven asset flow optimization concept.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI, Lucide Icons
- **Fonts**: Inter + Noto Sans KR
- **Database**: PostgreSQL + Prisma (planned)
- **State Management**: Zustand (planned)
- **Charts**: D3.js, Recharts (planned)

## Common Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

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
│   │   ├── (auth)/         # Auth group routes
│   │   ├── dashboard/      # Dashboard pages
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components (Radix UI wrapped)
│   │   ├── charts/        # Chart components
│   │   └── dashboard/     # Dashboard-specific components
│   ├── lib/               # Utility functions
│   │   ├── api/          # API client functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Helper functions
│   └── styles/           # Global styles and CSS modules
├── public/               # Static assets
├── prisma/              # Database schema and migrations
└── tests/               # Test files
```

## Key Architecture Decisions

1. **Next.js App Router**: Using the latest App Router for better performance and server components
2. **API Routes**: Leveraging Next.js API routes for backend functionality
3. **Server Components by Default**: Use client components only when necessary (interactivity, browser APIs)
4. **TypeScript Strict Mode**: Ensuring type safety across the application
5. **Tailwind CSS**: Utility-first styling with custom design tokens

## Development Guidelines

1. **Component Structure**:
   - Use server components by default
   - Add "use client" directive only when needed
   - Keep components small and focused

2. **API Design**:
   - RESTful endpoints under `/api/v1/`
   - Use proper HTTP methods and status codes
   - Implement error handling middleware

3. **State Management**:
   - Server state: React Query/SWR for API data
   - Client state: Zustand for global state
   - Form state: React Hook Form + Zod

4. **Database Queries**:
   - Use Prisma for type-safe database access
   - Implement proper error handling
   - Use transactions for related operations

## Current Development Focus

The project is in early stages focusing on:
1. Setting up the core infrastructure
2. Implementing authentication system
3. Creating the main dashboard layout
4. Building reusable UI components
5. Establishing API structure

## Important Files

- `PLANNING.md`: Detailed project planning and feature roadmap
- `tailwind.config.ts`: Tailwind configuration with custom fonts
- `src/app/layout.tsx`: Root layout with font configuration
- `src/app/globals.css`: Global styles and Tailwind imports