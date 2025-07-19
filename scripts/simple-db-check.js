import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function simpleDbCheck() {
  try {
    console.log('🔍 Simple database check...\n');
    
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'client_files'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 client_files table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if table has data
    const count = await sql`SELECT COUNT(*) as count FROM client_files`;
    console.log(`\n📁 Total files in table: ${count[0].count}`);
    
    // Check sample data
    const sample = await sql`SELECT * FROM client_files LIMIT 1`;
    if (sample.length > 0) {
      console.log('\n📋 Sample file data:');
      console.log('  Keys:', Object.keys(sample[0]));
      console.log('  Values:', sample[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

simpleDbCheck(); 