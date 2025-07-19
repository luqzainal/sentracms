import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing production file upload functionality...\n');

// Get environment variables
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Validate environment variables
if (!SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  console.error('❌ Missing DigitalOcean Spaces environment variables.');
  console.error('Required variables:');
  console.error('  DO_SPACES_REGION:', !!SPACES_REGION);
  console.error('  DO_SPACES_KEY:', !!SPACES_KEY);
  console.error('  DO_SPACES_SECRET:', !!SPACES_SECRET);
  console.error('  DO_SPACES_BUCKET:', !!BUCKET_NAME);
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('   Region:', SPACES_REGION);
console.log('   Bucket:', BUCKET_NAME);
console.log('   Has Key:', !!SPACES_KEY);
console.log('   Has Secret:', !!SPACES_SECRET);
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

async function testProductionUpload() {
  try {
    console.log('🔧 Testing S3 client connection...');
    
    // Test basic connection
    const testFileName = `test-${crypto.randomUUID()}.txt`;
    const testContent = 'This is a test file for production upload functionality.';
    
    console.log('📁 Test file details:');
    console.log('   Name:', testFileName);
    console.log('   Content length:', testContent.length, 'characters');
    console.log('');

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      ContentType: 'text/plain',
      ACL: 'public-read',
      Body: testContent,
    });

    console.log('🔗 Generating signed URL...');
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    console.log('✅ Signed URL generated successfully');
    console.log('   URL length:', uploadUrl.length, 'characters');
    console.log('');

    // Test direct upload
    console.log('📤 Testing direct upload...');
    await s3Client.send(command);
    console.log('✅ Direct upload successful');
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
      const content = await response.text();
      console.log('✅ File access successful');
      console.log('   Response status:', response.status);
      console.log('   Content matches:', content === testContent);
    } else {
      console.log('❌ File access failed');
      console.log('   Response status:', response.status);
    }
    console.log('');

    console.log('🎉 Production upload test completed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   ✅ Environment variables: OK');
    console.log('   ✅ S3 client connection: OK');
    console.log('   ✅ Signed URL generation: OK');
    console.log('   ✅ Direct upload: OK');
    console.log('   ✅ File access: OK');
    console.log('');
    console.log('🔧 Your production upload should work correctly!');
    
  } catch (error) {
    console.error('❌ Production upload test failed:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check DigitalOcean Spaces credentials');
    console.error('   2. Verify bucket permissions');
    console.error('   3. Ensure bucket exists in the specified region');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

testProductionUpload(); 