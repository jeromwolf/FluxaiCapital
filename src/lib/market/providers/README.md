# Market Data Providers

현재 FLUX AI Capital은 개발 및 테스트를 위해 Mock 데이터를 사용하고 있습니다.

## 현재 상태

- **Mock Provider**: 개발/테스트용 가상 시장 데이터
- **실시간 가격**: 랜덤 워크 + 평균회귀 알고리즘
- **지원 종목**: US 주식 7종, 한국 주식 7종

## 실제 API 연동 계획

### 1. Alpha Vantage (무료)

```env
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

- 일일 500 API 호출 제한
- 실시간 및 과거 데이터 제공
- [가입하기](https://www.alphavantage.co/support/#api-key)

### 2. Yahoo Finance (무료)

```typescript
// src/lib/market/providers/yahoo.ts
import yahooFinance from 'yahoo-finance2';
```

- API 키 불필요
- 실시간 가격 및 과거 데이터
- npm install yahoo-finance2

### 3. Korea Investment API (유료)

```env
KIS_APP_KEY=your_app_key_here
KIS_APP_SECRET=your_app_secret_here
```

- 한국 주식 실시간 데이터
- [한국투자증권 OpenAPI](https://apiportal.koreainvestment.com)

### 4. Polygon.io (프리미엄)

```env
POLYGON_API_KEY=your_api_key_here
```

- 고급 시장 데이터
- WebSocket 실시간 스트리밍
- [가입하기](https://polygon.io)

## 마이그레이션 가이드

1. `.env` 파일에 API 키 추가
2. `src/lib/market/providers/` 폴더에 provider 구현
3. `src/lib/market/client.ts`에서 provider 교체

```typescript
// 현재 (Mock)
import { MockMarketProvider } from './providers/mock';
const provider = new MockMarketProvider();

// 실제 API 연동 시
import { AlphaVantageProvider } from './providers/alphavantage';
const provider = new AlphaVantageProvider(process.env.ALPHA_VANTAGE_API_KEY);
```

## 주의사항

- API 키는 절대 커밋하지 마세요
- Rate limiting 처리 필수
- 에러 핸들링 및 폴백 구현
- 캐싱으로 API 호출 최소화
