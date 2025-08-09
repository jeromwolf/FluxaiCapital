// 로그인 테스트 스크립트

async function testLogin() {
  console.log('🔐 FLUX AI Capital 로그인 테스트 시작...\n');
  
  const testAccounts = [
    { email: 'test@flux.ai.kr', password: 'test123', name: '테스트 계정' },
    { email: 'admin@flux.ai.kr', password: 'admin123', name: '관리자 계정' },
    { email: 'user@flux.ai.kr', password: 'user123', name: '일반 사용자 계정' }
  ];

  for (const account of testAccounts) {
    console.log(`\n📧 ${account.name} 테스트 (${account.email})`);
    console.log('─'.repeat(50));
    
    try {
      // 1. CSRF 토큰 가져오기
      const csrfResponse = await fetch('http://localhost:4321/api/auth/csrf');
      const csrfData = await csrfResponse.json();
      console.log('✅ CSRF 토큰 획득:', csrfData.csrfToken ? '성공' : '실패');
      
      // 2. 로그인 시도
      const loginResponse = await fetch('http://localhost:4321/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          csrfToken: csrfData.csrfToken
        })
      });
      
      const result = await loginResponse.text();
      console.log('📌 응답 상태:', loginResponse.status);
      console.log('📌 응답 헤더:', loginResponse.headers.get('set-cookie') ? '쿠키 설정됨' : '쿠키 없음');
      
      if (loginResponse.ok || loginResponse.status === 302) {
        console.log('✅ 로그인 성공!');
      } else {
        console.log('❌ 로그인 실패:', result.substring(0, 100));
      }
      
    } catch (error) {
      console.log('❌ 오류 발생:', error.message);
    }
  }
  
  console.log('\n\n📊 API 엔드포인트 테스트');
  console.log('─'.repeat(50));
  
  // API 테스트
  const apiEndpoints = [
    '/api/v1/portfolios',
    '/api/v1/market/prices/AAPL',
    '/api/v1/users'
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`http://localhost:4321${endpoint}`);
      const data = await response.json();
      console.log(`\n${endpoint}:`);
      console.log('상태:', response.status);
      console.log('응답:', JSON.stringify(data).substring(0, 100) + '...');
    } catch (error) {
      console.log(`\n${endpoint}: ❌ 오류 -`, error.message);
    }
  }
}

// 실행
testLogin().catch(console.error);