#!/usr/bin/env node

import { S3Client, ListObjectsV2Command, PutObjectAclCommand } from '@aws-sdk/client-s3';
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

async function fixExistingFilesACL() {
  try {
    console.log('🔧 Fixing ACL for existing files...\n');
    
    // Step 1: List all files in bucket
    console.log('📋 Step 1: Listing all files in bucket...');
    
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // Get up to 1000 files
    });

    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    console.log(`✅ Found ${files.length} files in bucket`);
    console.log('');

    if (files.length === 0) {
      console.log('✅ No files to fix ACL for');
      return;
    }

    // Step 2: Fix ACL for each file
    console.log('📋 Step 2: Fixing ACL for each file...');
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      try {
        // Skip if file is a directory or has no key
        if (!file.Key || file.Key.endsWith('/')) {
          skippedCount++;
          continue;
        }

        console.log(`🔧 Fixing ACL for: ${file.Key}`);
        
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: file.Key,
          ACL: 'public-read',
        });

        await s3Client.send(aclCommand);
        successCount++;
        console.log(`✅ Fixed ACL for: ${file.Key}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to fix ACL for ${file.Key}:`, error.message);
      }
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully fixed: ${successCount} files`);
    console.log(`   ❌ Failed to fix: ${errorCount} files`);
    console.log(`   ⏭️  Skipped: ${skippedCount} files`);
    console.log(`   📁 Total files: ${files.length} files`);
    console.log('');

    // Step 3: Test a few files
    console.log('📋 Step 3: Testing file access...');
    
    const testFiles = files.slice(0, 3); // Test first 3 files
    let testSuccessCount = 0;
    
    for (const file of testFiles) {
      if (!file.Key || file.Key.endsWith('/')) continue;
      
      const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${file.Key}`;
      
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (response.ok) {
          testSuccessCount++;
          console.log(`✅ File accessible: ${file.Key}`);
        } else {
          console.log(`❌ File not accessible: ${file.Key} (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ Error testing file: ${file.Key} - ${error.message}`);
      }
    }
    
    console.log('');
    console.log(`🎉 ACL fix completed! ${testSuccessCount}/${testFiles.length} test files accessible`);
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Upload new files - ACL will be fixed automatically');
    console.log('   2. If issues persist, run: npm run setup-automatic-acl');
    console.log('   3. Check bucket policy: npm run setup-bucket-policy');
    
  } catch (error) {
    console.error('❌ Error fixing existing files ACL:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check if your API key has bucket permissions');
    console.error('   2. Verify bucket name and region are correct');
    console.error('   3. Ensure bucket exists and is accessible');
    process.exit(1);
  }
}

fixExistingFilesACL().catch(console.error); 