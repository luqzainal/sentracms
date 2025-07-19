import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testClearAllSteps() {
  try {
    console.log('🔍 Testing Clear All Steps functionality...\n');
    
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
    
    // Check current data before clear
    console.log('\n📋 Current data before clear:');
    
    // Check invoices
    const invoices = await sql`
      SELECT id, package_name FROM invoices WHERE client_id = ${clientId};
    `;
    console.log(`  - Invoices: ${invoices.length}`);
    invoices.forEach(invoice => {
      console.log(`    * ${invoice.package_name} (${invoice.id})`);
    });
    
    // Check components
    const components = await sql`
      SELECT id, name, invoice_id FROM components WHERE invoice_id IN (
        SELECT id FROM invoices WHERE client_id = ${clientId}
      );
    `;
    console.log(`  - Components: ${components.length}`);
    components.forEach(comp => {
      console.log(`    * ${comp.name} (${comp.id}) - Invoice: ${comp.invoice_id}`);
    });
    
    // Check progress steps
    const progressSteps = await sql`
      SELECT id, title FROM progress_steps WHERE client_id = ${clientId};
    `;
    console.log(`  - Progress Steps: ${progressSteps.length}`);
    progressSteps.forEach(step => {
      console.log(`    * ${step.title} (${step.id})`);
    });
    
    // Simulate Clear All Steps process
    console.log('\n🗑️ Simulating Clear All Steps process...');
    
    // 1. Delete all components first
    if (components.length > 0) {
      console.log(`  Deleting ${components.length} components...`);
      for (const comp of components) {
        await sql`DELETE FROM components WHERE id = ${comp.id}`;
        console.log(`    ✅ Deleted component: ${comp.name}`);
      }
    }
    
    // 2. Delete all invoices
    if (invoices.length > 0) {
      console.log(`  Deleting ${invoices.length} invoices...`);
      for (const invoice of invoices) {
        await sql`DELETE FROM invoices WHERE id = ${invoice.id}`;
        console.log(`    ✅ Deleted invoice: ${invoice.package_name}`);
      }
    }
    
    // 3. Delete all progress steps
    if (progressSteps.length > 0) {
      console.log(`  Deleting ${progressSteps.length} progress steps...`);
      for (const step of progressSteps) {
        await sql`DELETE FROM progress_steps WHERE id = ${step.id}`;
        console.log(`    ✅ Deleted progress step: ${step.title}`);
      }
    }
    
    // Check data after clear
    console.log('\n📋 Data after clear:');
    
    const invoicesAfter = await sql`
      SELECT id, package_name FROM invoices WHERE client_id = ${clientId};
    `;
    console.log(`  - Invoices: ${invoicesAfter.length}`);
    
    const componentsAfter = await sql`
      SELECT id, name FROM components WHERE invoice_id IN (
        SELECT id FROM invoices WHERE client_id = ${clientId}
      );
    `;
    console.log(`  - Components: ${componentsAfter.length}`);
    
    const progressStepsAfter = await sql`
      SELECT id, title FROM progress_steps WHERE client_id = ${clientId};
    `;
    console.log(`  - Progress Steps: ${progressStepsAfter.length}`);
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`  - Invoices deleted: ${invoices.length}`);
    console.log(`  - Components deleted: ${components.length}`);
    console.log(`  - Progress steps deleted: ${progressSteps.length}`);
    console.log(`  - Total items deleted: ${invoices.length + components.length + progressSteps.length}`);
    
    if (invoicesAfter.length === 0 && componentsAfter.length === 0 && progressStepsAfter.length === 0) {
      console.log('\n✅ Clear All Steps test completed successfully!');
      console.log('   All data has been completely removed.');
    } else {
      console.log('\n⚠️  Some data still remains after clear.');
    }
    
  } catch (error) {
    console.error('❌ Error testing Clear All Steps:', error.message);
  }
}

testClearAllSteps().catch(console.error); 