// Simple API test script
const baseUrl = 'http://localhost:4321/api/v1'

async function testAPI() {
  console.log('🧪 Starting API tests...\n')
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...')
    const dbTest = await fetch(`${baseUrl}/test-db`)
    const dbResult = await dbTest.json()
    console.log('✅ Database:', dbResult.data)
    console.log('')
    
    // 2. Get all users
    console.log('2️⃣ Getting all users...')
    const usersRes = await fetch(`${baseUrl}/users`)
    const users = await usersRes.json()
    console.log(`✅ Found ${users.data.length} users:`)
    users.data.forEach(user => {
      console.log(`   - ${user.email} (${user.name}) - ${user._count.portfolios} portfolios`)
    })
    console.log('')
    
    // 3. Get all portfolios
    console.log('3️⃣ Getting all portfolios...')
    const portfoliosRes = await fetch(`${baseUrl}/portfolios`)
    const portfolios = await portfoliosRes.json()
    console.log(`✅ Found ${portfolios.data.length} portfolios:`)
    portfolios.data.forEach(portfolio => {
      console.log(`   - ${portfolio.name} (${portfolio.user.email}) - ${portfolio._count.holdings} holdings`)
    })
    console.log('')
    
    // 4. Get holdings for first portfolio
    if (portfolios.data.length > 0) {
      const portfolioId = portfolios.data[0].id
      console.log(`4️⃣ Getting holdings for portfolio: ${portfolios.data[0].name}`)
      const holdingsRes = await fetch(`${baseUrl}/portfolios/${portfolioId}/holdings`)
      const holdings = await holdingsRes.json()
      console.log(`✅ Found ${holdings.data.holdings.length} holdings:`)
      holdings.data.holdings.forEach(holding => {
        console.log(`   - ${holding.symbol}: ${holding.quantity} shares @ ${holding.currentPrice} = ${holding.marketValue}`)
      })
      console.log(`\n📊 Portfolio Summary:`)
      console.log(`   Total Value: ${holdings.data.summary.totalValue.toLocaleString()} KRW`)
      console.log(`   Total PnL: ${holdings.data.summary.totalUnrealizedPnL.toLocaleString()} KRW`)
      console.log(`   Total Return: ${holdings.data.summary.totalReturn.toFixed(2)}%`)
    }
    
    console.log('\n✅ All API tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests
testAPI()