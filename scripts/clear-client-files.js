import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function clearClientFiles() {
  try {
    console.log('🗑️ Clearing all client files from database...\n');
    
    // Count files before deletion
    const countBefore = await sql`SELECT COUNT(*) as count FROM client_files`;
    console.log(`📋 Files before deletion: ${countBefore[0].count}`);
    
    // Delete all files
    const result = await sql`DELETE FROM client_files`;
    console.log('✅ All client files deleted');
    
    // Count files after deletion
    const countAfter = await sql`SELECT COUNT(*) as count FROM client_files`;
    console.log(`📋 Files after deletion: ${countAfter[0].count}`);
    
    console.log('\n✅ Database cleared! Now test file upload fresh.');
    
  } catch (error) {
    console.error('❌ Error clearing files:', error);
  } finally {
    process.exit(0);
  }
}

clearClientFiles(); 