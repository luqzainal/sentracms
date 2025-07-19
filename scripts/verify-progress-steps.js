import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function verifyProgressSteps() {
  try {
    console.log('🔍 Verifying progress steps structure...\n');
    
    // Get client ID for Mohd Shafiq
    const client = await sql`
      SELECT id, name FROM clients WHERE name = 'Mohd Shafiq' LIMIT 1;
    `;
    
    if (client.length === 0) {
      console.log('❌ Client Mohd Shafiq not found');
      return;
    }
    
    const clientId = client[0].id;
    console.log(`✅ Client: ${client[0].name} (ID: ${clientId})`);
    
    // Get invoice for ai voice call
    const invoice = await sql`
      SELECT id, package_name FROM invoices WHERE client_id = ${clientId} AND package_name = 'ai voice call' LIMIT 1;
    `;
    
    if (invoice.length === 0) {
      console.log('❌ Invoice for ai voice call not found');
      return;
    }
    
    const invoiceId = invoice[0].id;
    console.log(`✅ Invoice: ${invoice[0].package_name} (ID: ${invoiceId})`);
    
    // Get all components for this invoice
    const components = await sql`
      SELECT id, name FROM components WHERE invoice_id = ${invoiceId} ORDER BY name;
    `;
    
    console.log(`\n📋 Components in invoice (${components.length}):`);
    components.forEach(comp => {
      console.log(`  - ${comp.name}`);
    });
    
    // Get all progress steps for this client
    const progressSteps = await sql`
      SELECT id, title, completed, important FROM progress_steps WHERE client_id = ${clientId} ORDER BY title;
    `;
    
    console.log(`\n📋 Progress steps (${progressSteps.length}):`);
    progressSteps.forEach(step => {
      const status = step.completed ? '✅' : '⏳';
      const important = step.important ? '⭐' : '';
      console.log(`  ${status} ${important} ${step.title}`);
    });
    
    // Check which components are in progress steps
    console.log('\n🔍 Component mapping:');
    components.forEach(comp => {
      const matchingStep = progressSteps.find(step => step.title === comp.name);
      if (matchingStep) {
        const status = matchingStep.completed ? '✅' : '⏳';
        console.log(`  ${status} ${comp.name} -> Found in progress steps`);
      } else {
        console.log(`  ❌ ${comp.name} -> NOT found in progress steps`);
      }
    });
    
    // Check package setup step
    const packageStep = progressSteps.find(step => step.title === 'ai voice call - Package Setup');
    if (packageStep) {
      console.log(`\n📦 Package setup step: ${packageStep.title} (${packageStep.completed ? 'Completed' : 'Pending'})`);
    } else {
      console.log('\n❌ Package setup step not found');
    }
    
    // Summary
    const completedSteps = progressSteps.filter(step => step.completed).length;
    const totalSteps = progressSteps.length;
    const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total components: ${components.length}`);
    console.log(`  - Total progress steps: ${totalSteps}`);
    console.log(`  - Completed steps: ${completedSteps}`);
    console.log(`  - Completion rate: ${completionRate}%`);
    
    console.log('\n✅ Progress steps verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying progress steps:', error.message);
  }
}

verifyProgressSteps().catch(console.error); 