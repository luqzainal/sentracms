import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function assignClientTags() {
  try {
    console.log('🏷️  Assigning tags to client...');
    
    // Assign tags to client ID 1 (Mohd Shafiq)
    const clientId = 1;
    const tagsToAssign = ['VIP', 'AYAM']; // Tags yang saya lihat dalam gambar
    
    await sql`
      UPDATE clients 
      SET tags = ${tagsToAssign}
      WHERE id = ${clientId};
    `;
    
    console.log(`✅ Assigned tags [${tagsToAssign.join(', ')}] to client ID ${clientId}`);
    
    // Verify the update
    const updatedClient = await sql`
      SELECT id, name, business_name, email, tags 
      FROM clients 
      WHERE id = ${clientId};
    `;
    
    if (updatedClient.length > 0) {
      const client = updatedClient[0];
      console.log('\n📋 Updated client:');
      console.log(`ID: ${client.id}`);
      console.log(`Name: ${client.name}`);
      console.log(`Business: ${client.business_name}`);
      console.log(`Email: ${client.email}`);
      console.log(`Tags: ${JSON.stringify(client.tags)}`);
      console.log(`Tags length: ${client.tags?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error assigning tags:', error.message);
  }
}

assignClientTags().catch(console.error); 