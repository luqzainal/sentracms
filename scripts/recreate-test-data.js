import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function recreateTestData() {
  try {
    console.log('🔧 Recreating test data...\n');
    
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
    
    // Create invoice
    const invoice = await sql`
      INSERT INTO invoices (
        client_id,
        package_name,
        amount,
        due
      ) VALUES (
        ${clientId},
        'ai voice call',
        5000.00,
        5000.00
      ) RETURNING id;
    `;
    
    const invoiceId = invoice[0].id;
    console.log(`✅ Created invoice: ai voice call (ID: ${invoiceId})`);
    
    // Create components
    const components = [
      'KOMPONEN #1 : SETUP SOFTWARE KUASAPLUS 6 BULAN',
      'KOMPONEN #2 : SERVIS SETUP CENTRALIZE FB, IG & WHATSAPP',
      'KOMPONEN #3 : SERVIS SETUP INTEGRATE GOOGLE MY BUSINESS',
      'KOMPONEN #4 : SERVIS SETUP WHATSAPP BLASTING SYSTEM',
      'KOMPONEN #5 : SERVIS SETUP PROMPT WHATSAPP AI',
      'KOMPONEN #6 : WHATSAPP AI CHATBOT MONITORING & TRAINING',
      'KOMPONEN #7 : EXCLUSIVE GROUP HANDOVER',
      'EXTRA BONUS 1 : SERVIS SETUP FB/IG AI AUTOREPLY COMMENT',
      'EXTRA BONUS 2 : SERVIS SETUP FB/IG AI PM & DM'
    ];
    
    console.log(`\n📋 Creating ${components.length} components...`);
    for (const componentName of components) {
      await sql`
        INSERT INTO components (
          client_id,
          invoice_id,
          name
        ) VALUES (
          ${clientId},
          ${invoiceId},
          ${componentName}
        );
      `;
      console.log(`  ✅ Created component: ${componentName}`);
    }
    
    // Verify the creation
    const createdInvoice = await sql`
      SELECT id, package_name FROM invoices WHERE id = ${invoiceId};
    `;
    
    const createdComponents = await sql`
      SELECT id, name FROM components WHERE invoice_id = ${invoiceId};
    `;
    
    console.log(`\n📋 Verification:`);
    console.log(`  - Invoice: ${createdInvoice[0].package_name} (${createdInvoice[0].id})`);
    console.log(`  - Components: ${createdComponents.length}`);
    createdComponents.forEach(comp => {
      console.log(`    * ${comp.name}`);
    });
    
    console.log('\n✅ Test data recreated successfully!');
    
  } catch (error) {
    console.error('❌ Error recreating test data:', error.message);
  }
}

recreateTestData().catch(console.error); 