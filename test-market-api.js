// Test market data APIs
const baseUrl = 'http://localhost:4321/api/v1'

async function testMarketAPIs() {
  console.log('📈 Testing Market Data APIs...\n')
  
  try {
    // 1. Test single price
    console.log('1️⃣ Testing single price endpoint...')
    const singlePriceRes = await fetch(`${baseUrl}/market/prices/NVDA`)
    const singlePrice = await singlePriceRes.json()
    console.log('NVDA Price:', singlePrice.data)
    console.log('')
    
    // 2. Test multiple prices
    console.log('2️⃣ Testing multiple prices endpoint...')
    const symbols = ['AAPL', 'MSFT', 'GOOGL', '005930', '035420']
    const multiPriceRes = await fetch(`${baseUrl}/market/prices?symbols=${symbols.join(',')}`)
    const multiPrice = await multiPriceRes.json()
    console.log(`Found ${multiPrice.count} prices:`)
    multiPrice.data.forEach(price => {
      console.log(`  ${price.symbol}: ${price.price} ${price.currency} (${price.changePercent >= 0 ? '+' : ''}${price.changePercent.toFixed(2)}%)`)
    })
    console.log('')
    
    // 3. Test candle data
    console.log('3️⃣ Testing candle data endpoint...')
    const candleRes = await fetch(`${baseUrl}/market/candles/NVDA?interval=1h&count=10`)
    const candleData = await candleRes.json()
    console.log(`Received ${candleData.data.candles.length} candles for ${candleData.data.symbol}`)
    const lastCandle = candleData.data.candles[candleData.data.candles.length - 1]
    console.log('Latest candle:', {
      time: new Date(lastCandle.timestamp).toLocaleString(),
      open: lastCandle.open,
      high: lastCandle.high,
      low: lastCandle.low,
      close: lastCandle.close,
      volume: lastCandle.volume
    })
    console.log('')
    
    // 4. Test holdings price update
    console.log('4️⃣ Testing holdings price update...')
    // First get portfolios
    const portfoliosRes = await fetch(`${baseUrl}/portfolios`)
    const portfolios = await portfoliosRes.json()
    
    if (portfolios.data.length > 0) {
      const portfolioId = portfolios.data[0].id
      const updateRes = await fetch(`${baseUrl}/portfolios/${portfolioId}/holdings/update-prices`, {
        method: 'POST'
      })
      const updateResult = await updateRes.json()
      console.log('Update result:', updateResult.data)
    }
    
    console.log('\n✅ All market API tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests
testMarketAPIs()