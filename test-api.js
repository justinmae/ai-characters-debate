// Simple script to test API routes
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api',
  '/api/text-to-speech',
  '/api/news'
];

async function testEndpoints() {
  console.log('Starting API tests...');
  console.log('API Base URL:', API_BASE_URL);
  
  for (const endpoint of TEST_ENDPOINTS) {
    try {
      console.log(`\nTesting GET ${endpoint}...`);
      console.log(`Full URL: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const status = response.status;
      console.log(`  Status: ${status}`);
      
      let responseText = await response.text();
      console.log(`  Response Length: ${responseText.length}`);
      
      try {
        // Try to parse as JSON if possible
        const data = JSON.parse(responseText);
        console.log(`  Data: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        // Not JSON, just log as text
        console.log(`  Response is not valid JSON`);
        console.log(`  Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
      }
    } catch (error) {
      console.error(`  Error testing ${endpoint}:`, error);
    }
  }
  
  // Test text-to-speech POST endpoint
  try {
    console.log('\nTesting POST /api/text-to-speech...');
    console.log(`Full URL: ${API_BASE_URL}/api/text-to-speech`);
    
    const body = {
      text: 'Hello world test',
      voiceId: 'IKne3meq5aSn9XLyUdCD' // Sample voice ID
    };
    
    console.log(`  Request Body: ${JSON.stringify(body, null, 2)}`);
    
    const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    console.log(`  Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`  Response Length: ${responseText.length}`);
    
    try {
      // Try to parse as JSON if possible
      const data = JSON.parse(responseText);
      if (data.audioContent) {
        console.log(`  Response contains audio content (length: ${data.audioContent.length})`);
      } else {
        console.log(`  Response: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (e) {
      // Not JSON, just log as text
      console.log(`  Response is not valid JSON`);
      console.log(`  Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    }
  } catch (error) {
    console.error('  Error testing POST /api/text-to-speech:', error);
  }
}

testEndpoints().catch(console.error); 