import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function updateClientLinksTable() {
  try {
    console.log('🔧 Updating client_links table...');
    
    // Add new columns to existing table one by one
    await sql`ALTER TABLE client_links ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'admin'`;
    await sql`ALTER TABLE client_links ADD COLUMN IF NOT EXISTS link_type TEXT NOT NULL DEFAULT 'admin' CHECK (link_type IN ('admin', 'client'))`;
    await sql`ALTER TABLE client_links ADD COLUMN IF NOT EXISTS user_id TEXT`;
    await sql`ALTER TABLE client_links ADD COLUMN IF NOT EXISTS user_role TEXT`;
    
    console.log('✅ New columns added to client_links table');
    
    // Update existing records to have proper values
    await sql`UPDATE client_links SET created_by = 'admin' WHERE created_by IS NULL`;
    await sql`UPDATE client_links SET link_type = 'admin' WHERE link_type IS NULL`;
    await sql`UPDATE client_links SET user_role = 'admin' WHERE user_role IS NULL`;
    
    console.log('✅ Existing records updated with default values');
    
    // Create index for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_client_links_link_type ON client_links(link_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_links_created_by ON client_links(created_by)`;
    
    console.log('✅ Indexes created');
    
    // Verify table structure
    const result = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'client_links' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Updated table structure:');
    result.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
    // Check current data
    const count = await sql`SELECT COUNT(*) as count FROM client_links;`;
    const typeCount = await sql`
      SELECT link_type, COUNT(*) as count 
      FROM client_links 
      GROUP BY link_type;
    `;
    
    console.log(`\n📊 Current data:`);
    console.log(`- Total links: ${count[0].count}`);
    typeCount.forEach(row => {
      console.log(`- ${row.link_type} links: ${row.count}`);
    });
    
    console.log('\n🎉 client_links table update complete!');
    
  } catch (error) {
    console.error('❌ Error updating client_links table:', error);
    process.exit(1);
  }
}

// Run the function
updateClientLinksTable(); 