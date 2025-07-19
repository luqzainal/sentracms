import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing comment display and data structure...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testCommentDisplay() {
  try {
    console.log('🔍 Step 1: Getting all progress steps with comments...');
    
    // Get all progress steps with their comments
    const stepsWithComments = await sql`
      SELECT 
        ps.id as step_id,
        ps.title as step_title,
        ps.client_id,
        psc.id as comment_id,
        psc.text as comment_text,
        psc.username as comment_username,
        psc.attachment_url,
        psc.attachment_type,
        psc.created_at as comment_created_at
      FROM progress_steps ps
      LEFT JOIN progress_step_comments psc ON ps.id = psc.step_id
      WHERE ps.client_id = 1
      ORDER BY ps.created_at DESC, psc.created_at DESC
    `;
    
    console.log(`📋 Found ${stepsWithComments.length} step-comment combinations`);
    
    // Group by step
    const steps = {};
    stepsWithComments.forEach(row => {
      if (!steps[row.step_id]) {
        steps[row.step_id] = {
          id: row.step_id,
          title: row.step_title,
          client_id: row.client_id,
          comments: []
        };
      }
      
      if (row.comment_id) {
        steps[row.step_id].comments.push({
          id: row.comment_id,
          text: row.comment_text,
          username: row.comment_username,
          attachment_url: row.attachment_url,
          attachment_type: row.attachment_type,
          created_at: row.comment_created_at
        });
      }
    });
    
    console.log('\n📄 Steps with comments:');
    Object.values(steps).forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.title}`);
      console.log(`    Comments: ${step.comments.length}`);
      
      step.comments.forEach((comment, commentIndex) => {
        console.log(`      Comment ${commentIndex + 1}:`);
        console.log(`        ID: ${comment.id}`);
        console.log(`        Username: ${comment.username}`);
        console.log(`        Text: "${comment.text}"`);
        console.log(`        Has Attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
        if (comment.attachment_url) {
          console.log(`        Attachment URL: ${comment.attachment_url}`);
          console.log(`        Attachment Type: ${comment.attachment_type}`);
        }
        console.log(`        Created: ${comment.created_at}`);
      });
    });
    
    console.log('\n🔍 Step 2: Testing comment data structure...');
    
    // Test the exact data structure that the frontend expects
    const testStep = Object.values(steps)[0];
    if (testStep) {
      console.log('\n📋 Sample step data structure:');
      console.log(JSON.stringify(testStep, null, 2));
      
      console.log('\n🔍 Step 3: Testing comment attachment display logic...');
      
      testStep.comments.forEach((comment, index) => {
        console.log(`\n  Comment ${index + 1} display test:`);
        console.log(`    Has attachment_url: ${!!comment.attachment_url}`);
        console.log(`    attachment_url truthy: ${!!comment.attachment_url}`);
        console.log(`    attachment_url length: ${comment.attachment_url ? comment.attachment_url.length : 0}`);
        
        // Test the exact condition used in the frontend
        const shouldShowAttachment = comment.attachment_url && comment.attachment_url.trim() !== '';
        console.log(`    Should show attachment: ${shouldShowAttachment}`);
        
        if (shouldShowAttachment) {
          console.log(`    ✅ Attachment will be displayed`);
          console.log(`    🔗 URL: ${comment.attachment_url}`);
        } else {
          console.log(`    ❌ Attachment will NOT be displayed`);
        }
      });
    }
    
    console.log('\n🔍 Step 4: Testing file access for attachments...');
    
    // Test file access for all attachments
    const attachments = stepsWithComments.filter(row => row.attachment_url);
    console.log(`📋 Found ${attachments.length} attachments to test`);
    
    for (const attachment of attachments) {
      console.log(`\n🔗 Testing: ${attachment.attachment_url}`);
      
      try {
        const response = await fetch(attachment.attachment_url);
        console.log(`  Status: ${response.status}`);
        
        if (response.ok) {
          console.log(`  ✅ Access successful`);
          console.log(`  Content-Type: ${response.headers.get('content-type')}`);
          console.log(`  Content-Length: ${response.headers.get('content-length')}`);
        } else {
          console.log(`  ❌ Access failed`);
          const errorText = await response.text();
          console.log(`  Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`  ❌ Network error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Comment display test completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${Object.keys(steps).length} steps found`);
    console.log(`  • ${attachments.length} attachments found`);
    console.log(`  • All attachments should be accessible`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check browser console for comment data logs');
    console.log('  2. Verify attachment links are clickable');
    console.log('  3. Test file downloads work correctly');
    
    // Test UI rendering simulation
    console.log('\n🎨 Testing UI rendering simulation...');

    Object.values(steps).forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.title}`);
      console.log(`    Comments: ${step.comments.length}`);
      
      if (step.comments.length > 0) {
        console.log(`    📝 Comments section will be rendered`);
        step.comments.forEach((comment, commentIndex) => {
          console.log(`      Comment ${commentIndex + 1}: ${comment.username}`);
          console.log(`        Text: "${comment.text}"`);
          
          if (comment.attachment_url) {
            console.log(`        ✅ Attachment link will be rendered`);
            console.log(`        🔗 URL: ${comment.attachment_url}`);
          } else {
            console.log(`        ❌ No attachment link`);
          }
        });
      } else {
        console.log(`    📝 No comments section`);
      }
    });

    console.log('\n✅ UI rendering simulation completed!');
    console.log('   All comments should be visible in the UI now.');
    
  } catch (error) {
    console.error('❌ Failed to test comment display:', error.message);
    process.exit(1);
  }
}

testCommentDisplay(); 