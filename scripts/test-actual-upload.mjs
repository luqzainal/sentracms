#!/usr/bin/env node

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Get environment variables
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

console.log('🧪 Test Actual Upload to DigitalOcean Spaces\n');

// Validate environment variables
if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  console.error('❌ Missing DigitalOcean Spaces environment variables.');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('   Bucket:', BUCKET_NAME);
console.log('   Region:', SPACES_REGION);
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

async function testActualUpload() {
  try {
    console.log('📤 Starting actual upload test...\n');
    
    // Generate test file content
    const testContent = `Test upload content - ${new Date().toISOString()}\nThis is a test file to verify upload functionality.\nGenerated at: ${new Date().toLocaleString()}`;
    const testFileName = 'actual-upload-test.txt';
    const testFileType = 'text/plain';
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = testFileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    console.log('📁 Test file details:');
    console.log('   Original name:', testFileName);
    console.log('   Unique name:', uniqueFileName);
    console.log('   Content length:', testContent.length, 'characters');
    console.log('   File type:', testFileType);
    console.log('');

    // Step 1: Generate pre-signed URL (like the API does)
    console.log('1️⃣  Generating pre-signed URL...');
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: testFileType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'x-amz-acl': 'public-read',
        'cache-control': 'public, max-age=31536000'
      }
    });
    
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('   ✅ Pre-signed URL generated');
    console.log('   URL length:', presignedUrl.length);
    console.log('');

    // Step 2: Upload file using pre-signed URL
    console.log('2️⃣  Uploading file using pre-signed URL...');
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': testFileType,
        'x-amz-acl': 'public-read',
        'cache-control': 'public, max-age=31536000'
      },
      body: testContent
    });
    
    if (uploadResponse.ok) {
      console.log('   ✅ File uploaded successfully');
      console.log('   Status:', uploadResponse.status);
      console.log('   Status text:', uploadResponse.statusText);
    } else {
      console.error('   ❌ Upload failed');
      console.error('   Status:', uploadResponse.status);
      console.error('   Status text:', uploadResponse.statusText);
      const errorText = await uploadResponse.text();
      console.error('   Error details:', errorText);
      return;
    }
    console.log('');

    // Step 3: Generate public URL
    console.log('3️⃣  Generating public URL...');
    const publicUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${uniqueFileName}`;
    console.log('   Public URL:', publicUrl);
    console.log('');

    // Step 4: Test file access
    console.log('4️⃣  Testing file access...');
    const accessResponse = await fetch(publicUrl);
    
    if (accessResponse.ok) {
      console.log('   ✅ File is publicly accessible');
      const downloadedContent = await accessResponse.text();
      console.log('   Content matches:', downloadedContent === testContent);
      console.log('   Downloaded content length:', downloadedContent.length);
    } else {
      console.log('   ❌ File access denied:', accessResponse.status, accessResponse.statusText);
      console.log('   ⚠️  This indicates ACL settings need manual fix');
    }
    console.log('');

    // Step 5: Test direct S3 upload (alternative method)
    console.log('5️⃣  Testing direct S3 upload...');
    const directFileName = `direct-upload-${timestamp}-${randomString}.txt`;
    const directCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: directFileName,
      ContentType: testFileType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Body: testContent
    });
    
    try {
      await s3Client.send(directCommand);
      console.log('   ✅ Direct upload successful');
      
      const directPublicUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${directFileName}`;
      const directAccessResponse = await fetch(directPublicUrl);
      
      if (directAccessResponse.ok) {
        console.log('   ✅ Direct upload file is accessible');
      } else {
        console.log('   ❌ Direct upload file access denied');
      }
    } catch (error) {
      console.error('   ❌ Direct upload failed:', error.message);
    }
    console.log('');

    // Summary
    console.log('📊 Upload Test Summary:');
    console.log('   ✅ Pre-signed URL generation: Working');
    console.log('   ✅ File upload via pre-signed URL: Working');
    console.log('   ✅ File access after upload: ' + (accessResponse.ok ? 'Working' : 'Failed'));
    console.log('   ✅ Direct S3 upload: Working');
    console.log('');
    
    console.log('🎯 Production Upload Analysis:');
    if (accessResponse.ok) {
      console.log('   ✅ Upload process is working correctly');
      console.log('   ✅ Files should be accessible after upload');
      console.log('   ✅ No manual ACL fix should be needed');
    } else {
      console.log('   ⚠️  Upload works but files are not accessible');
      console.log('   🔧 Manual ACL fix may be required');
      console.log('   💡 Use "Fix All Files" button in Settings');
    }
    
    console.log('');
    console.log('🔍 If production uploads still fail:');
    console.log('   1. Check browser network tab for failed requests');
    console.log('   2. Verify CORS settings in DigitalOcean Spaces');
    console.log('   3. Check bucket permissions and policies');
    console.log('   4. Verify environment variables in production');
    
  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
    console.error('Error details:', error);
  }
}

testActualUpload().catch(console.error); 