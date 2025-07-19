#!/usr/bin/env node

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🚀 Setting up CORS policy for DigitalOcean Spaces...\n');

// Get environment variables
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Validate environment variables
if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  console.error('❌ Missing DigitalOcean Spaces environment variables.');
  console.error('Please run: npm run setup-file-upload');
  process.exit(1);
}

// Configure S3 client
// Use the correct endpoint format for DigitalOcean Spaces
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

// CORS configuration
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
          'https://your-production-domain.com', // Replace with your production domain
        ],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

async function setupCORS() {
  try {
    console.log('📋 CORS Configuration:');
    console.log('   Bucket:', BUCKET_NAME);
    console.log('   Allowed Origins:', corsConfig.CORSConfiguration.CORSRules[0].AllowedOrigins);
    console.log('   Allowed Methods:', corsConfig.CORSConfiguration.CORSRules[0].AllowedMethods);
    console.log('   Allowed Headers:', corsConfig.CORSConfiguration.CORSRules[0].AllowedHeaders);
    console.log('');

    console.log('🔧 Applying CORS policy...');
    const command = new PutBucketCorsCommand(corsConfig);
    await s3Client.send(command);
    
    console.log('✅ CORS policy applied successfully!');
    console.log('');
    console.log('🎉 Your DigitalOcean Spaces bucket is now configured for file uploads.');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Try uploading a file again');
    console.log('   2. If you deploy to production, update the AllowedOrigins in this script');
    console.log('   3. For production, replace "https://your-production-domain.com" with your actual domain');
    
  } catch (error) {
    console.error('❌ Failed to setup CORS:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has bucket management permissions');
    console.error('   2. Verify bucket name is correct');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

setupCORS(); 