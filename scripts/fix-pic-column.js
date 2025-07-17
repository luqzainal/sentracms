import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env file
dotenv.config();

const neonConnectionString = process.env.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('❌ VITE_NEON_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(neonConnectionString);

async function fixPicColumn() {
  try {
    console.log('🔧 Fixing pic column in clients table...');
    
    // Check if pic column exists
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'pic';
    `;
    
    if (columns.length === 0) {
      console.log('📝 Adding pic column to clients table...');
      
      // Add pic column
      await sql`
        ALTER TABLE clients 
        ADD COLUMN pic TEXT;
      `;
      
      console.log('✅ pic column added successfully');
    } else {
      console.log('✅ pic column already exists');
    }
    
    // Check if other missing columns exist
    const missingColumns = [
      'last_activity',
      'invoice_count', 
      'company',
      'address',
      'notes'
    ];
    
    for (const column of missingColumns) {
      const exists = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'clients' AND column_name = ${column};
      `;
      
      if (exists.length === 0) {
        console.log(`📝 Adding ${column} column to clients table...`);
        
        let columnType = 'TEXT';
        if (column === 'last_activity') columnType = 'DATE DEFAULT CURRENT_DATE';
        if (column === 'invoice_count') columnType = 'INTEGER DEFAULT 0';
        
        await sql`ALTER TABLE clients ADD COLUMN ${sql.unsafe(column)} ${sql.unsafe(columnType)};`;
        console.log(`✅ ${column} column added successfully`);
      } else {
        console.log(`✅ ${column} column already exists`);
      }
    }
    
    console.log('\n🎉 Clients table structure fixed successfully!');
    
    // Verify the table structure
    const tableStructure = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Current clients table structure:');
    tableStructure.forEach(col => {
      console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing pic column:', error);
    process.exit(1);
  }
}

// Run the fix
fixPicColumn(); 