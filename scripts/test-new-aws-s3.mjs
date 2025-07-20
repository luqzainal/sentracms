#!/usr/bin/env node

import { S3Client, PutObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');
dotenv.config({ path: join(rootDir, '.env') });

console.log('🧪 Test AWS S3 Configuration Baru');
console.log('==================================\n');

// Environment variables validation
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

console.log('🔧 Environment check:');
console.log('   AWS_S3_BUCKET:', AWS_S3_BUCKET ? 'SET' : 'MISSING');
console.log('   AWS_ACCESS_KEY_ID:', AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING');
console.log('   AWS_SECRET_ACCESS_KEY:', AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING');
console.log('   AWS_REGION:', AWS_REGION ? 'SET' : 'MISSING');
console.log('');

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
  console.error('❌ Missing AWS S3 environment variables');
  console.error('Sila setup file .env dengan credentials AWS S3 yang betul');
  console.error('Jalankan: node scripts/setup-new-aws-s3.mjs');
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

async function testAWSS3Connection() {
  try {
    console.log('1️⃣  Testing AWS S3 connection...');
    
    // Test 1: List buckets (to verify credentials)
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    
    console.log('✅ AWS S3 connection successful');
    console.log('   Available buckets:', bucketsResponse.Buckets?.map(b => b.Name).join(', ') || 'None');
    console.log('');

    // Test 2: Check if target bucket exists
    console.log('2️⃣  Checking target bucket...');
    const bucketExists = bucketsResponse.Buckets?.some(bucket => bucket.Name === AWS_S3_BUCKET);
    
    if (bucketExists) {
      console.log('✅ Target bucket found:', AWS_S3_BUCKET);
    } else {
      console.log('⚠️  Target bucket not found:', AWS_S3_BUCKET);
      console.log('   Available buckets:', bucketsResponse.Buckets?.map(b => b.Name).join(', ') || 'None');
      console.log('   Sila pastikan bucket sudah dibuat dalam akaun AWS yang betul');
    }
    console.log('');

    // Test 3: Test upload (small test file)
    console.log('3️⃣  Testing file upload...');
    
    const testFileName = 'test-new-aws-s3.txt';
    const testFileType = 'text/plain';
    const testContent = `Test file untuk AWS S3 baru - ${new Date().toISOString()}\nBucket: ${AWS_S3_BUCKET}\nRegion: ${AWS_REGION}`;
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const uniqueFileName = `${timestamp}-${randomString}.txt`;
    
    console.log('   Test file:', uniqueFileName);
    console.log('   Content length:', testContent.length, 'characters');
    
    // Create S3 upload command
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: uniqueFileName,
      Body: testContent,
      ContentType: testFileType,
      CacheControl: 'public, max-age=31536000',
    });
    
    // Upload test file
    await s3Client.send(command);
    
    console.log('✅ Test file uploaded successfully');
    console.log('   Public URL: https://' + AWS_S3_BUCKET + '.s3.' + AWS_REGION + '.amazonaws.com/' + uniqueFileName);
    console.log('');

    // Test 4: Test pre-signed URL generation
    console.log('4️⃣  Testing pre-signed URL generation...');
    
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    
    const presignedCommand = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: `presigned-test-${timestamp}.txt`,
      ContentType: 'text/plain',
      CacheControl: 'public, max-age=31536000',
    });
    
    const presignedUrl = await getSignedUrl(s3Client, presignedCommand, { expiresIn: 3600 });
    
    console.log('✅ Pre-signed URL generated successfully');
    console.log('   URL (first 100 chars):', presignedUrl.substring(0, 100) + '...');
    console.log('');

    console.log('🎉 Semua test berjaya!');
    console.log('   AWS S3 configuration baru berfungsi dengan baik');
    console.log('   Anda boleh restart server sekarang');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.name === 'AccessDenied') {
      console.error('   Kemungkinan credentials tidak betul atau tidak ada permission');
      console.error('   Sila check AWS IAM permissions');
    } else if (error.name === 'NoSuchBucket') {
      console.error('   Bucket tidak wujud dalam region yang ditentukan');
      console.error('   Sila check bucket name dan region');
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('   Access Key ID tidak betul');
      console.error('   Sila check AWS credentials');
    }
    
    process.exit(1);
  }
}

// Run test
testAWSS3Connection(); 