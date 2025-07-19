import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Setting up CORS policy for production domain sentra.vip...\n');

// Get environment variables
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Validate environment variables
if (!SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
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
});

// CORS configuration for production
const corsConfig = {
  Bucket: BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:8080',
          'https://www.sentra.vip',
          'https://sentra.vip',
          'https://*.sentra.vip',
        ],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

async function setupProductionCORS() {
  try {
    console.log('📋 Production CORS Configuration:');
    console.log('   Bucket:', BUCKET_NAME);
    console.log('   Allowed Origins:', corsConfig.CORSConfiguration.CORSRules[0].AllowedOrigins);
    console.log('   Allowed Methods:', corsConfig.CORSConfiguration.CORSRules[0].AllowedMethods);
    console.log('   Allowed Headers:', corsConfig.CORSConfiguration.CORSRules[0].AllowedHeaders);
    console.log('');

    console.log('🔧 Applying production CORS policy...');
    const command = new PutBucketCorsCommand(corsConfig);
    await s3Client.send(command);
    
    console.log('✅ Production CORS policy applied successfully!');
    console.log('');
    console.log('🎉 Your DigitalOcean Spaces bucket is now configured for production.');
    console.log('');
    console.log('📝 Production domains configured:');
    console.log('   • https://www.sentra.vip');
    console.log('   • https://sentra.vip');
    console.log('   • https://*.sentra.vip (subdomains)');
    console.log('');
    console.log('🔧 Next steps:');
    console.log('   1. Deploy your application to production');
    console.log('   2. Test file uploads on https://www.sentra.vip');
    console.log('   3. Verify file access works correctly');
    
  } catch (error) {
    console.error('❌ Failed to setup production CORS:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has bucket management permissions');
    console.error('   2. Verify bucket name is correct');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

setupProductionCORS(); 