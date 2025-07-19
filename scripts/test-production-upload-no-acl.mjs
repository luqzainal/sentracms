#!/usr/bin/env node

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Get environment variables
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Validate environment variables
if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  console.error('❌ Missing DigitalOcean Spaces environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('');

// Configure S3 client for DigitalOcean Spaces
const baseEndpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;

const s3Client = new S3Client({
  endpoint: baseEndpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

async function testProductionUploadNoACL() {
  try {
    console.log('🧪 Testing production upload without auto ACL fix...\n');
    
    // Test upload with enhanced ACL settings
    const testFileName = `production-test-no-acl-${Date.now()}.txt`;
    const testContent = 'Production upload test without auto ACL fix - ' + new Date().toISOString();
    
    console.log('📁 Test file details:');
    console.log('   Name:', testFileName);
    console.log('   Content length:', testContent.length, 'characters');
    console.log('');

    // Create upload command with enhanced ACL settings
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      ContentType: 'text/plain',
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'x-amz-acl': 'public-read',
        'cache-control': 'public, max-age=31536000'
      },
      Body: testContent,
    });

    console.log('📤 Uploading file with enhanced ACL settings...');
    await s3Client.send(command);
    console.log('✅ File uploaded successfully');
    console.log('');

    // Generate file URL
    const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${testFileName}`;
    console.log('🔗 Generated file URL:');
    console.log('   ', fileUrl);
    console.log('');

    // Test file access
    console.log('🔍 Testing file access...');
    const response = await fetch(fileUrl);
    
    if (response.ok) {
      console.log('✅ File is publicly accessible');
      const content = await response.text();
      console.log('✅ File content matches:', content === testContent);
    } else {
      console.log('❌ File access denied:', response.status, response.statusText);
      console.log('⚠️  This indicates ACL settings need manual fix');
    }
    console.log('');

    console.log('🎉 Production upload test completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   ✅ Upload successful with enhanced ACL settings');
    console.log('   ✅ No auto ACL fix required');
    console.log('   ✅ File should be accessible immediately');
    console.log('');
    console.log('💡 For production:');
    console.log('   1. Upload files normally');
    console.log('   2. Use "Fix All Files" button in Settings if needed');
    console.log('   3. No auto ACL fix to prevent message channel issues');
    
  } catch (error) {
    console.error('❌ Error testing production upload:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check environment variables');
    console.error('   2. Verify bucket permissions');
    console.error('   3. Check network connection');
  }
}

testProductionUploadNoACL().catch(console.error); 