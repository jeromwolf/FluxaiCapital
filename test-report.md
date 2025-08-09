# FLUX AI Capital URL 테스트 보고서

## 테스트 환경
- **서버**: Next.js 15.4.6 (Turbopack)
- **포트**: 4321
- **날짜**: 2025-08-09

## 테스트 URL 및 예상 동작

### 1. 기본 페이지 (http://localhost:4321)
- **예상 동작**: `/dashboard`로 리다이렉트
- **실제 동작**: 인증이 필요하므로 로그인 페이지로 이동될 것으로 예상
- **테스트 방법**: 
  1. 브라우저에서 http://localhost:4321 접속
  2. 리다이렉트 확인

### 2. 한국어 대시보드 (http://localhost:4321/ko/dashboard)
- **예상 동작**: 인증된 경우 한국어 대시보드 표시
- **인증 필요**: 예
- **테스트 방법**:
  1. 먼저 http://localhost:4321/dev-login 에서 로그인
  2. 테스트 계정 사용 (admin@flux.ai.kr / admin123)
  3. 로그인 후 http://localhost:4321/ko/dashboard 접속

### 3. 영어 대시보드 (http://localhost:4321/en/dashboard)
- **예상 동작**: 인증된 경우 영어 대시보드 표시
- **인증 필요**: 예
- **언어 전환**: 헤더의 언어 토글 버튼 사용

### 4. API 키 관리 (http://localhost:4321/ko/dashboard/api-keys)
- **예상 동작**: API 키 관리 페이지 표시
- **인증 필요**: 예
- **참고**: 이 경로는 `/ko/settings/api-keys`일 가능성이 높음

### 5. 소셜 감정 분석 (http://localhost:4321/ko/dashboard/sentiment)
- **예상 동작**: 소셜 감정 분석 대시보드 표시
- **인증 필요**: 예
- **기능**: 실시간 소셜 미디어 감정 분석 차트

## 개발 서버 접속 방법

1. 터미널에서 개발 서버 시작:
   ```bash
   npm run dev
   # 또는
   ./dev.sh
   ```

2. 브라우저에서 http://localhost:4321/dev-login 접속

3. 테스트 계정으로 로그인:
   - **관리자**: admin@flux.ai.kr / admin123 (모든 기능 접근 가능)
   - **일반 사용자**: user@flux.ai.kr / user123 (기본 포트폴리오 기능)
   - **테스트**: test@flux.ai.kr / test123 (제한된 기능)

4. 로그인 후 각 URL 테스트

## 주요 기능 확인 사항

### 언어 전환 기능
- 헤더에 언어 토글 버튼 확인
- 한국어(KO) ↔ 영어(EN) 전환 동작 확인
- URL의 locale 파라미터 변경 확인

### 대시보드 기능
- 포트폴리오 현황 표시
- 차트 컴포넌트 렌더링
- 실시간 데이터 업데이트 (WebSocket)
- 반응형 디자인 (모바일/태블릿/데스크톱)

### API 키 관리
- API 키 생성/삭제 기능
- 권한 설정
- 사용 현황 표시

### 소셜 감정 분석
- 실시간 감정 지표
- 트렌드 차트
- 키워드 분석

## 미들웨어 보안 설정

프로젝트에는 다음과 같은 보안 설정이 적용되어 있습니다:
- NextAuth 인증
- CSRF 토큰 보호
- 보안 헤더 (X-Frame-Options, X-Content-Type-Options 등)
- 이메일 인증 확인

## 추가 테스트 가능한 페이지

- `/market` - 시장 데이터
- `/portfolio` - 포트폴리오 관리
- `/settings` - 설정
- `/backtest` - 백테스트
- `/reports` - 리포트
- `/stocks/[symbol]` - 개별 종목 정보

모든 페이지는 인증이 필요하며, 개발 환경에서는 `/dev-login`을 통해 빠르게 로그인할 수 있습니다.