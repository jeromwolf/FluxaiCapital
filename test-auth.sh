#!/bin/bash

echo "🔐 FLUX AI Capital 인증 테스트"
echo "================================"

# CSRF 토큰 가져오기
echo -e "\n1. CSRF 토큰 획득..."
CSRF_RESPONSE=$(curl -s http://localhost:4321/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | jq -r '.csrfToken')
echo "✅ CSRF 토큰: ${CSRF_TOKEN:0:20}..."

# 로그인 테스트
echo -e "\n2. 로그인 테스트 (test@flux.ai.kr)..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4321/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=test@flux.ai.kr&password=test123&csrfToken=$CSRF_TOKEN" \
  -c cookies.txt \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
echo "📌 응답 코드: $HTTP_CODE"

if [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 로그인 성공!"
  
  # 세션 확인
  echo -e "\n3. 세션 확인..."
  SESSION_RESPONSE=$(curl -s http://localhost:4321/api/auth/session -b cookies.txt)
  echo "📌 세션 정보:"
  echo "$SESSION_RESPONSE" | jq '.'
  
  # 대시보드 접근 테스트
  echo -e "\n4. 대시보드 접근 테스트..."
  DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ko/dashboard -b cookies.txt)
  echo "📌 대시보드 응답 코드: $DASHBOARD_CODE"
  
  # API 테스트
  echo -e "\n5. API 엔드포인트 테스트..."
  
  echo -e "\n   - Portfolio API:"
  curl -s http://localhost:4321/api/v1/portfolios -b cookies.txt | jq '.' 2>/dev/null || echo "❌ 오류"
  
  echo -e "\n   - Social Sentiment API (AAPL):"
  curl -s http://localhost:4321/api/v1/social/sentiment/AAPL -b cookies.txt | jq '.' 2>/dev/null || echo "❌ 오류"
  
else
  echo "❌ 로그인 실패"
  echo "$LOGIN_RESPONSE" | head -n -1
fi

# 정리
rm -f cookies.txt

echo -e "\n✅ 테스트 완료"