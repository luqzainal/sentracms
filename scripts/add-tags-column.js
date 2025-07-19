import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function addTagsColumn() {
  try {
    console.log('🔧 Adding tags column to clients table...');
    
    // Check if tags column already exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'tags';
    `;
    
    if (columns.length > 0) {
      console.log('✅ Tags column already exists in clients table');
    } else {
      // Add tags column
      await sql`
        ALTER TABLE clients 
        ADD COLUMN tags text[] DEFAULT '{}';
      `;
      console.log('✅ Tags column added to clients table');
    }
    
    // Add index for better performance
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);`;
      console.log('✅ Tags index created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Tags index already exists');
      } else {
        console.warn('⚠️  Error creating tags index:', error.message);
      }
    }
    
    // Verify the column was added
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Updated clients table structure:');
    tableStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if tags column exists now
    const tagsColumn = tableStructure.find(col => col.column_name === 'tags');
    if (tagsColumn) {
      console.log('\n✅ Tags column successfully added!');
      console.log(`   Type: ${tagsColumn.data_type}`);
      console.log(`   Default: ${tagsColumn.column_default}`);
    } else {
      console.log('\n❌ Tags column not found after adding');
    }
    
  } catch (error) {
    console.error('❌ Error adding tags column:', error.message);
  }
}

addTagsColumn().catch(console.error); 