import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectAclCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 Fixing comment attachment issues...\n');

// Get environment variables
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;
const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

// Validate environment variables
if (!SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME || !DATABASE_URL) {
  console.error('❌ Missing environment variables.');
  process.exit(1);
}

// Configure database and S3 clients
const sql = neon(DATABASE_URL);
const s3Client = new S3Client({
  endpoint: `https://${SPACES_REGION}.digitaloceanspaces.com`,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

async function fixCommentAttachments() {
  try {
    console.log('🔍 Step 1: Checking comment attachments in database...');
    
    // Check comments with attachments
    const commentsWithAttachments = await sql`
      SELECT 
        id,
        step_id,
        text,
        username,
        attachment_url,
        attachment_type,
        created_at
      FROM progress_step_comments 
      WHERE attachment_url IS NOT NULL 
      AND attachment_url != ''
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Found ${commentsWithAttachments.length} comments with attachments`);
    
    if (commentsWithAttachments.length > 0) {
      console.log('📄 Sample comment with attachment:');
      console.log('  ', commentsWithAttachments[0]);
      console.log('');
    }
    
    console.log('🔍 Step 2: Checking file permissions in DigitalOcean Spaces...');
    
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    
    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    console.log(`📄 Found ${files.length} files in bucket`);
    
    // Find files that might be comment attachments
    const commentAttachmentFiles = files.filter(file => {
      // Look for files that might be comment attachments
      return file.Key && (
        file.Key.includes('comment') || 
        file.Key.includes('attachment') ||
        file.Key.includes('ChatGPT') // Based on your example
      );
    });
    
    console.log(`📋 Found ${commentAttachmentFiles.length} potential comment attachment files`);
    
    if (commentAttachmentFiles.length > 0) {
      console.log('🔧 Step 3: Fixing permissions for comment attachment files...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of commentAttachmentFiles) {
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
    }
    
    console.log('🔍 Step 4: Testing file access...');
    
    // Test access to a few files
    if (commentAttachmentFiles.length > 0) {
      const testFile = commentAttachmentFiles[0];
      const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${testFile.Key}`;
      
      console.log(`🔗 Testing access to: ${fileUrl}`);
      
      try {
        const response = await fetch(fileUrl);
        if (response.ok) {
          console.log('✅ File access successful');
        } else {
          console.log(`❌ File access failed - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ File access error: ${error.message}`);
      }
    }
    
    console.log('');
    console.log('🎉 Comment attachment fix completed!');
    console.log('');
    console.log('📝 Summary:');
    console.log(`  • ${commentsWithAttachments.length} comments with attachments in database`);
    console.log(`  • ${commentAttachmentFiles.length} potential attachment files found`);
    console.log(`  • File permissions updated for comment attachments`);
    console.log('');
    console.log('🔧 Next steps:');
    console.log('  1. Refresh the application');
    console.log('  2. Check if comment attachments are now visible');
    console.log('  3. Test clicking on attachment links');
    
  } catch (error) {
    console.error('❌ Failed to fix comment attachments:', error.message);
    process.exit(1);
  }
}

fixCommentAttachments(); 