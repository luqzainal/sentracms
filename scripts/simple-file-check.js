import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkFiles() {
  try {
    console.log('🔍 Simple file check...\n');
    
    const files = await sql`SELECT * FROM client_files WHERE client_id = 1`;
    console.log(`📁 Files for client 1: ${files.length}`);
    
    files.forEach(file => {
      console.log(`  - ${file.file_name} (${file.file_size})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkFiles(); 