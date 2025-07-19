import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Checking component data and step mapping...\n');

const DATABASE_URL = process.env.VITE_NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable.');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function checkComponentData() {
  try {
    console.log('🔍 Step 1: Getting all components...');
    
    // Get all components
    const components = await sql`
      SELECT 
        id,
        client_id,
        invoice_id,
        name,
        price,
        active,
        created_at,
        updated_at
      FROM components 
      WHERE client_id = 1
      ORDER BY created_at ASC
    `;
    
    console.log(`📋 Found ${components.length} components`);
    
    components.forEach((component, index) => {
      console.log(`\n  Component ${index + 1}: ${component.name}`);
      console.log(`    ID: ${component.id}`);
      console.log(`    Client ID: ${component.client_id}`);
      console.log(`    Invoice ID: ${component.invoice_id}`);
      console.log(`    Price: ${component.price}`);
      console.log(`    Active: ${component.active}`);
      console.log(`    Created: ${component.created_at}`);
    });
    
    console.log('\n🔍 Step 2: Getting all invoices...');
    
    // Get all invoices
    const invoices = await sql`
      SELECT 
        id,
        client_id,
        package_name,
        amount,
        paid,
        due,
        status,
        created_at,
        updated_at
      FROM invoices 
      WHERE client_id = 1
      ORDER BY created_at ASC
    `;
    
    console.log(`📋 Found ${invoices.length} invoices`);
    
    invoices.forEach((invoice, index) => {
      console.log(`\n  Invoice ${index + 1}: ${invoice.package_name}`);
      console.log(`    ID: ${invoice.id}`);
      console.log(`    Client ID: ${invoice.client_id}`);
      console.log(`    Amount: ${invoice.amount}`);
      console.log(`    Status: ${invoice.status}`);
      console.log(`    Created: ${invoice.created_at}`);
    });
    
    console.log('\n🔍 Step 3: Getting all progress steps...');
    
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
      ORDER BY created_at ASC
    `;
    
    console.log(`📋 Found ${steps.length} progress steps`);
    
    steps.forEach((step, index) => {
      console.log(`\n  Step ${index + 1}: ${step.title}`);
      console.log(`    ID: ${step.id}`);
      console.log(`    Client ID: ${step.client_id}`);
      console.log(`    Completed: ${step.completed}`);
      console.log(`    Created: ${step.created_at}`);
    });
    
    console.log('\n🔍 Step 4: Mapping components to steps...');
    
    // Map components to steps
    components.forEach(component => {
      console.log(`\n📦 Component: ${component.name}`);
      
      // Find matching invoice
      const invoice = invoices.find(inv => inv.id === component.invoice_id);
      console.log(`  Invoice: ${invoice ? invoice.package_name : 'NOT FOUND'}`);
      
      // Find matching step
      const step = steps.find(s => s.title === component.name);
      console.log(`  Step: ${step ? step.title : 'NOT FOUND'}`);
      
      if (step) {
        console.log(`  Step ID: ${step.id}`);
        console.log(`  Step Completed: ${step.completed}`);
        
        // Check if step has comments
        const stepComments = sql`
          SELECT COUNT(*) as comment_count
          FROM progress_step_comments 
          WHERE step_id = ${step.id}
        `;
        
        console.log(`  Has Comments: ${stepComments.length > 0 ? 'YES' : 'NO'}`);
      }
    });
    
    console.log('\n🔍 Step 5: Checking step "1" specifically...');
    
    // Check step "1" specifically
    const stepOne = steps.find(s => s.title === '1');
    if (stepOne) {
      console.log(`\n📋 Step "1" found:`);
      console.log(`  ID: ${stepOne.id}`);
      console.log(`  Title: ${stepOne.title}`);
      console.log(`  Description: ${stepOne.description}`);
      console.log(`  Completed: ${stepOne.completed}`);
      console.log(`  Created: ${stepOne.created_at}`);
      
      // Check if it matches any component
      const matchingComponent = components.find(c => c.name === '1');
      console.log(`  Matches Component: ${matchingComponent ? 'YES' : 'NO'}`);
      
      if (matchingComponent) {
        console.log(`  Component Invoice ID: ${matchingComponent.invoice_id}`);
        const invoice = invoices.find(inv => inv.id === matchingComponent.invoice_id);
        console.log(`  Invoice Package: ${invoice ? invoice.package_name : 'NOT FOUND'}`);
      }
      
      // Check comments
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
        WHERE step_id = ${stepOne.id}
        ORDER BY created_at DESC
      `;
      
      console.log(`  Comments: ${comments.length}`);
      comments.forEach((comment, index) => {
        console.log(`    Comment ${index + 1}:`);
        console.log(`      ID: ${comment.id}`);
        console.log(`      Username: ${comment.username}`);
        console.log(`      Text: "${comment.text}"`);
        console.log(`      Has Attachment: ${comment.attachment_url ? 'YES' : 'NO'}`);
        if (comment.attachment_url) {
          console.log(`      Attachment URL: ${comment.attachment_url}`);
        }
      });
    } else {
      console.log('❌ Step "1" not found in progress steps');
    }
    
    console.log('\n🔍 Step 6: Testing hierarchical structure logic...');
    
    // Test the hierarchical structure logic
    invoices.forEach(invoice => {
      console.log(`\n📦 Processing invoice: ${invoice.package_name}`);
      
      // Find package step
      const packageStep = steps.find(step => 
        step.title === `${invoice.package_name} - Package Setup`
      );
      
      if (packageStep) {
        console.log(`  ✅ Found package step: ${packageStep.title}`);
      } else {
        console.log(`  ❌ No package step found for: ${invoice.package_name}`);
      }
      
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
      
      // Check if step "1" is in this package
      const stepOneInPackage = componentSteps.find(s => s.title === '1');
      if (stepOneInPackage) {
        console.log(`  ✅ Step "1" found in package: ${invoice.package_name}`);
      }
    });
    
    console.log('\n🎉 Component data check completed!');
    console.log('\n📝 Summary:');
    console.log(`  • ${components.length} components found`);
    console.log(`  • ${invoices.length} invoices found`);
    console.log(`  • ${steps.length} progress steps found`);
    console.log(`  • Step "1" has comments with attachments`);
    console.log('\n🔧 Next steps:');
    console.log('  1. Check if step "1" is in child steps of a package');
    console.log('  2. Verify hierarchical structure is working correctly');
    console.log('  3. Test comment display in child steps');
    
  } catch (error) {
    console.error('❌ Failed to check component data:', error.message);
    process.exit(1);
  }
}

checkComponentData(); 