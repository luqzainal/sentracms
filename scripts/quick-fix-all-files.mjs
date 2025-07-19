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
  process.exit(1);
}

// Configure S3 client
const baseEndpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;
const s3Client = new S3Client({
  endpoint: baseEndpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

async function quickFixAllFiles() {
  try {
    console.log('🔧 Quick fixing all files ACL...\n');
    
    // List all files
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000,
    });

    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    if (files.length === 0) {
      console.log('✅ No files to fix');
      return;
    }

    console.log(`📁 Found ${files.length} files, fixing ACL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Fix ACL for all files
    for (const file of files) {
      if (!file.Key || file.Key.endsWith('/')) continue;
      
      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: file.Key,
          ACL: 'public-read',
        });

        await s3Client.send(aclCommand);
        successCount++;
        
        // Show progress every 10 files
        if (successCount % 10 === 0) {
          console.log(`✅ Fixed ${successCount} files...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${file.Key}`);
      }
    }
    
    console.log('');
    console.log('🎉 Quick fix completed!');
    console.log(`✅ Fixed: ${successCount} files`);
    console.log(`❌ Failed: ${errorCount} files`);
    console.log('');
    console.log('💡 Next time, files will be auto-fixed during upload!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickFixAllFiles().catch(console.error); 