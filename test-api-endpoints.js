// Using native fetch in Node.js 18+

async function testEndpoints() {
  const baseUrl = 'http://localhost:4321';
  const endpoints = [
    { path: '/api/auth/providers', method: 'GET', name: 'Auth Providers' },
    { path: '/api/v1/market/dart/disclosure', method: 'GET', name: 'DART Disclosure' },
    { path: '/api/v1/social/sentiment/AAPL', method: 'GET', name: 'Social Sentiment (AAPL)' },
    { path: '/api/test-dart', method: 'GET', name: 'Test DART' }
  ];

  console.log('Testing API Endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}: ${endpoint.method} ${endpoint.path}`);
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        const text = await response.text();
        console.log('Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      }
      
      console.log('---\n');
    } catch (error) {
      console.error(`Error testing ${endpoint.name}:`, error.message);
      console.log('---\n');
    }
  }
}

testEndpoints().catch(console.error);