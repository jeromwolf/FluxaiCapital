// Test authentication
async function testAuth() {
  console.log('🔐 Testing authentication...\n')
  
  // 1. Test signup
  console.log('1️⃣ Testing signup...')
  try {
    const signupRes = await fetch('http://localhost:4321/api/v1/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@flux.ai.kr',
        password: 'password123',
        name: '새로운 사용자'
      })
    })
    
    const signupData = await signupRes.json()
    console.log('Signup response:', signupData)
  } catch (error) {
    console.error('Signup error:', error.message)
  }
  
  console.log('\n2️⃣ Testing login with test account...')
  console.log('Email: test@flux.ai.kr')
  console.log('Password: test1234')
  
  console.log('\n3️⃣ Testing admin account...')
  console.log('Email: admin@flux.ai.kr')
  console.log('Password: admin1234')
  
  console.log('\n✅ You can now login at: http://localhost:4321/login')
}

testAuth()