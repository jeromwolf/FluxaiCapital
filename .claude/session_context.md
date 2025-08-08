# FLUX AI Capital - Session Context

## 최근 작업 내용 (Week 6)

### 구현 완료된 기능:

#### 1. 다크모드 (Dark Mode) ✅
- **라이브러리**: next-themes
- **테마 옵션**: 라이트/다크/시스템
- **구현 파일**:
  - `/src/components/providers/theme-provider.tsx` - 테마 프로바이더
  - `/src/components/ui/theme-toggle.tsx` - 테마 토글 버튼
  - `/src/app/layout.tsx` - suppressHydrationWarning 추가
  - `/src/components/layout/Header.tsx` - 헤더에 토글 추가

#### 2. 검색 기능 (Search) ✅
- **전역 검색**: 페이지 및 종목 검색
- **키보드 단축키**: Cmd/Ctrl+K
- **구현 파일**:
  - `/src/components/layout/SearchBar.tsx` - 검색 컴포넌트
  - `/src/components/layout/Header.tsx` - 헤더에 검색바 추가

#### 3. 보안 강화 (Security) ✅

##### CSRF 보호:
- `/src/lib/security/csrf.ts` - CSRF 토큰 생성/검증
- `/src/hooks/useCSRF.ts` - 클라이언트 CSRF 훅
- `/src/lib/api/fetch.ts` - API 클라이언트 (CSRF 토큰 자동 포함)
- `/src/lib/api/middleware.ts` - API 라우트 미들웨어
- `/middleware.ts` - CSRF 토큰 자동 생성

##### 보안 헤더:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

##### 감사 로그:
- `/src/lib/security/audit.ts` - 감사 로그 시스템
- 로그인 성공/실패 추적
- 데이터 접근 기록 (CRUD 작업)
- 보안 이벤트 로깅

##### 입력값 검증:
- `/src/lib/security/validation.ts` - 검증 유틸리티
- DOMPurify를 이용한 HTML 살균
- SQL 인젝션 방지
- XSS 방지

#### 4. 이메일 인증 ✅
- `/src/lib/email/verification.ts` - 이메일 전송 서비스
- `/src/app/api/auth/verify-email/route.ts` - 인증 API
- nodemailer를 사용한 이메일 발송
- HTML 템플릿 포함

#### 5. 새로운 페이지들 ✅
- `/src/app/stocks/` - 주식 목록 페이지
- `/src/app/reports/` - 리포트 페이지
- `/src/app/settings/` - 설정 페이지 (프로필, 알림, 보안, 테마)
- `/src/app/notifications/` - 알림 페이지
- `/src/app/help/` - 도움말 페이지

#### 6. 레이아웃 수정 ✅
모든 페이지에 DashboardLayout 추가하여 네비게이션 문제 해결

## 환경 변수 추가사항

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@flux.ai.kr
```

## 설치된 패키지

```bash
npm install next-themes --legacy-peer-deps
npm install csrf --legacy-peer-deps
npm install isomorphic-dompurify @types/dompurify --legacy-peer-deps
```

## 남은 작업

1. **다국어 지원**: 한국어/영어 전환
2. **모바일 최적화**: 반응형 디자인 완성
3. **API 키 관리**: 보안 키 관리 시스템
4. **성능 최적화**: 번들 크기 감소, 로딩 속도 개선

## 테스트 계정

1. **개발자 계정**
   - Email: dev@example.com
   - Password: dev123

2. **테스트 계정**
   - Email: test@example.com
   - Password: test123

3. **관리자 계정**
   - Email: admin@example.com
   - Password: admin123

## 개발 서버 실행

```bash
# 포트 충돌 방지 스크립트
./dev.sh

# 또는 직접 실행
npm run dev
```

서버는 http://localhost:4321 에서 실행됩니다.

## Git 커밋 정보

최근 커밋: `feat: Week 6 - Security, Dark Mode, Search & Email Verification`
- 66 files changed
- 3,596 insertions
- 126 deletions

## 주요 문제 해결 이력

1. **로그인 문제**: seed 데이터의 비밀번호와 개발 로그인 페이지의 비밀번호 불일치 → 비밀번호 통일
2. **네비게이션 없음**: 각 페이지에 DashboardLayout 누락 → 모든 페이지에 레이아웃 추가
3. **TypeScript 에러**: Prisma Decimal 타입 → decimal-converter 유틸리티 생성
4. **패키지 충돌**: peer dependency 에러 → --legacy-peer-deps 사용

## 다음 세션 연결 시

이 파일의 내용을 참고하여 현재 상태를 파악하고 작업을 이어갈 수 있습니다.