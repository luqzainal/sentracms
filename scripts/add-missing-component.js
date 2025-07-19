import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function addMissingComponent() {
  try {
    console.log('🔧 Adding missing Komponen #1 to progress steps...');
    
    // Get client ID for Mohd Shafiq
    const client = await sql`
      SELECT id FROM clients WHERE name = 'Mohd Shafiq' LIMIT 1;
    `;
    
    if (client.length === 0) {
      console.log('❌ Client Mohd Shafiq not found');
      return;
    }
    
    const clientId = client[0].id;
    console.log(`✅ Found client ID: ${clientId}`);
    
    // Get invoice for ai voice call
    const invoice = await sql`
      SELECT id FROM invoices WHERE client_id = ${clientId} AND package_name = 'ai voice call' LIMIT 1;
    `;
    
    if (invoice.length === 0) {
      console.log('❌ Invoice for ai voice call not found');
      return;
    }
    
    const invoiceId = invoice[0].id;
    console.log(`✅ Found invoice ID: ${invoiceId}`);
    
    // Check if Komponen #1 already exists in progress steps
    const existingStep = await sql`
      SELECT id FROM progress_steps 
      WHERE client_id = ${clientId} 
      AND title = 'KOMPONEN #1: KUASAPLUS 6 BULAN';
    `;
    
    if (existingStep.length > 0) {
      console.log('✅ Komponen #1 already exists in progress steps');
      return;
    }
    
    // Add Komponen #1 to progress steps
    const newStep = await sql`
      INSERT INTO progress_steps (
        client_id, 
        title, 
        description, 
        deadline, 
        completed, 
        important, 
        comments
      ) VALUES (
        ${clientId},
        'KOMPONEN #1: KUASAPLUS 6 BULAN',
        'Complete the KOMPONEN #1: KUASAPLUS 6 BULAN component',
        ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()},
        false,
        true,
        '[]'::jsonb
      ) RETURNING id;
    `;
    
    console.log(`✅ Added Komponen #1 with ID: ${newStep[0].id}`);
    
    // Verify all components are in progress steps
    const allComponents = await sql`
      SELECT name FROM components WHERE invoice_id = ${invoiceId} ORDER BY name;
    `;
    
    const progressSteps = await sql`
      SELECT title FROM progress_steps WHERE client_id = ${clientId} ORDER BY title;
    `;
    
    console.log('\n📋 All components in invoice:');
    allComponents.forEach(comp => {
      console.log(`  - ${comp.name}`);
    });
    
    console.log('\n📋 All progress steps:');
    progressSteps.forEach(step => {
      console.log(`  - ${step.title}`);
    });
    
    // Check which components are missing from progress steps
    const missingComponents = allComponents.filter(comp => 
      !progressSteps.some(step => step.title === comp.name)
    );
    
    if (missingComponents.length > 0) {
      console.log('\n⚠️  Missing components in progress steps:');
      missingComponents.forEach(comp => {
        console.log(`  - ${comp.name}`);
      });
    } else {
      console.log('\n✅ All components are in progress steps!');
    }
    
  } catch (error) {
    console.error('❌ Error adding missing component:', error.message);
  }
}

addMissingComponent().catch(console.error); 