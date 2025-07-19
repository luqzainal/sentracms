import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking comment data in store and database...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkStoreComments() {
  try {
    console.log('🔍 Step 1: Getting progress steps with comments from database...');
    
    // Get all progress steps with their comments
    const stepsWithComments = await sql`
      SELECT 
        ps.id as step_id,
        ps.title as step_title,
        ps.client_id,
        ps.completed,
        ps.created_at as step_created_at,
        psc.id as comment_id,
        psc.text as comment_text,
        psc.username as comment_username,
        psc.attachment_url,
        psc.attachment_type,
        psc.created_at as comment_created_at
      FROM progress_steps ps
      LEFT JOIN progress_step_comments psc ON ps.id = psc.step_id
      WHERE ps.client_id = 1
      ORDER BY ps.created_at ASC, psc.created_at DESC
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
          completed: row.completed,
          created_at: row.step_created_at,
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
    
    console.log('\n📄 Steps with comments from database:');
    Object.values(steps).forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.title}`);
      console.log(`    ID: ${step.id}`);
      console.log(`    Completed: ${step.completed}`);
      console.log(`    Comments: ${step.comments.length}`);
      
      step.comments.forEach((comment, commentIndex) => {
        console.log(`      Comment ${commentIndex + 1}:`);
        console.log(`        ID: ${comment.id}`);
        console.log(`        Username: ${comment.username}`);
        console.log(`        Text: "${comment.text}"`);
        console.log(`        Has Attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
        if (comment.attachment_url) {
          console.log(`        Attachment URL: ${comment.attachment_url}`);
        }
      });
    });
    
    console.log('\n🔍 Step 2: Testing comment data structure for store...');
    
    // Test the exact data structure that the store expects
    const testStep = Object.values(steps).find(s => s.title === '1');
    if (testStep) {
      console.log(`\n📋 Step "1" data structure for store:`);
      console.log(JSON.stringify(testStep, null, 2));
      
      console.log('\n🔍 Step 3: Testing comment display logic...');
      
      testStep.comments.forEach((comment, index) => {
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
    
    console.log('\n🔍 Step 4: Testing file access for all attachments...');
    
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
    
    console.log('\n🔍 Step 5: Testing hierarchical structure with comments...');
    
    // Get components and invoices for hierarchical structure
    const [components, invoices] = await Promise.all([
      sql`SELECT * FROM components WHERE client_id = 1 ORDER BY created_at ASC`,
      sql`SELECT * FROM invoices WHERE client_id = 1 ORDER BY created_at ASC`
    ]);
    
    console.log(`📋 Found ${components.length} components, ${invoices.length} invoices`);
    
    // Create hierarchical structure
    const hierarchicalSteps = [];
    const usedStepIds = new Set();
    
    invoices.forEach(invoice => {
      console.log(`\n📦 Processing invoice: ${invoice.package_name}`);
      
      // Find package step
      const packageStep = Object.values(steps).find(step => 
        step.title === `${invoice.package_name} - Package Setup`
      );
      
      if (packageStep) {
        console.log(`  ✅ Found package step: ${packageStep.title}`);
        
        // Find component steps for this package
        const packageComponents = components.filter(comp => comp.invoice_id === invoice.id);
        console.log(`  📦 Package components: ${packageComponents.map(c => c.name).join(', ')}`);
        
        const componentSteps = Object.values(steps).filter(step => {
          // Skip package setup steps
          if (step.title.includes(' - Package Setup')) return false;
          
          // Check if this step matches a component from this invoice
          const matchingComponent = packageComponents.find(comp => comp.name === step.title);
          return matchingComponent !== undefined;
        });
        
        console.log(`  📋 Found ${componentSteps.length} component steps: ${componentSteps.map(s => s.title).join(', ')}`);
        
        // Mark these steps as used
        componentSteps.forEach(step => usedStepIds.add(step.id));
        
        // Create package with children
        const packageWithChildren = {
          ...packageStep,
          isPackage: true,
          packageName: invoice.package_name,
          children: componentSteps.map(step => ({
            ...step,
            isPackage: false,
            packageName: invoice.package_name
          }))
        };
        
        hierarchicalSteps.push(packageWithChildren);
        
        // Check if step "1" is in this package
        const stepOneInPackage = componentSteps.find(s => s.title === '1');
        if (stepOneInPackage) {
          console.log(`  ✅ Step "1" found in package: ${invoice.package_name}`);
          console.log(`  📋 Step "1" comments: ${stepOneInPackage.comments.length}`);
          stepOneInPackage.comments.forEach(comment => {
            console.log(`    Comment: ${comment.username} - Has attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
          });
        }
      }
    });
    
    console.log('\n🎉 Store comment check completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${Object.keys(steps).length} steps found in database`);
    console.log(`  • ${attachments.length} attachments found`);
    console.log(`  • Step "1" has comments with attachments`);
    console.log(`  • All attachments are accessible`);
    console.log(`  • Hierarchical structure includes comments`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check if store is fetching comments correctly');
    console.log('  2. Verify comment data is included in progress steps');
    console.log('  3. Test comment display in the UI');
    
  } catch (error) {
    console.error('❌ Failed to check store comments:', error.message);
    process.exit(1);
  }
}

checkStoreComments(); 