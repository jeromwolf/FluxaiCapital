#!/bin/bash

echo "🧪 FLUX AI Capital 기능 테스트"
echo "================================"

# 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 인증되지 않은 상태에서 API 테스트
echo -e "\n${YELLOW}1. 인증되지 않은 상태 테스트${NC}"
echo "--------------------------------"

echo -e "\n📍 소셜 감정 분석 API (AAPL):"
SENTIMENT=$(curl -s -w "\n%{http_code}" http://localhost:4321/api/v1/social/sentiment/AAPL)
HTTP_CODE=$(echo "$SENTIMENT" | tail -n 1)
if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ 성공 (Mock 데이터)${NC}"
  echo "$SENTIMENT" | head -n -1 | jq '.score, .sentiment' 2>/dev/null || echo "파싱 오류"
else
  echo -e "${RED}❌ 실패 (코드: $HTTP_CODE)${NC}"
fi

echo -e "\n📍 API 키 목록 (인증 필요):"
API_KEYS=$(curl -s -w "\n%{http_code}" http://localhost:4321/api/v1/api-keys)
HTTP_CODE=$(echo "$API_KEYS" | tail -n 1)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "307" ]; then
  echo -e "${GREEN}✅ 예상대로 인증 거부${NC}"
else
  echo -e "${RED}❌ 예상치 못한 응답 (코드: $HTTP_CODE)${NC}"
fi

# 2. DART API 테스트
echo -e "\n${YELLOW}2. DART 공시 API 테스트${NC}"
echo "------------------------"

echo -e "\n📍 DART 공시 조회 (삼성전자):"
DART=$(curl -s "http://localhost:4321/api/v1/market/dart?action=disclosures&stockCode=005930" | jq '.' 2>/dev/null)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ 성공${NC}"
  echo "$DART" | jq '.disclosures[0] | {title, date}' 2>/dev/null || echo "데이터 없음"
else
  echo -e "${RED}❌ 실패${NC}"
fi

# 3. 시장 데이터 API 테스트
echo -e "\n${YELLOW}3. 시장 데이터 API 테스트${NC}"
echo "-------------------------"

echo -e "\n📍 캔들 데이터 조회:"
CANDLES=$(curl -s "http://localhost:4321/api/v1/market/candles?symbol=AAPL&interval=1d&limit=5")
if [[ $CANDLES == *"time"* ]] || [[ $CANDLES == *"open"* ]]; then
  echo -e "${GREEN}✅ 성공${NC}"
  echo "$CANDLES" | jq '.[0] | {time, open, close}' 2>/dev/null || echo "데이터 구조 확인 필요"
else
  echo -e "${RED}❌ 실패${NC}"
fi

# 4. 다국어 지원 테스트
echo -e "\n${YELLOW}4. 다국어 지원 테스트${NC}"
echo "---------------------"

echo -e "\n📍 한국어 페이지 (/ko):"
KO_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ko)
if [ "$KO_REDIRECT" = "307" ]; then
  echo -e "${GREEN}✅ 정상 리다이렉트${NC}"
else
  echo -e "${RED}❌ 리다이렉트 실패 (코드: $KO_REDIRECT)${NC}"
fi

echo -e "\n📍 영어 페이지 (/en):"
EN_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/en)
if [ "$EN_REDIRECT" = "307" ]; then
  echo -e "${GREEN}✅ 정상 리다이렉트${NC}"
else
  echo -e "${RED}❌ 리다이렉트 실패 (코드: $EN_REDIRECT)${NC}"
fi

# 5. 전략 API 테스트
echo -e "\n${YELLOW}5. 전략 관리 API 테스트${NC}"
echo "-----------------------"

echo -e "\n📍 전략 목록 조회:"
STRATEGIES=$(curl -s -w "\n%{http_code}" http://localhost:4321/api/v1/strategies)
HTTP_CODE=$(echo "$STRATEGIES" | tail -n 1)
echo "응답 코드: $HTTP_CODE"

echo -e "\n${GREEN}✅ 테스트 완료!${NC}"
echo -e "\n📌 브라우저에서 다음 URL로 접속하여 UI를 확인하세요:"
echo "   - http://localhost:4321 (자동으로 로그인 페이지로 이동)"
echo "   - 테스트 계정: test@flux.ai.kr / test123"