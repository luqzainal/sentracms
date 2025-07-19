#!/usr/bin/env node

import fetch from 'node-fetch';

console.log('🔒 Testing CORS Configuration\n');

const testUrls = [
  'http://localhost:3001/api/health',
  'http://localhost:3001/api/generate-upload-url'
];

const testOrigins = [
  'https://www.sentra.vip',
  'https://sentra.vip', 
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://malicious-site.com' // Should be blocked
];

async function testCors() {
  console.log('🧪 Testing CORS for different origins...\n');
  
  for (const origin of testOrigins) {
    console.log(`📍 Testing origin: ${origin}`);
    
    try {
      // Test OPTIONS preflight request
      const optionsRes = await fetch('http://localhost:3001/api/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('   OPTIONS response:', {
        status: optionsRes.status,
        'access-control-allow-origin': optionsRes.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': optionsRes.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': optionsRes.headers.get('access-control-allow-headers')
      });
      
      // Test actual GET request
      const getRes = await fetch('http://localhost:3001/api/health', {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   GET response:', {
        status: getRes.status,
        'access-control-allow-origin': getRes.headers.get('access-control-allow-origin'),
        ok: getRes.ok
      });
      
      if (getRes.ok) {
        const data = await getRes.json();
        console.log('   ✅ Request successful:', data.status);
      } else {
        console.log('   ❌ Request failed');
      }
      
    } catch (error) {
      console.log('   ❌ Request error:', error.message);
    }
    
    console.log('');
  }
  
  // Test upload URL generation
  console.log('📤 Testing upload URL generation...');
  try {
    const uploadRes = await fetch('http://localhost:3001/api/generate-upload-url', {
      method: 'POST',
      headers: {
        'Origin': 'https://www.sentra.vip',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: 'test.txt',
        fileType: 'text/plain'
      })
    });
    
    console.log('   Upload URL response:', {
      status: uploadRes.status,
      'access-control-allow-origin': uploadRes.headers.get('access-control-allow-origin'),
      ok: uploadRes.ok
    });
    
    if (uploadRes.ok) {
      const data = await uploadRes.json();
      console.log('   ✅ Upload URL generated successfully');
      console.log('   File name:', data.fileName);
      console.log('   Public URL:', data.publicUrl);
    } else {
      const errorText = await uploadRes.text();
      console.log('   ❌ Upload URL generation failed:', errorText);
    }
    
  } catch (error) {
    console.log('   ❌ Upload URL test error:', error.message);
  }
  
  console.log('\n📊 CORS Test Summary:');
  console.log('   ✅ Production domain (sentra.vip): Should work');
  console.log('   ✅ Development domains (localhost): Should work');
  console.log('   ❌ Unknown domains: Should be blocked');
  console.log('   ✅ Upload API: Should work with proper headers');
}

testCors().catch(console.error); 