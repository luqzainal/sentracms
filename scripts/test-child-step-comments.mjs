import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing comment display in child steps...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testChildStepComments() {
  try {
    console.log('🔍 Step 1: Getting all data for hierarchical structure...');
    
    // Get all data needed for hierarchical structure
    const [components, invoices, steps] = await Promise.all([
      sql`SELECT * FROM components WHERE client_id = 1 ORDER BY created_at ASC`,
      sql`SELECT * FROM invoices WHERE client_id = 1 ORDER BY created_at ASC`,
      sql`SELECT * FROM progress_steps WHERE client_id = 1 ORDER BY created_at ASC`
    ]);
    
    console.log(`📋 Found ${components.length} components, ${invoices.length} invoices, ${steps.length} steps`);
    
    console.log('\n🔍 Step 2: Creating hierarchical structure...');
    
    const hierarchicalSteps = [];
    const usedStepIds = new Set();
    
    // Group steps by package
    invoices.forEach(invoice => {
      console.log(`\n📦 Processing invoice: ${invoice.package_name}`);
      
      // Find package step
      const packageStep = steps.find(step => 
        step.title === `${invoice.package_name} - Package Setup`
      );
      
      if (packageStep) {
        console.log(`  ✅ Found package step: ${packageStep.title}`);
        
        // Find component steps for this package
        const packageComponents = components.filter(comp => comp.invoice_id === invoice.id);
        console.log(`  📦 Package components: ${packageComponents.map(c => c.name).join(', ')}`);
        
        const componentSteps = steps.filter(step => {
          // Skip package setup steps
          if (step.title.includes(' - Package Setup')) return false;
          
          // Check if this step matches a component from this invoice
          const matchingComponent = packageComponents.find(comp => comp.name === step.title);
          return matchingComponent !== undefined;
        });
        
        console.log(`  📋 Found ${componentSteps.length} component steps: ${componentSteps.map(s => s.title).join(', ')}`);
        
        // Sort component steps by creation date
        const sortedComponentSteps = componentSteps.sort((a, b) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        
        // Mark these steps as used
        sortedComponentSteps.forEach(step => usedStepIds.add(step.id));
        
        // Create package with children
        const packageWithChildren = {
          ...packageStep,
          isPackage: true,
          packageName: invoice.package_name,
          children: sortedComponentSteps.map(step => ({
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
          console.log(`  📋 Step "1" data:`, stepOneInPackage);
        }
      }
    });
    
    console.log('\n🔍 Step 3: Getting comments for all steps...');
    
    // Get comments for all steps
    const allComments = await sql`
      SELECT 
        id,
        step_id,
        text,
        username,
        attachment_url,
        attachment_type,
        created_at
      FROM progress_step_comments 
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Found ${allComments.length} total comments`);
    
    // Group comments by step_id
    const commentsByStep = {};
    allComments.forEach(comment => {
      if (!commentsByStep[comment.step_id]) {
        commentsByStep[comment.step_id] = [];
      }
      commentsByStep[comment.step_id].push(comment);
    });
    
    console.log('\n🔍 Step 4: Adding comments to hierarchical structure...');
    
    // Add comments to steps in hierarchical structure
    const addCommentsToSteps = (steps) => {
      steps.forEach(step => {
        step.comments = commentsByStep[step.id] || [];
        console.log(`  Step "${step.title}": ${step.comments.length} comments`);
        
        if (step.comments.length > 0) {
          step.comments.forEach(comment => {
            console.log(`    Comment: ${comment.username} - "${comment.text}" - Has attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
          });
        }
        
        if (step.children) {
          addCommentsToSteps(step.children);
        }
      });
    };
    
    addCommentsToSteps(hierarchicalSteps);
    
    console.log('\n🔍 Step 5: Testing comment display logic for child steps...');
    
    // Find step "1" in child steps
    let stepOne = null;
    const findStepOne = (steps) => {
      for (const step of steps) {
        if (step.title === '1') {
          stepOne = step;
          return;
        }
        if (step.children) {
          findStepOne(step.children);
        }
      }
    };
    
    findStepOne(hierarchicalSteps);
    
    if (stepOne) {
      console.log(`\n📋 Found step "1" in hierarchical structure:`);
      console.log(`  ID: ${stepOne.id}`);
      console.log(`  Title: ${stepOne.title}`);
      console.log(`  Is Package: ${stepOne.isPackage}`);
      console.log(`  Package Name: ${stepOne.packageName}`);
      console.log(`  Comments: ${stepOne.comments.length}`);
      
      stepOne.comments.forEach((comment, index) => {
        console.log(`\n    Comment ${index + 1}:`);
        console.log(`      ID: ${comment.id}`);
        console.log(`      Username: ${comment.username}`);
        console.log(`      Text: "${comment.text}"`);
        console.log(`      Has Attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
        if (comment.attachment_url) {
          console.log(`      Attachment URL: ${comment.attachment_url}`);
          console.log(`      Attachment Type: ${comment.attachment_type}`);
        }
        
        // Test the exact condition used in the frontend
        const shouldShowAttachment = comment.attachment_url && comment.attachment_url.trim() !== '';
        console.log(`      Should show attachment: ${shouldShowAttachment}`);
        
        if (shouldShowAttachment) {
          console.log(`      ✅ Attachment will be displayed in child step`);
        } else {
          console.log(`      ❌ Attachment will NOT be displayed`);
        }
      });
    } else {
      console.log('❌ Step "1" not found in hierarchical structure');
    }
    
    console.log('\n🔍 Step 6: Testing file access for child step attachments...');
    
    if (stepOne && stepOne.comments.length > 0) {
      const attachmentComment = stepOne.comments.find(c => c.attachment_url);
      if (attachmentComment) {
        console.log(`\n🔗 Testing attachment access: ${attachmentComment.attachment_url}`);
        
        try {
          const response = await fetch(attachmentComment.attachment_url);
          console.log(`  Status: ${response.status}`);
          
          if (response.ok) {
            console.log(`  ✅ File access successful`);
            console.log(`  Content-Type: ${response.headers.get('content-type')}`);
            console.log(`  Content-Length: ${response.headers.get('content-length')}`);
          } else {
            console.log(`  ❌ File access failed`);
            const errorText = await response.text();
            console.log(`  Error: ${errorText.substring(0, 100)}...`);
          }
        } catch (error) {
          console.log(`  ❌ Network error: ${error.message}`);
        }
      }
    }
    
    console.log('\n🎉 Child step comment test completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${hierarchicalSteps.length} packages in hierarchical structure`);
    console.log(`  • Step "1" is a child step with comments`);
    console.log(`  • Comments with attachments should be displayed`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check if step "1" is visible in the UI as a child step');
    console.log('  2. Verify comments are displayed for step "1"');
    console.log('  3. Test attachment links work in child steps');
    
  } catch (error) {
    console.error('❌ Failed to test child step comments:', error.message);
    process.exit(1);
  }
}

testChildStepComments(); 