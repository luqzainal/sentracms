import { S3Client, PutBucketPolicyCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Setting up bucket policy for public read access...\n');

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

// Configure S3 client for DigitalOcean Spaces
const baseEndpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;

console.log('🔧 S3 Client Configuration:');
console.log('   Base Endpoint:', baseEndpoint);
console.log('   Region:', SPACES_REGION);
console.log('   Bucket:', BUCKET_NAME);
console.log('');

const s3Client = new S3Client({
  endpoint: baseEndpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs for DigitalOcean Spaces
});

// Bucket policy for public read access
const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObject',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
    },
  ],
};

async function setupBucketPolicy() {
  try {
    console.log('📋 Bucket Policy Configuration:');
    console.log('   Bucket:', BUCKET_NAME);
    console.log('   Policy:', JSON.stringify(bucketPolicy, null, 2));
    console.log('');

    console.log('🔧 Applying bucket policy...');
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy),
    });
    await s3Client.send(command);
    
    console.log('✅ Bucket policy applied successfully!');
    console.log('');
    console.log('🎉 Your DigitalOcean Spaces bucket now allows public read access.');
    console.log('');
    console.log('📝 Files should now be accessible via direct URLs.');
    
  } catch (error) {
    console.error('❌ Failed to setup bucket policy:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has bucket policy permissions');
    console.error('   2. Verify bucket name is correct');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

setupBucketPolicy(); 