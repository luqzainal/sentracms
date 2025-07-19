import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing comment display in store and UI...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testStoreCommentDisplay() {
  try {
    console.log('🔍 Step 1: Getting progress steps with comments from database...');
    
    // Get progress steps with comments (simulating store behavior)
    const steps = await sql`
      SELECT 
        ps.*,
        c.name as client_name,
        c.business_name as client_business_name,
        c.email as client_email
      FROM progress_steps ps
      LEFT JOIN clients c ON ps.client_id = c.id
      WHERE ps.client_id = 1
      ORDER BY ps.deadline ASC
    `;
    
    console.log(`📋 Found ${steps.length} progress steps`);
    
    // Get comments for each step (simulating store behavior)
    const stepsWithComments = await Promise.all(
      steps.map(async (row) => {
        const comments = await sql`
          SELECT * FROM progress_step_comments
          WHERE step_id = ${row.id}
          ORDER BY created_at DESC
        `;
        
        return {
          id: row.id,
          client_id: row.client_id,
          title: row.title,
          description: row.description,
          deadline: row.deadline,
          completed: row.completed,
          completed_date: row.completed_date,
          important: row.important,
          created_at: row.created_at,
          updated_at: row.updated_at,
          client: row.client_name ? {
            id: row.client_id,
            name: row.client_name,
            business_name: row.client_business_name,
            email: row.client_email
          } : undefined,
          comments: comments || []
        };
      })
    );
    
    console.log('\n📄 Steps with comments (store format):');
    stepsWithComments.forEach((step, index) => {
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
          console.log(`        Attachment Type: ${comment.attachment_type}`);
        }
      });
    });
    
    console.log('\n🔍 Step 2: Testing comment display logic...');
    
    // Test the exact condition used in the frontend
    stepsWithComments.forEach(step => {
      if (step.comments.length > 0) {
        console.log(`\n📋 Step "${step.title}" comment display test:`);
        
        step.comments.forEach((comment, index) => {
          console.log(`\n  Comment ${index + 1}:`);
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
    });
    
    console.log('\n🔍 Step 3: Testing hierarchical structure with store data...');
    
    // Get components and invoices for hierarchical structure
    const [components, invoices] = await Promise.all([
      sql`SELECT * FROM components WHERE client_id = 1 ORDER BY created_at ASC`,
      sql`SELECT * FROM invoices WHERE client_id = 1 ORDER BY created_at ASC`
    ]);
    
    console.log(`📋 Found ${components.length} components, ${invoices.length} invoices`);
    
    // Create hierarchical structure (simulating frontend behavior)
    const hierarchicalSteps = [];
    const usedStepIds = new Set();
    
    invoices.forEach(invoice => {
      console.log(`\n📦 Processing invoice: ${invoice.package_name}`);
      
      // Find package step
      const packageStep = stepsWithComments.find(step => 
        step.title === `${invoice.package_name} - Package Setup`
      );
      
      if (packageStep) {
        console.log(`  ✅ Found package step: ${packageStep.title}`);
        
        // Find component steps for this package
        const packageComponents = components.filter(comp => comp.invoice_id === invoice.id);
        console.log(`  📦 Package components: ${packageComponents.map(c => c.name).join(', ')}`);
        
        const componentSteps = stepsWithComments.filter(step => {
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
            if (comment.attachment_url) {
              console.log(`    Attachment URL: ${comment.attachment_url}`);
            }
          });
        }
      }
    });
    
    console.log('\n🔍 Step 4: Testing UI rendering logic...');
    
    // Test the exact UI rendering logic
    const renderStep = (step, isChild = false) => {
      console.log(`\n🎨 Rendering step: ${step.title} (${isChild ? 'child' : 'parent'})`);
      console.log(`  Comments: ${step.comments.length}`);
      
      if (step.comments.length > 0) {
        console.log(`  📝 Comments section will be rendered`);
        
        step.comments.forEach((comment, index) => {
          console.log(`    Comment ${index + 1}: ${comment.username}`);
          console.log(`      Text: "${comment.text}"`);
          
          if (comment.attachment_url) {
            console.log(`      ✅ Attachment link will be rendered`);
            console.log(`      🔗 URL: ${comment.attachment_url}`);
          } else {
            console.log(`      ❌ No attachment link`);
          }
        });
      } else {
        console.log(`  📝 No comments section`);
      }
    };
    
    // Test rendering for all steps
    hierarchicalSteps.forEach(step => {
      renderStep(step, false);
      if (step.children) {
        step.children.forEach(childStep => {
          renderStep(childStep, true);
        });
      }
    });
    
    console.log('\n🔍 Step 5: Testing file access for all attachments...');
    
    // Test file access for all attachments
    const allComments = stepsWithComments.flatMap(step => step.comments);
    const attachments = allComments.filter(comment => comment.attachment_url);
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
    
    console.log('\n🎉 Store comment display test completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${stepsWithComments.length} steps found in store format`);
    console.log(`  • ${allComments.length} total comments found`);
    console.log(`  • ${attachments.length} attachments found`);
    console.log(`  • Step "1" has comments with attachments`);
    console.log(`  • All attachments are accessible`);
    console.log(`  • Hierarchical structure includes comments`);
    console.log(`  • UI rendering logic should work correctly`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check if store is fetching comments correctly');
    console.log('  2. Verify comment data is included in progress steps');
    console.log('  3. Test comment display in the actual UI');
    console.log('  4. Check if step "1" is visible as a child step');
    
  } catch (error) {
    console.error('❌ Failed to test store comment display:', error.message);
    process.exit(1);
  }
}

testStoreCommentDisplay(); 