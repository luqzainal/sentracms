import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkClientFiles() {
  try {
    console.log('🔍 Checking client_files table...\n');
    
    // Check if table exists
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'client_files'
    `;
    
    console.log('📋 Table exists:', tableExists.length > 0);
    
    if (tableExists.length > 0) {
      // Count files
      const fileCount = await sql`SELECT COUNT(*) as count FROM client_files`;
      console.log('📁 Total files in database:', fileCount[0].count);
      
      // Show sample files
      const sampleFiles = await sql`
        SELECT id, client_id, file_name, file_size, created_at 
        FROM client_files 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      
      console.log('\n📄 Sample files:');
      sampleFiles.forEach(file => {
        console.log(`  - ID: ${file.id} | Client: ${file.client_id} | File: ${file.file_name} | Size: ${file.file_size} | Date: ${file.created_at}`);
      });
    } else {
      console.log('❌ client_files table does not exist!');
      console.log('💡 Run database setup to create the table');
    }
    
  } catch (error) {
    console.error('❌ Error checking client files:', error);
  } finally {
    process.exit(0);
  }
}

checkClientFiles(); 