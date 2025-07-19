import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkClientTags() {
  try {
    console.log('🔍 Checking client tags in database...');
    
    // Get all clients with their tags
    const clients = await sql`
      SELECT id, name, business_name, email, tags 
      FROM clients 
      ORDER BY created_at DESC 
      LIMIT 10;
    `;
    
    console.log('\n📋 Client tags from database:');
    clients.forEach(client => {
      console.log(`\nClient ID: ${client.id}`);
      console.log(`Name: ${client.name}`);
      console.log(`Business: ${client.business_name}`);
      console.log(`Email: ${client.email}`);
      console.log(`Tags: ${JSON.stringify(client.tags)}`);
      console.log(`Tags type: ${typeof client.tags}`);
      console.log(`Tags length: ${client.tags?.length || 0}`);
      console.log('---');
    });
    
    // Check tags table
    console.log('\n🏷️  Global tags from tags table:');
    const tags = await sql`
      SELECT id, name, color 
      FROM tags 
      ORDER BY created_at DESC;
    `;
    
    tags.forEach(tag => {
      console.log(`- ${tag.name} (${tag.color})`);
    });
    
    console.log(`\n✅ Total clients: ${clients.length}`);
    console.log(`✅ Total global tags: ${tags.length}`);
    
  } catch (error) {
    console.error('❌ Error checking client tags:', error.message);
  }
}

checkClientTags().catch(console.error); 