#!/usr/bin/env node

import dotenv from 'dotenv';

dotenv.config();

async function debugApiEndpoint() {
  try {
    console.log('🔍 Debugging API endpoint...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('   DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT ? '✅ Set' : '❌ Missing');
    console.log('   DO_SPACES_REGION:', process.env.DO_SPACES_REGION ? '✅ Set' : '❌ Missing');
    console.log('   DO_SPACES_KEY:', process.env.DO_SPACES_KEY ? '✅ Set' : '❌ Missing');
    console.log('   DO_SPACES_SECRET:', process.env.DO_SPACES_SECRET ? '✅ Set' : '❌ Missing');
    console.log('   DO_SPACES_BUCKET:', process.env.DO_SPACES_BUCKET ? '✅ Set' : '❌ Missing');
    console.log('');
    
    // Test API server connection
    console.log('🌐 Testing API server connection...');
    try {
      const response = await fetch('http://localhost:3001/generate-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: 'test.txt', fileType: 'text/plain' }),
      });
      
      console.log('   generate-upload-url status:', response.status);
      
      if (response.ok) {
        console.log('   ✅ generate-upload-url working');
      } else {
        const errorText = await response.text();
        console.log('   ❌ generate-upload-url error:', errorText);
      }
    } catch (error) {
      console.log('   ❌ generate-upload-url network error:', error.message);
    }
    console.log('');
    
    // Test fix-all-files endpoint
    console.log('🔧 Testing fix-all-files endpoint...');
    try {
      const response = await fetch('http://localhost:3001/fix-all-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('   fix-all-files status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('   ✅ fix-all-files working:', result);
      } else {
        const errorText = await response.text();
        console.log('   ❌ fix-all-files error:', errorText);
      }
    } catch (error) {
      console.log('   ❌ fix-all-files network error:', error.message);
    }
    console.log('');
    
    // Check if server is running
    console.log('🔍 Checking server status...');
    try {
      const response = await fetch('http://localhost:3001', { method: 'GET' });
      console.log('   Server root status:', response.status);
    } catch (error) {
      console.log('   ❌ Server not accessible:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugApiEndpoint().catch(console.error); 