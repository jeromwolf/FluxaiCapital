#!/bin/bash

echo "🔐 FLUX AI Capital 세션 테스트"
echo "================================"

# 1. NextAuth 기본 로그인 페이지 확인
echo -e "\n1. NextAuth 로그인 페이지 확인..."
LOGIN_PAGE=$(curl -s http://localhost:4321/api/auth/signin)
if [[ $LOGIN_PAGE == *"Sign in"* ]] || [[ $LOGIN_PAGE == *"Email"* ]]; then
  echo "✅ NextAuth 로그인 페이지 정상 작동"
else
  echo "❌ 로그인 페이지 문제 발생"
fi

# 2. CSRF 토큰 가져오기
echo -e "\n2. CSRF 토큰 획득..."
CSRF_JSON=$(curl -s -c cookies.txt http://localhost:4321/api/auth/csrf)
CSRF_TOKEN=$(echo $CSRF_JSON | jq -r '.csrfToken')
echo "✅ CSRF 토큰: ${CSRF_TOKEN:0:20}..."

# 3. Credentials 로그인
echo -e "\n3. Credentials 로그인 (test@flux.ai.kr)..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4321/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat cookies.txt | grep csrfToken | awk '{print $6"="$7}')" \
  -d "{\"email\":\"test@flux.ai.kr\",\"password\":\"test123\",\"csrfToken\":\"$CSRF_TOKEN\",\"json\":\"true\"}" \
  -c cookies.txt \
  -b cookies.txt \
  -w "\n%{http_code}" \
  -L)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)
echo "📌 응답 코드: $HTTP_CODE"

# 4. 세션 확인
echo -e "\n4. 세션 정보 확인..."
SESSION=$(curl -s http://localhost:4321/api/auth/session -b cookies.txt)
echo "📌 세션 데이터:"
echo "$SESSION" | jq '.'

# 5. 보호된 경로 테스트
echo -e "\n5. 보호된 경로 접근 테스트..."

echo -e "\n   - 대시보드 (한국어):"
DASHBOARD_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/ko/dashboard -b cookies.txt -L)
echo "   응답 코드: $DASHBOARD_CODE"

echo -e "\n   - Portfolio API:"
PORTFOLIO=$(curl -s http://localhost:4321/api/v1/portfolios -b cookies.txt)
echo "   응답: $(echo $PORTFOLIO | jq '.' 2>/dev/null || echo $PORTFOLIO | head -c 100)"

# 6. 쿠키 확인
echo -e "\n6. 설정된 쿠키:"
cat cookies.txt | grep -E "(next-auth|session)" | awk '{print "   - "$6": "substr($7,1,20)"..."}'

# 정리
rm -f cookies.txt

echo -e "\n✅ 테스트 완료"