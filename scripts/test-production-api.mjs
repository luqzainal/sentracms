import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing production API endpoint for file upload...\n');

// Test different API endpoints
const apiEndpoints = [
  'http://localhost:3001/api/generate-upload-url',
  'https://www.sentra.vip/api/generate-upload-url',
  'https://sentra.vip/api/generate-upload-url',
];

async function testAPIEndpoint(url) {
  try {
    console.log(`🔗 Testing API endpoint: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: 'test-production-upload.txt',
        fileType: 'text/plain',
      }),
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success: ${data.uploadUrl ? 'Upload URL generated' : 'No upload URL'}`);
      console.log(`   File URL: ${data.fileUrl || 'Not provided'}`);
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Error: ${errorText.substring(0, 200)}...`);
    }
    
    console.log('');
    
  } catch (error) {
    console.log(`   ❌ Network Error: ${error.message}`);
    console.log('');
  }
}

async function testAllEndpoints() {
  console.log('📋 Testing all API endpoints...\n');
  
  for (const endpoint of apiEndpoints) {
    await testAPIEndpoint(endpoint);
  }
  
  console.log('🎉 API endpoint testing completed!');
  console.log('');
  console.log('📝 Summary:');
  console.log('   • Localhost should work for development');
  console.log('   • Production endpoints need proper deployment');
  console.log('   • Check if API server is running on production');
  console.log('');
  console.log('🔧 Next steps:');
  console.log('   1. Ensure API server is deployed to production');
  console.log('   2. Verify environment variables on production server');
  console.log('   3. Check production server logs for errors');
}

testAllEndpoints(); 