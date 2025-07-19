import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function fixComponentNames() {
  try {
    console.log('🔧 Fixing component names to match progress steps...\n');
    
    // Get client ID for Mohd Shafiq
    const client = await sql`
      SELECT id FROM clients WHERE name = 'Mohd Shafiq' LIMIT 1;
    `;
    
    if (client.length === 0) {
      console.log('❌ Client Mohd Shafiq not found');
      return;
    }
    
    const clientId = client[0].id;
    
    // Get invoice for ai voice call
    const invoice = await sql`
      SELECT id FROM invoices WHERE client_id = ${clientId} AND package_name = 'ai voice call' LIMIT 1;
    `;
    
    if (invoice.length === 0) {
      console.log('❌ Invoice for ai voice call not found');
      return;
    }
    
    const invoiceId = invoice[0].id;
    
    // Fix Komponen #1 name
    const updateResult = await sql`
      UPDATE components 
      SET name = 'KOMPONEN #1 : SETUP SOFTWARE KUASAPLUS 6 BULAN'
      WHERE invoice_id = ${invoiceId} 
      AND name = 'KOMPONEN #1 :  KUASAPLUS 6 BULAN';
    `;
    
    console.log('✅ Updated Komponen #1 name');
    
    // Verify the fix
    const components = await sql`
      SELECT name FROM components WHERE invoice_id = ${invoiceId} ORDER BY name;
    `;
    
    console.log('\n📋 Updated components:');
    components.forEach(comp => {
      console.log(`  - ${comp.name}`);
    });
    
    // Check progress steps again
    const progressSteps = await sql`
      SELECT title FROM progress_steps WHERE client_id = ${clientId} ORDER BY title;
    `;
    
    console.log('\n📋 Progress steps:');
    progressSteps.forEach(step => {
      console.log(`  - ${step.title}`);
    });
    
    // Check mapping again
    console.log('\n🔍 Component mapping after fix:');
    components.forEach(comp => {
      const matchingStep = progressSteps.find(step => step.title === comp.name);
      if (matchingStep) {
        console.log(`  ✅ ${comp.name} -> Found in progress steps`);
      } else {
        console.log(`  ❌ ${comp.name} -> NOT found in progress steps`);
      }
    });
    
    console.log('\n✅ Component names fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing component names:', error.message);
  }
}

fixComponentNames().catch(console.error); 