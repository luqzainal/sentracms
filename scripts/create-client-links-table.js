import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function createClientLinksTable() {
  try {
    console.log('🔧 Creating client_links table...');
    
    // Create client_links table
    await sql`
      CREATE TABLE IF NOT EXISTS client_links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        client_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    console.log('✅ client_links table created');
    
    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_client_links_client_id ON client_links(client_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_links_created_at ON client_links(created_at);`;
    
    console.log('✅ Indexes created');
    
    // Add foreign key constraint
    try {
      await sql`
        ALTER TABLE client_links ADD CONSTRAINT fk_client_links_client_id 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
      `;
      console.log('✅ Foreign key constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Foreign key constraint already exists');
      } else {
        console.warn('⚠️  Foreign key constraint failed:', error.message);
      }
    }
    
    // Verify table
    const result = await sql`
      SELECT table_name, column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'client_links' 
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ Table structure verified:', result.length, 'columns');
    
    const count = await sql`SELECT COUNT(*) as count FROM client_links;`;
    console.log('✅ Current links count:', count[0].count);
    
    console.log('\n🎉 client_links table setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating client_links table:', error);
    process.exit(1);
  }
}

// Run the function
createClientLinksTable(); 