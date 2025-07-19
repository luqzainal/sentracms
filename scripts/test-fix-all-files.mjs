#!/usr/bin/env node

async function testFixAllFilesEndpoint() {
  try {
    console.log('🧪 Testing fix-all-files endpoint...\n');
    
    const response = await fetch('http://localhost:3001/fix-all-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success!');
      console.log('📋 Response data:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:');
      console.log('   Status:', response.status);
      console.log('   Text:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Make sure API server is running: npm run start-api');
    console.log('   2. Check if port 3001 is available');
    console.log('   3. Check environment variables');
  }
}

testFixAllFilesEndpoint().catch(console.error); 