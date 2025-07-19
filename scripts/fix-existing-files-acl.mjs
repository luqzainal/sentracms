import { S3Client, PutObjectAclCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Fixing existing files ACL for public read access...\n');

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
  forcePathStyle: false,
});

async function fixFilesACL() {
  try {
    console.log('📋 Listing files in bucket...');
    
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    
    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    console.log(`📄 Found ${files.length} files in bucket`);
    
    if (files.length === 0) {
      console.log('✅ No files to fix ACL for.');
      return;
    }
    
    // Fix ACL for each file
    console.log('🔧 Fixing ACL for files...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: file.Key,
          ACL: 'public-read',
        });
        
        await s3Client.send(aclCommand);
        console.log(`  ✅ Fixed ACL for: ${file.Key}`);
        successCount++;
      } catch (error) {
        console.log(`  ❌ Failed to fix ACL for: ${file.Key} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('');
    console.log('📊 ACL Fix Summary:');
    console.log(`  ✅ Successfully fixed: ${successCount} files`);
    console.log(`  ❌ Failed to fix: ${errorCount} files`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 Files should now be publicly accessible!');
      console.log('');
      console.log('📝 Test by clicking on a file link in your application.');
    }
    
  } catch (error) {
    console.error('❌ Failed to fix files ACL:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has object permissions');
    console.error('   2. Verify bucket name is correct');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

fixFilesACL(); 