# FLUX AI Capital 환경 변수 설정 가이드

## 개요
이 문서는 FLUX AI Capital 프로젝트를 로컬 환경에서 실행하기 위한 환경 변수 설정 가이드입니다.

## 필수 환경 변수

### 1. 기본 설정
```bash
# Application
NEXT_PUBLIC_APP_NAME="FLUX AI Capital"
NEXT_PUBLIC_APP_URL="http://localhost:4321"
NEXT_PUBLIC_API_URL="http://localhost:4321/api"

# Authentication
NEXTAUTH_SECRET="development-secret-change-in-production"  # 프로덕션에서는 반드시 변경
NEXTAUTH_URL="http://localhost:4321"
```

### 2. 데이터베이스
```bash
# 개발 환경 (SQLite)
DATABASE_URL="file:./dev.db"

# 프로덕션 환경 (PostgreSQL) - 예시
# DATABASE_URL="postgresql://user:password@localhost:5432/fluxai?schema=public"
```

### 3. Supabase (선택사항)
현재는 NextAuth를 사용하지만, Supabase 연동 시 필요:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## 선택적 환경 변수

### 1. OAuth 프로바이더
```bash
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Kakao OAuth  
KAKAO_CLIENT_ID=""
KAKAO_CLIENT_SECRET=""
```

### 2. 시장 데이터 API
현재 Mock 데이터를 사용하지만, 실제 API 연동 시:
```bash
# Alpha Vantage
ALPHA_VANTAGE_API_KEY=""

# DART (한국 공시)
DART_API_KEY=""

# Finnhub
FINNHUB_API_KEY=""

# Twelve Data
TWELVE_DATA_API_KEY=""

# 암호화폐
UPBIT_ACCESS_KEY=""
UPBIT_SECRET_KEY=""
BINANCE_API_KEY=""
BINANCE_SECRET_KEY=""
```

### 3. 소셜 미디어 API
```bash
# Twitter API v2
TWITTER_BEARER_TOKEN=""
TWITTER_API_KEY=""
TWITTER_API_SECRET=""
```

### 4. 이메일 서비스
```bash
# SendGrid
SENDGRID_API_KEY=""
EMAIL_FROM="noreply@flux.ai.kr"

# 또는 SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 5. 기타 서비스
```bash
# Redis (캐싱)
REDIS_URL="redis://localhost:6379"

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=""

# Error Tracking
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
```

## 설정 방법

1. **`.env.local` 파일 생성**
   ```bash
   cp .env.example .env.local
   ```

2. **필수 환경 변수 설정**
   - 최소한 `NEXTAUTH_SECRET`는 반드시 변경
   - 개발 환경에서는 나머지는 기본값 사용 가능

3. **데이터베이스 초기화**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 프로덕션 환경 준비

### 1. 보안 키 생성
```bash
# NEXTAUTH_SECRET 생성
openssl rand -base64 32
```

### 2. PostgreSQL 설정
1. PostgreSQL 데이터베이스 생성
2. `DATABASE_URL` 환경 변수 설정
3. Prisma 마이그레이션 실행:
   ```bash
   npx prisma migrate deploy
   ```

### 3. 외부 서비스 설정
1. **OAuth 프로바이더**
   - Google Cloud Console에서 OAuth 2.0 클라이언트 생성
   - Kakao Developers에서 애플리케이션 등록

2. **시장 데이터 API**
   - 각 서비스 가입 및 API 키 발급
   - 무료 티어로 시작 가능

3. **이메일 서비스**
   - SendGrid 가입 및 API 키 발급
   - 또는 Gmail SMTP 설정

## 문제 해결

### 1. 데이터베이스 연결 오류
```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 스키마 동기화
npx prisma db push
```

### 2. 인증 오류
- `NEXTAUTH_SECRET`이 설정되었는지 확인
- `NEXTAUTH_URL`이 올바른지 확인

### 3. API 키 오류
- Mock 데이터 사용 중인지 확인 (`src/lib/market/client.ts`)
- API 키가 올바르게 설정되었는지 확인

## 개발 팁

1. **테스트 계정**
   ```
   - test@flux.ai.kr / test123
   - admin@flux.ai.kr / admin123
   - user@flux.ai.kr / user123
   ```

2. **Mock 데이터 모드**
   - 기본적으로 Mock 데이터 사용
   - 실제 API 연동 시 provider 변경 필요

3. **환경별 설정**
   - `.env.local`: 로컬 개발
   - `.env.production`: 프로덕션
   - `.env.test`: 테스트

## 참고 자료
- [Next.js 환경 변수](https://nextjs.org/docs/basic-features/environment-variables)
- [NextAuth.js 설정](https://next-auth.js.org/configuration/options)
- [Prisma 환경 변수](https://www.prisma.io/docs/reference/database-reference/connection-urls)