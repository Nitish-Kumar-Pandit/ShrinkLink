#!/usr/bin/env node

// Test script to verify production API endpoints
const API_BASE = 'https://shrinklink-qvez.onrender.com';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  console.log(`\n🔄 Testing ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://sl.nitishh.in'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const text = await response.text();
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log(`📊 JSON: ${JSON.stringify(json, null, 2).substring(0, 300)}`);
    } catch (e) {
      console.log(`⚠️  Not valid JSON: ${e.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing ShrinkLink Production API');
  console.log(`🌐 Base URL: ${API_BASE}`);
  
  // Test health endpoint
  await testEndpoint('/api/health');
  
  // Test anonymous usage endpoint
  await testEndpoint('/api/create/anonymous-usage');
  
  // Test auth me endpoint (should return 401)
  await testEndpoint('/api/auth/me');
  
  // Test create endpoint with invalid data (should return validation error)
  await testEndpoint('/api/create', 'POST', { url: 'invalid-url' });
  
  console.log('\n✨ Tests completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };
