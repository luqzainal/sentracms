import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking comment database schema and data...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkCommentSchema() {
  try {
    console.log('🔍 Step 1: Checking table schema...');
    
    // Check table structure
    const tableInfo = await sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'progress_step_comments'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Table schema:');
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n🔍 Step 2: Checking comment data...');
    
    // Check all comments with attachments
    const commentsWithAttachments = await sql`
      SELECT 
        id,
        step_id,
        text,
        username,
        attachment_url,
        attachment_type,
        created_at,
        LENGTH(attachment_url) as url_length
      FROM progress_step_comments 
      WHERE attachment_url IS NOT NULL 
      AND attachment_url != ''
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Found ${commentsWithAttachments.length} comments with attachments`);
    
    if (commentsWithAttachments.length > 0) {
      console.log('\n📄 Comment details:');
      commentsWithAttachments.forEach((comment, index) => {
        console.log(`\n  Comment ${index + 1}:`);
        console.log(`    ID: ${comment.id}`);
        console.log(`    Step ID: ${comment.step_id}`);
        console.log(`    Username: ${comment.username}`);
        console.log(`    Text: "${comment.text}"`);
        console.log(`    Attachment URL Length: ${comment.url_length}`);
        console.log(`    Attachment URL: ${comment.attachment_url}`);
        console.log(`    Attachment Type: ${comment.attachment_type}`);
        console.log(`    Created: ${comment.created_at}`);
      });
    }
    
    console.log('\n🔍 Step 3: Checking for truncated URLs...');
    
    // Check if any URLs are truncated
    const truncatedUrls = commentsWithAttachments.filter(comment => {
      const url = comment.attachment_url;
      return url && (
        url.length < 50 || // Very short URLs
        !url.includes('digitaloceanspaces.com') || // Missing domain
        url.endsWith('...') || // Ends with ellipsis
        url.includes('truncated') // Contains truncation indicator
      );
    });
    
    if (truncatedUrls.length > 0) {
      console.log(`⚠️  Found ${truncatedUrls.length} potentially truncated URLs:`);
      truncatedUrls.forEach((comment, index) => {
        console.log(`  ${index + 1}. Length: ${comment.url_length}, URL: ${comment.attachment_url}`);
      });
    } else {
      console.log('✅ No truncated URLs found');
    }
    
    console.log('\n🔍 Step 4: Testing file access...');
    
    // Test access to attachment URLs
    if (commentsWithAttachments.length > 0) {
      const testComment = commentsWithAttachments[0];
      console.log(`🔗 Testing access to: ${testComment.attachment_url}`);
      
      try {
        const response = await fetch(testComment.attachment_url);
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log('✅ File access successful');
        } else {
          console.log(`❌ File access failed - Status: ${response.status}`);
          const errorText = await response.text();
          console.log(`❌ Error response: ${errorText.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`❌ File access error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Comment schema check completed!');
    
  } catch (error) {
    console.error('❌ Failed to check comment schema:', error.message);
    process.exit(1);
  }
}

checkCommentSchema(); 