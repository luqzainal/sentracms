#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🧪 Testing Production Endpoints\n');

const baseUrl = 'http://localhost:3001';

async function testEndpoints() {
  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    console.log('   Status:', healthRes.status);
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      console.log('   ✅ Health check successful:', healthData);
    } else {
      console.log('   ❌ Health check failed');
    }
    console.log('');

    // Test 2: Upload URL Generation
    console.log('2️⃣  Testing Upload URL Generation...');
    const uploadRes = await fetch(`${baseUrl}/api/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.sentra.vip'
      },
      body: JSON.stringify({
        fileName: 'test.txt',
        fileType: 'text/plain'
      })
    });
    
    console.log('   Status:', uploadRes.status);
    console.log('   Headers:', Object.fromEntries(uploadRes.headers.entries()));
    
    if (uploadRes.ok) {
      const uploadData = await uploadRes.json();
      console.log('   ✅ Upload URL generated successfully');
      console.log('   File name:', uploadData.fileName);
      console.log('   Public URL:', uploadData.publicUrl);
    } else {
      const errorText = await uploadRes.text();
      console.log('   ❌ Upload URL generation failed');
      console.log('   Error:', errorText);
    }
    console.log('');

    // Test 3: CORS Preflight
    console.log('3️⃣  Testing CORS Preflight...');
    const corsRes = await fetch(`${baseUrl}/api/generate-upload-url`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.sentra.vip',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('   Status:', corsRes.status);
    console.log('   CORS Headers:', {
      'access-control-allow-origin': corsRes.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': corsRes.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': corsRes.headers.get('access-control-allow-headers')
    });
    console.log('');

    // Test 4: Non-existent endpoint
    console.log('4️⃣  Testing Non-existent Endpoint...');
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent`);
    console.log('   Status:', notFoundRes.status);
    if (notFoundRes.status === 404) {
      console.log('   ✅ 404 handling working correctly');
    } else {
      console.log('   ❌ Unexpected status for non-existent endpoint');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints().catch(console.error); 