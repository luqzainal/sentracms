import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');
dotenv.config({ path: join(rootDir, '.env') });

// Environment variables validation
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

console.log('🔧 Setting up AWS S3 CORS policy...\n');

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

// CORS configuration for AWS S3
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: [
        '*'
      ],
      AllowedMethods: [
        'GET',
        'PUT',
        'POST',
        'DELETE',
        'HEAD'
      ],
      AllowedOrigins: [
        'https://www.sentra.vip',
        'https://sentra.vip',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:4173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:4173'
      ],
      ExposeHeaders: [
        'ETag',
        'x-amz-version-id'
      ],
      MaxAgeSeconds: 3000
    }
  ]
};

async function setupAWSS3CORS() {
  try {
    console.log('📋 CORS Configuration:');
    console.log('   Bucket:', AWS_S3_BUCKET);
    console.log('   Region:', AWS_REGION);
    console.log('   Allowed Origins:', corsConfiguration.CORSRules[0].AllowedOrigins);
    console.log('   Allowed Methods:', corsConfiguration.CORSRules[0].AllowedMethods);
    console.log('');

    console.log('🔧 Applying CORS policy to bucket...');
    const command = new PutBucketCorsCommand({
      Bucket: AWS_S3_BUCKET,
      CORSConfiguration: corsConfiguration,
    });
    
    await s3Client.send(command);
    
    console.log('✅ CORS policy applied successfully!');
    console.log('');
    console.log('🎉 Your AWS S3 bucket now allows CORS requests from:');
    console.log('   - Production domains (sentra.vip)');
    console.log('   - Development servers (localhost:3000, localhost:5173)');
    console.log('');
    console.log('📝 Frontend uploads should now work without CORS errors!');
    
  } catch (error) {
    console.error('❌ Failed to setup CORS policy:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your AWS credentials have s3:PutBucketCors permission');
    console.error('   2. Verify bucket name is correct');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

setupAWSS3CORS(); 