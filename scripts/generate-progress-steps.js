import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function generateProgressSteps() {
  try {
    console.log('🔧 Generating progress steps from components...\n');
    
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
    
    console.log(`\n📋 Components found (${components.length}):`);
    components.forEach(comp => {
      console.log(`  - ${comp.name}`);
    });
    
    // Check existing progress steps
    const existingSteps = await sql`
      SELECT title FROM progress_steps WHERE client_id = ${clientId};
    `;
    
    if (existingSteps.length > 0) {
      console.log(`\n⚠️  Found ${existingSteps.length} existing progress steps. Clearing them first...`);
      await sql`DELETE FROM progress_steps WHERE client_id = ${clientId};`;
      console.log('✅ Cleared existing progress steps');
    }
    
    // Generate progress steps
    console.log('\n🔧 Generating new progress steps...');
    
    // Add package setup step
    const packageDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days from now
    await sql`
      INSERT INTO progress_steps (
        client_id, 
        title, 
        description, 
        deadline, 
        completed, 
        important, 
        created_at,
        updated_at
      ) VALUES (
        ${clientId},
        'ai voice call - Package Setup',
        'Complete the setup and delivery of ai voice call package',
        ${packageDeadline.toISOString()},
        false,
        true,
        now(),
        now()
      );
    `;
    console.log('✅ Added package setup step');
    
    // Add component steps
    let componentIndex = 1;
    for (const component of components) {
      const deadline = new Date(Date.now() + (componentIndex * 7) * 24 * 60 * 60 * 1000); // 7 days apart
      const isImportant = component.name.includes('KOMPONEN #1') || component.name.includes('KOMPONEN #2');
      
      await sql`
        INSERT INTO progress_steps (
          client_id, 
          title, 
          description, 
          deadline, 
          completed, 
          important, 
          created_at,
          updated_at
        ) VALUES (
          ${clientId},
          ${component.name},
          ${`Complete the ${component.name} component`},
          ${deadline.toISOString()},
          false,
          ${isImportant},
          now(),
          now()
        );
      `;
      
      console.log(`✅ Added step: ${component.name} (${isImportant ? 'Important' : 'Normal'})`);
      componentIndex++;
    }
    
    // Verify the generation
    const newSteps = await sql`
      SELECT id, title, deadline, completed, important 
      FROM progress_steps 
      WHERE client_id = ${clientId} 
      ORDER BY created_at;
    `;
    
    console.log(`\n📋 Generated progress steps (${newSteps.length}):`);
    newSteps.forEach(step => {
      const deadline = new Date(step.deadline);
      const important = step.important ? '⭐' : '';
      console.log(`  ${important} ${step.title}`);
      console.log(`    Deadline: ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}`);
    });
    
    console.log('\n✅ Progress steps generation completed!');
    
  } catch (error) {
    console.error('❌ Error generating progress steps:', error.message);
  }
}

generateProgressSteps().catch(console.error); 