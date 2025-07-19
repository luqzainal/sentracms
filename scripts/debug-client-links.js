import { neon } from '@neondatabase/serverless';

// Use the same connection string as the app
const connectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(connectionString);

async function debugClientLinks() {
  try {
    console.log('🔍 Checking client links in database...\n');
    
    // Check all client links
    const clientLinks = await sql`
      SELECT 
        id,
        client_id,
        title,
        url,
        link_type,
        created_at
      FROM client_links
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${clientLinks.length} client links in database:\n`);
    
    clientLinks.forEach((link, index) => {
      console.log(`Link ${index + 1}:`);
      console.log(`  ID: ${link.id}`);
      console.log(`  Client ID: ${link.client_id}`);
      console.log(`  Title: ${link.title}`);
      console.log(`  URL: ${link.url}`);
      console.log(`  Link Type: ${link.link_type}`);
      console.log(`  Created At: ${link.created_at}`);
      console.log('');
    });
    
    // Check links by client ID (assuming client ID 1 for Evo Dagang)
    console.log('🔍 Checking links for specific clients...\n');
    
    const clientIds = [1, 2, 3]; // Check first few clients
    for (const clientId of clientIds) {
      const linksForClient = await sql`
        SELECT 
          id,
          client_id,
          title,
          url,
          link_type,
          created_at
        FROM client_links
        WHERE client_id = ${clientId}
        ORDER BY created_at DESC
      `;
      
      console.log(`🔗 Client ID ${clientId}: ${linksForClient.length} links`);
      if (linksForClient.length > 0) {
        linksForClient.forEach((link, index) => {
          console.log(`  Link ${index + 1}: ${link.title} (${link.link_type}) - ${link.url}`);
        });
      }
      console.log('');
    }
    
    // Check database schema
    console.log('🔧 Checking client_links table schema...\n');
    
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'client_links'
      ORDER BY ordinal_position
    `;
    
    console.log('Client links table columns:');
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging client links:', error);
  }
}

debugClientLinks(); 