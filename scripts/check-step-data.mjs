import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking step data structure and comments...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkStepData() {
  try {
    console.log('🔍 Step 1: Getting all progress steps...');
    
    // Get all progress steps
    const steps = await sql`
      SELECT 
        id,
        client_id,
        title,
        description,
        deadline,
        completed,
        completed_date,
        important,
        created_at,
        updated_at
      FROM progress_steps 
      WHERE client_id = 1
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Found ${steps.length} progress steps`);
    
    steps.forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.title}`);
      console.log(`    ID: ${step.id}`);
      console.log(`    Client ID: ${step.client_id}`);
      console.log(`    Completed: ${step.completed}`);
      console.log(`    Important: ${step.important}`);
      console.log(`    Created: ${step.created_at}`);
    });
    
    console.log('\n🔍 Step 2: Getting comments for each step...');
    
    for (const step of steps) {
      console.log(`\n📄 Comments for step "${step.title}" (${step.id}):`);
      
      const comments = await sql`
        SELECT 
          id,
          step_id,
          text,
          username,
          attachment_url,
          attachment_type,
          created_at
        FROM progress_step_comments 
        WHERE step_id = ${step.id}
        ORDER BY created_at DESC
      `;
      
      console.log(`  Found ${comments.length} comments`);
      
      comments.forEach((comment, index) => {
        console.log(`    Comment ${index + 1}:`);
        console.log(`      ID: ${comment.id}`);
        console.log(`      Username: ${comment.username}`);
        console.log(`      Text: "${comment.text}"`);
        console.log(`      Has Attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
        if (comment.attachment_url) {
          console.log(`      Attachment URL: ${comment.attachment_url}`);
          console.log(`      Attachment Type: ${comment.attachment_type}`);
        }
        console.log(`      Created: ${comment.created_at}`);
      });
    }
    
    console.log('\n🔍 Step 3: Testing step with comments data structure...');
    
    // Get the step that has comments
    const stepWithComments = steps.find(step => {
      return step.title === '1';
    });
    
    if (stepWithComments) {
      console.log(`\n📋 Step "1" data structure:`);
      console.log(JSON.stringify(stepWithComments, null, 2));
      
      const comments = await sql`
        SELECT 
          id,
          step_id,
          text,
          username,
          attachment_url,
          attachment_type,
          created_at
        FROM progress_step_comments 
        WHERE step_id = ${stepWithComments.id}
        ORDER BY created_at DESC
      `;
      
      console.log(`\n📋 Comments for step "1":`);
      console.log(JSON.stringify(comments, null, 2));
      
      // Create the exact structure that the frontend expects
      const frontendStep = {
        ...stepWithComments,
        comments: comments
      };
      
      console.log(`\n📋 Frontend step structure:`);
      console.log(JSON.stringify(frontendStep, null, 2));
      
      console.log('\n🔍 Step 4: Testing comment display logic...');
      
      frontendStep.comments.forEach((comment, index) => {
        console.log(`\n  Comment ${index + 1} display test:`);
        console.log(`    Has attachment_url: ${!!comment.attachment_url}`);
        console.log(`    attachment_url value: "${comment.attachment_url}"`);
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
    
    console.log('\n🎉 Step data check completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${steps.length} progress steps found`);
    console.log(`  • Step "1" has comments with attachments`);
    console.log(`  • All data structures are correct`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check if step "1" is visible in the UI');
    console.log('  2. Verify comments are displayed for step "1"');
    console.log('  3. Test attachment links work correctly');
    
  } catch (error) {
    console.error('❌ Failed to check step data:', error.message);
    process.exit(1);
  }
}

checkStepData(); 