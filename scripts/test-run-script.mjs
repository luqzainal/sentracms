#!/usr/bin/env node

async function testRunScriptEndpoint() {
  try {
    console.log('🧪 Testing run-script endpoint...\n');
    
    const response = await fetch('http://localhost:3001/run-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        script: 'quick-fix-files',
        description: 'Test fix ACL for all files'
      }),
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success!');
      console.log('📋 Response data:', result);
      
      if (result.fixedCount) {
        console.log(`🎉 Fixed ${result.fixedCount} files successfully!`);
      }
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

testRunScriptEndpoint().catch(console.error); 