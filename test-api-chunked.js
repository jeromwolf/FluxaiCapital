async function testChunkedResponse() {
  const urls = [
    'http://localhost:4321/api/auth/providers',
    'http://localhost:4321/api/v1/market/dart?action=disclosures&stockCode=005930',
    'http://localhost:4321/api/v1/social/sentiment/AAPL',
    'http://localhost:4321/api/test-dart'
  ];

  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    console.log('-'.repeat(60));
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Transfer-Encoding: ${response.headers.get('transfer-encoding')}`);

      // Read the response body
      const text = await response.text();
      console.log(`Response length: ${text.length} bytes`);
      
      if (text.length > 0) {
        console.log('Response content:');
        
        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          console.log(JSON.stringify(json, null, 2));
        } catch {
          // If not JSON, show as text
          console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        }
      } else {
        console.log('Empty response body');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

testChunkedResponse().catch(console.error);