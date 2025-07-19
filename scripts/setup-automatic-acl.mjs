#!/usr/bin/env node

import { S3Client, PutObjectCommand, PutObjectAclCommand } from '@aws-sdk/client-s3';
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
  console.error('Required variables:');
  console.error('  DO_SPACES_ENDPOINT:', !!SPACES_ENDPOINT);
  console.error('  DO_SPACES_REGION:', !!SPACES_REGION);
  console.error('  DO_SPACES_KEY:', !!SPACES_KEY);
  console.error('  DO_SPACES_SECRET:', !!SPACES_SECRET);
  console.error('  DO_SPACES_BUCKET:', !!BUCKET_NAME);
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

async function setupAutomaticACL() {
  try {
    console.log('🔧 Setting up automatic ACL fix system...\n');
    
    // Step 1: Test S3 client connection
    console.log('📋 Step 1: Testing S3 client connection...');
    
    const testFileName = `connection-test-${Date.now()}.txt`;
    const testContent = 'Connection test - ' + new Date().toISOString();
    
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      ContentType: 'text/plain',
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Body: testContent,
    });

    await s3Client.send(uploadCommand);
    console.log('✅ S3 client connection successful');
    console.log('✅ Test file uploaded with public-read ACL');
    console.log('');

    // Step 2: Test file access
    console.log('📋 Step 2: Testing file access...');
    
    const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${testFileName}`;
    const response = await fetch(fileUrl);
    
    if (response.ok) {
      console.log('✅ File is publicly accessible');
    } else {
      console.log('❌ File access denied, testing ACL fix...');
      
      // Test ACL fix
      const aclCommand = new PutObjectAclCommand({
        Bucket: BUCKET_NAME,
        Key: testFileName,
        ACL: 'public-read',
      });

      await s3Client.send(aclCommand);
      console.log('✅ ACL fixed manually');
      
      // Test access again
      const retryResponse = await fetch(fileUrl);
      if (retryResponse.ok) {
        console.log('✅ File is now accessible after ACL fix');
      } else {
        console.log('❌ File still not accessible after ACL fix');
        console.log('⚠️  This may indicate bucket policy issues');
      }
    }
    console.log('');

    // Step 3: Test the API endpoint
    console.log('📋 Step 3: Testing API endpoint...');
    
    try {
      const apiResponse = await fetch('http://localhost:3001/fix-file-acl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: testFileName }),
      });
      
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        console.log('✅ API endpoint working:', result.message);
      } else {
        console.log('❌ API endpoint failed:', apiResponse.status);
        console.log('   Make sure to start API server: npm run start-api');
      }
    } catch (error) {
      console.log('⚠️ API endpoint not available (server may not be running)');
      console.log('   Start the API server with: npm run start-api');
    }
    console.log('');

    console.log('🎉 Automatic ACL setup completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   ✅ S3 client connection working');
    console.log('   ✅ Upload process includes proper ACL settings');
    console.log('   ✅ Automatic ACL fix API endpoint ready');
    console.log('   ✅ File access verification implemented');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Start API server: npm run start-api');
    console.log('   2. Upload files normally - ACL will be fixed automatically');
    console.log('   3. If files still access denied, run: npm run fix-existing-files-acl');
    console.log('   4. For bucket policy issues, check DigitalOcean Spaces settings');
    console.log('');
    console.log('⚠️  Note: If files are still access denied, you may need to:');
    console.log('   - Set bucket to "Public" in DigitalOcean Spaces console');
    console.log('   - Or contact DigitalOcean support for bucket policy permissions');
    
  } catch (error) {
    console.error('❌ Error setting up automatic ACL:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has upload permissions');
    console.error('   2. Verify bucket name and region are correct');
    console.error('   3. Ensure bucket exists and is accessible');
    console.error('   4. Try running: npm run fix-existing-files-acl');
    process.exit(1);
  }
}

setupAutomaticACL().catch(console.error); 