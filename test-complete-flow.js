// Complete flow test
const baseUrl = 'http://localhost:4321/api/v1'

async function testCompleteFlow() {
  console.log('🧪 Testing Complete FLUX AI Capital Flow...\n')
  
  try {
    // 1. Get portfolios
    console.log('1️⃣ Getting portfolios...')
    const portfoliosRes = await fetch(`${baseUrl}/portfolios`)
    const portfolios = await portfoliosRes.json()
    console.log(`Found ${portfolios.data.length} portfolios`)
    
    if (portfolios.data.length === 0) {
      console.log('No portfolios found. Please create one first.')
      return
    }
    
    const portfolio = portfolios.data[0]
    console.log(`Using portfolio: ${portfolio.name} (${portfolio.id})`)
    console.log('')
    
    // 2. Test adding a transaction
    console.log('2️⃣ Testing transaction creation...')
    const transactionRes = await fetch(`${baseUrl}/portfolios/${portfolio.id}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'BUY',
        symbol: 'AAPL',
        quantity: 5,
        price: 175,
        fee: 1.5,
        notes: 'Test purchase',
        executedAt: new Date().toISOString()
      })
    })
    
    if (transactionRes.ok) {
      const transaction = await transactionRes.json()
      console.log('✅ Transaction created successfully')
    } else {
      const error = await transactionRes.json()
      console.log('❌ Transaction failed:', error.message)
    }
    console.log('')
    
    // 3. Get updated holdings
    console.log('3️⃣ Getting updated holdings...')
    const holdingsRes = await fetch(`${baseUrl}/portfolios/${portfolio.id}/holdings`)
    const holdings = await holdingsRes.json()
    console.log(`Portfolio has ${holdings.data.holdings.length} holdings:`)
    holdings.data.holdings.forEach(h => {
      console.log(`  - ${h.symbol}: ${h.quantity} shares, PnL: ${h.unrealizedPnL}`)
    })
    console.log(`Total Value: ${holdings.data.summary.totalValue.toLocaleString()}`)
    console.log(`Total Return: ${holdings.data.summary.totalReturn.toFixed(2)}%`)
    console.log('')
    
    // 4. Update prices
    console.log('4️⃣ Updating holdings prices...')
    const updateRes = await fetch(`${baseUrl}/portfolios/${portfolio.id}/holdings/update-prices`, {
      method: 'POST'
    })
    const updateResult = await updateRes.json()
    if (updateResult.success) {
      console.log(`✅ Updated ${updateResult.data.updated} holdings`)
      console.log(`New total value: ${updateResult.data.summary.totalValue.toLocaleString()}`)
    }
    console.log('')
    
    // 5. Test market data for holdings
    console.log('5️⃣ Testing real-time prices for holdings...')
    const symbols = holdings.data.holdings.map(h => h.symbol).join(',')
    const pricesRes = await fetch(`${baseUrl}/market/prices?symbols=${symbols}`)
    const prices = await pricesRes.json()
    console.log('Current market prices:')
    prices.data.forEach(p => {
      console.log(`  - ${p.symbol}: ${p.price} ${p.currency} (${p.changePercent >= 0 ? '+' : ''}${p.changePercent.toFixed(2)}%)`)
    })
    
    console.log('\n✅ All tests completed successfully!')
    console.log('\n📊 You can now check:')
    console.log('- Dashboard: http://localhost:4321/dashboard')
    console.log('- Portfolio: http://localhost:4321/portfolio/' + portfolio.id)
    console.log('- Market: http://localhost:4321/market')
    console.log('- Stock Chart: http://localhost:4321/stocks/NVDA')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests
testCompleteFlow()