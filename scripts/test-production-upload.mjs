import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Production Upload...\n');

// Test configuration
const PRODUCTION_URL = 'https://www.sentra.vip';
const API_ENDPOINT = `${PRODUCTION_URL}/api/generate-upload-url`;

async function testProductionUpload() {
  try {
    console.log('🔍 Testing API endpoint:', API_ENDPOINT);
    
    // Test 1: Health check
    console.log('\n📋 Test 1: Health Check');
    try {
      const healthRes = await fetch(`${PRODUCTION_URL}/api/health`);
      const healthData = await healthRes.json();
      console.log('✅ Health check response:', healthData);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test 2: Generate upload URL
    console.log('\n📋 Test 2: Generate Upload URL');
    const uploadUrlRes = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': PRODUCTION_URL
      },
      body: JSON.stringify({
        fileName: 'test-receipt.pdf',
        fileType: 'application/pdf'
      })
    });
    
    if (!uploadUrlRes.ok) {
      const errorText = await uploadUrlRes.text();
      console.log('❌ Upload URL generation failed:');
      console.log('   Status:', uploadUrlRes.status);
      console.log('   Response:', errorText);
      return;
    }
    
    const uploadData = await uploadUrlRes.json();
    console.log('✅ Upload URL generated:');
    console.log('   File Name:', uploadData.fileName);
    console.log('   Upload URL:', uploadData.uploadUrl.substring(0, 100) + '...');
    console.log('   Public URL:', uploadData.publicUrl);
    
    // Test 3: Upload file to S3
    console.log('\n📋 Test 3: Upload File to S3');
    
    // Create a simple test file
    const testContent = 'This is a test receipt file for production upload testing.';
    const testFileName = 'test-receipt.txt';
    const testFilePath = join(__dirname, testFileName);
    
    fs.writeFileSync(testFilePath, testContent);
    
    // Prepare file content for upload
    
    // Upload to S3 using pre-signed URL
    const uploadRes = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=31536000'
      },
      body: testContent
    });
    
    if (uploadRes.ok) {
      console.log('✅ File uploaded successfully to S3!');
      console.log('   Public URL:', uploadData.publicUrl);
      
      // Test 4: Verify file is accessible
      console.log('\n📋 Test 4: Verify File Accessibility');
      try {
        const verifyRes = await fetch(uploadData.publicUrl);
        if (verifyRes.ok) {
          console.log('✅ File is publicly accessible!');
        } else {
          console.log('❌ File not accessible:', verifyRes.status);
        }
      } catch (error) {
        console.log('❌ File verification failed:', error.message);
      }
    } else {
      console.log('❌ File upload failed:');
      console.log('   Status:', uploadRes.status);
      console.log('   Response:', await uploadRes.text());
    }
    
    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    console.log('\n🎉 Production upload test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testProductionUpload(); 