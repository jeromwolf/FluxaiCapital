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

# Setup database
npm run db:generate
npm run db:push
npm run db:seed  # Optional: seed with sample data

# Run development server (port 4321)
npm run dev

# Open browser
open http://localhost:4321
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
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Authentication**: NextAuth.js (Credentials Provider)
- **Deployment**: Vercel
- **Code Quality**: ESLint, Prettier, TypeScript Strict Mode

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # NextAuth endpoints
│   │   └── v1/           # RESTful API v1
│   │       ├── portfolios/
│   │       ├── market/
│   │       └── users/
│   ├── dashboard/         # Dashboard pages
│   ├── portfolio/         # Portfolio management
│   ├── backtest/          # Backtesting features
│   ├── market/            # Market data views
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
│   ├── api/            # API clients
│   │   └── client.ts   # Base API client
│   ├── auth.ts         # NextAuth configuration
│   ├── backtest/       # Backtesting engine
│   │   ├── engine.ts   # Core backtest logic
│   │   ├── strategies/ # Trading strategies
│   │   └── types.ts    # Type definitions
│   ├── market/         # Market data providers
│   │   ├── client.ts   # Market data client
│   │   └── providers/  # Data providers
│   ├── utils/          # Helper functions
│   └── websocket/      # WebSocket implementation
├── prisma/             # Database schema
│   ├── schema.prisma   # Prisma schema
│   └── seed.ts        # Database seeding
└── styles/             # Global styles
```

## 🎯 Current Features (Week 1-5 Completed)

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

### Week 4: Authentication & API ✅
- **Authentication System**
  - NextAuth.js 통합 (Credentials Provider)
  - 보호된 라우트 미들웨어
  - 사용자 가입/로그인 폼
  - 세션 관리
- **RESTful API v1**
  - 포트폴리오 CRUD
  - 거래 내역 관리
  - 시장 데이터 조회
  - 사용자 관리
- **Database Integration**
  - Prisma ORM 설정
  - 사용자/포트폴리오/거래 스키마
  - 데이터베이스 시드

### Week 5: Advanced Features ✅
- **Backtesting Engine**
  - 백테스트 엔진 구현
  - 모멘텀 전략 (20일 이동평균)
  - 평균회귀 전략 (RSI 기반)
  - 백테스트 UI 페이지
- **Portfolio Management**
  - 포트폴리오 상세 페이지
  - 거래 추가 다이얼로그
  - 실시간 가격 연동
  - PDF 리포트 생성
  - 이메일 리포트 전송
- **Market Data Integration**
  - 시장 데이터 프로바이더 패턴
  - 캔들스틱 차트
  - 수익률 차트
  - Custom hooks (useMarketData)

### Week 6: Security & UX Enhancement ✅
- **Dark Mode Support**
  - next-themes 통합
  - 라이트/다크/시스템 테마
  - 모든 컴포넌트 다크모드 지원
  - 부드러운 테마 전환
- **Search Functionality**
  - 전역 검색 컴포넌트
  - 페이지 및 종목 검색
  - 키보드 단축키 (Cmd/Ctrl+K)
  - 실시간 검색 결과
- **Security Enhancements**
  - CSRF 토큰 보호
  - 보안 헤더 추가 (XSS, Clickjacking 방지)
  - 입력값 검증 (DOMPurify)
  - 감사 로그 시스템
  - API 미들웨어 보안 강화
- **Email Verification**
  - 이메일 인증 플로우
  - 인증 토큰 생성/검증
  - HTML 이메일 템플릿
  - 세션 검증 미들웨어

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

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:4321

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Database
DATABASE_URL=file:./dev.db  # SQLite for development
# DATABASE_URL=postgresql://user:password@localhost:5432/fluxai  # PostgreSQL for production

# Authentication
NEXTAUTH_URL=http://localhost:4321
NEXTAUTH_SECRET=your-nextauth-secret-here

# API
NEXT_PUBLIC_API_URL=http://localhost:4321/api/v1

# Email (for verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@flux.ai.kr
```

## 📊 Development Status

### Completed ✅
- [x] Project setup with Next.js 14
- [x] TypeScript strict mode configuration
- [x] Tailwind CSS + Design system
- [x] Chart component library (Recharts)
- [x] Dashboard UI components
- [x] Responsive design (Mobile/Tablet/Desktop)
- [x] Real-time WebSocket integration
- [x] Period-based data filtering
- [x] Returns calculation system
- [x] Alert notification system
- [x] Authentication system (NextAuth.js)
- [x] Database integration (Prisma + SQLite)
- [x] RESTful API v1 implementation
- [x] Portfolio management features
- [x] Transaction tracking
- [x] Backtesting engine with strategies
- [x] Market data integration
- [x] PDF report generation
- [x] Protected routes middleware
- [x] Dark mode support (next-themes)
- [x] Global search functionality
- [x] CSRF protection
- [x] Security headers & audit logging
- [x] Email verification system
- [x] Input validation & sanitization

### In Progress 🚧
- [ ] Risk management features (VaR, Sharpe ratio)
- [ ] AI/ML integration for predictions
- [ ] Advanced backtesting strategies
- [ ] Real broker API integration
- [ ] Production database migration (PostgreSQL)

### Planned 📋
- [ ] Advanced analytics dashboard
- [ ] Automated trading execution
- [ ] Options trading support
- [ ] Multi-language support (Korean/English)
- [ ] Mobile app (React Native)
- [ ] Public API documentation
- [ ] Performance optimization
- [ ] Social trading features
- [ ] Tax reporting
- [ ] Cryptocurrency support

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