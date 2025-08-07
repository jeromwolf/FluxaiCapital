# FLUX AI Capital

> **AI-powered Strategic Asset Management Platform**  
> 🌐 **Domain**: [https://flux.ai.kr](https://flux.ai.kr)

AI와 데이터 기반의 전략적 자산관리 플랫폼으로, 1억원에서 시작하여 1조원까지 성장을 목표로 합니다.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/FluxAIcapital.git
cd FluxAIcapital

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server (port 4321)
npm run dev

# Open browser
open http://localhost:4321/dashboard
```

## 🛠 Tech Stack

### Core
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide Icons

### Data Visualization & Real-time
- **Charts**: Recharts
- **Real-time**: WebSocket (with auto-reconnect)
- **State Management**: React Hooks + Context

### Infrastructure
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, Husky

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   │   ├── layout.tsx    # Dashboard layout
│   │   ├── page.tsx      # Main dashboard
│   │   ├── portfolio/    # Portfolio management
│   │   └── reports/      # Reports & analytics
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── charts/          # Chart components
│   │   ├── ChartContainer.tsx
│   │   ├── PieChart.tsx
│   │   └── MiniChart.tsx
│   ├── dashboard/       # Dashboard components
│   │   ├── PeriodTabs.tsx
│   │   ├── PortfolioOverview.tsx
│   │   └── HoldingsTable.tsx
│   ├── layout/          # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── MobileNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── DashboardGrid.tsx
│   ├── realtime/        # Real-time components
│   │   ├── PriceTicker.tsx
│   │   ├── PortfolioStatus.tsx
│   │   ├── RealtimeChart.tsx
│   │   ├── AlertNotification.tsx
│   │   └── ConnectionIndicator.tsx
│   └── ui/              # Base UI components
├── config/              # Configuration files
│   └── chart-theme.ts   # Chart theming
├── hooks/               # Custom React hooks
│   ├── useMediaQuery.ts # Responsive design
│   ├── usePeriodData.ts # Period filtering
│   └── useWebSocket.ts  # WebSocket connection
├── lib/                 # Utility functions
│   ├── utils/          # Helper functions
│   │   ├── period-filters.ts
│   │   └── returns-calculator.ts
│   └── websocket/      # WebSocket implementation
│       ├── client.ts   # WebSocket client
│       ├── types.ts    # Type definitions
│       └── mock-server.ts # Development mock
└── styles/             # Global styles
```

## 🎯 Current Features (Week 1-3 Completed)

### Week 1: Chart System ✅
- **Chart Components**
  - Recharts 기반 차트 시스템
  - PieChart (자산 배분, 포트폴리오 분포)
  - MiniChart (스파크라인, 트렌드 차트)
  - ChartContainer (에러 처리, 로딩 상태)
- **Theme System**
  - 일관된 색상 팔레트
  - 다크 모드 지원
  - 반응형 차트 크기

### Week 2: Dashboard UI ✅
- **Period System**
  - 기간별 탭 (1D, 1W, 1M, 3M, 6M, 1Y, ALL)
  - 데이터 필터링 로직
  - 수익률 계산 함수
- **Dashboard Components**
  - PortfolioOverview (포트폴리오 개요)
  - HoldingsTable (보유 자산 테이블)
  - 정렬 가능한 테이블
  - 자산 배분 시각화
- **Responsive Design**
  - 모바일 네비게이션 (하단 탭 + 사이드 메뉴)
  - 태블릿 최적화 (축소 사이드바)
  - 데스크톱 그리드 시스템
  - useMediaQuery 훅

### Week 3: Real-time Integration ✅
- **WebSocket Infrastructure**
  - WebSocket 클라이언트 (자동 재연결)
  - React Hooks (useWebSocket, usePriceSubscription)
  - Mock 서버 (개발용)
- **Real-time Components**
  - PriceTicker (실시간 가격 표시)
  - PortfolioStatus (포트폴리오 상태)
  - RealtimeChart (실시간 차트)
  - AlertNotification (알림 시스템)
  - ConnectionIndicator (연결 상태)
- **Features**
  - 실시간 가격 업데이트 (1초 간격)
  - 포트폴리오 가치 변동 추적
  - 다중 심볼 차트
  - 알림 센터 (읽음/안읽음 관리)
  - 연결 상태 모니터링

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server (port 4321)
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
npm run format       # Format with Prettier

# Database (when configured)
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:4321

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fluxai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📊 Development Status

### Completed ✅
- [x] Project setup with Next.js 14
- [x] TypeScript strict mode configuration
- [x] Tailwind CSS + Design system
- [x] Chart component library
- [x] Dashboard UI components
- [x] Responsive design (Mobile/Tablet/Desktop)
- [x] Real-time WebSocket integration
- [x] Period-based data filtering
- [x] Returns calculation system
- [x] Alert notification system

### In Progress 🚧
- [ ] Authentication system (Supabase)
- [ ] Database integration (Prisma + PostgreSQL)
- [ ] API endpoints implementation
- [ ] Risk management features
- [ ] AI/ML integration

### Planned 📋
- [ ] Advanced analytics dashboard
- [ ] Automated trading strategies
- [ ] Backtesting engine
- [ ] Multi-language support (Korean/English)
- [ ] Mobile app (React Native)
- [ ] Public API
- [ ] Performance optimization

## 🎨 Design System

### Colors
- Primary: Blue (#3b82f6)
- Secondary: Purple (#8b5cf6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)

### Typography
- Font: Inter + Noto Sans KR
- Responsive font sizes
- Dark mode optimized

### Components
- Consistent spacing system
- Smooth animations
- Accessible UI patterns
- Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 업데이트
- style: 코드 스타일 변경
- refactor: 코드 리팩토링
- test: 테스트 추가/수정
- chore: 빌드/설정 변경

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

- **Development**: AI-powered development with Claude
- **Design**: Modern, responsive UI/UX
- **Strategy**: Data-driven investment approach

## 📞 Contact

- **Website**: [https://flux.ai.kr](https://flux.ai.kr)
- **Email**: contact@flux.ai.kr

---

Built with ❤️ by FLUX AI Capital Team

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>