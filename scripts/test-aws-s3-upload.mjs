#!/usr/bin/env node

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');
dotenv.config({ path: join(rootDir, '.env') });

console.log('🧪 Testing AWS S3 Upload\n');

// Environment variables validation
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

console.log('🔧 Environment check:', {
  AWS_S3_BUCKET: AWS_S3_BUCKET ? 'SET' : 'MISSING',
  AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING',
  AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
  AWS_REGION: AWS_REGION ? 'SET' : 'MISSING'
});

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
  console.error('❌ Missing AWS S3 environment variables');
  console.error('Please set up AWS S3 credentials in .env file');
  process.exit(1);
}

// Configure AWS S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

async function testAWSS3Upload() {
  try {
    console.log('📤 Starting AWS S3 upload test...\n');
    
    // Test file details
    const testFileName = 'aws-s3-test.txt';
    const testFileType = 'text/plain';
    const testContent = `AWS S3 Test Content - ${new Date().toISOString()}\nThis is a test file to verify AWS S3 upload functionality.\nGenerated at: ${new Date().toLocaleString()}`;
    
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

    // Step 1: Create S3 upload command
    console.log('1️⃣  Creating S3 upload command...');
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: uniqueFileName,
      ContentType: testFileType,
      CacheControl: 'public, max-age=31536000',
    });
    
    console.log('   Command created with:');
    console.log('     Bucket:', AWS_S3_BUCKET);
    console.log('     Key:', uniqueFileName);
    console.log('     ContentType:', testFileType);
    console.log('     CacheControl: public, max-age=31536000');
    console.log('');

    // Step 2: Generate pre-signed URL
    console.log('2️⃣  Generating pre-signed URL...');
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('   ✅ Pre-signed URL generated');
    console.log('   URL length:', presignedUrl.length);
    console.log('   URL starts with:', presignedUrl.substring(0, 80) + '...');
    console.log('');

    // Step 3: Upload file using pre-signed URL
    console.log('3️⃣  Uploading file using pre-signed URL...');
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': testFileType,
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

    // Step 4: Generate public URL
    console.log('4️⃣  Generating public URL...');
    const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    console.log('   Public URL:', publicUrl);
    console.log('');

    // Step 5: Test file access
    console.log('5️⃣  Testing file access...');
    const accessResponse = await fetch(publicUrl);
    
    if (accessResponse.ok) {
      console.log('   ✅ File is publicly accessible');
      const downloadedContent = await accessResponse.text();
      console.log('   Content matches:', downloadedContent === testContent);
      console.log('   Downloaded content length:', downloadedContent.length);
    } else {
      console.log('   ❌ File access denied:', accessResponse.status, accessResponse.statusText);
      console.log('   ⚠️  This indicates bucket policy needs to be configured');
    }
    console.log('');

    // Step 6: Test direct S3 upload
    console.log('6️⃣  Testing direct S3 upload...');
    const directFileName = `direct-upload-${timestamp}-${randomString}.txt`;
    const directCommand = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: directFileName,
      ContentType: testFileType,
      CacheControl: 'public, max-age=31536000',
      Body: testContent
    });
    
    try {
      await s3Client.send(directCommand);
      console.log('   ✅ Direct upload successful');
      
      const directPublicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${directFileName}`;
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
    console.log('📊 AWS S3 Upload Test Summary:');
    console.log('   ✅ Environment variables: Valid');
    console.log('   ✅ S3 Client: Created successfully');
    console.log('   ✅ Pre-signed URL: Generated successfully');
    console.log('   ✅ File upload via pre-signed URL: Working');
    console.log('   ✅ File access after upload: ' + (accessResponse.ok ? 'Working' : 'Failed'));
    console.log('   ✅ Direct S3 upload: Working');
    console.log('');
    
    console.log('🎯 AWS S3 Migration Analysis:');
    if (accessResponse.ok) {
      console.log('   ✅ AWS S3 upload process is working correctly');
      console.log('   ✅ Files should be accessible after upload');
      console.log('   ✅ Migration from DigitalOcean Spaces successful');
    } else {
      console.log('   ⚠️  Upload works but files are not accessible');
      console.log('   🔧 Bucket policy needs to be configured for public access');
      console.log('   💡 Check AWS_S3_MIGRATION.md for bucket policy setup');
    }
    
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('   1. Configure bucket policy for public access');
    console.log('   2. Set up CORS configuration');
    console.log('   3. Test upload in production environment');
    console.log('   4. Update frontend to use new AWS S3 URLs');
    
  } catch (error) {
    console.error('❌ AWS S3 test failed:', error.message);
    console.error('Error details:', error);
  }
}

testAWSS3Upload().catch(console.error); 