import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkRawDb() {
  try {
    console.log('🔍 Checking raw database data...\n');
    
    // Get raw data without aliases
    const rawFiles = await sql`SELECT * FROM client_files WHERE client_id = 1`;
    
    console.log(`📋 Raw files for client 1: ${rawFiles.length}`);
    
    if (rawFiles.length > 0) {
      const rawFile = rawFiles[0];
      console.log('📋 Raw file object:', rawFile);
      console.log('📋 Raw file keys:', Object.keys(rawFile));
      
      // Check specific fields
      console.log('\n📋 Field values:');
      console.log('  id:', rawFile.id, typeof rawFile.id);
      console.log('  client_id:', rawFile.client_id, typeof rawFile.client_id);
      console.log('  file_name:', rawFile.file_name, typeof rawFile.file_name);
      console.log('  file_size:', rawFile.file_size, typeof rawFile.file_size);
      console.log('  file_url:', rawFile.file_url, typeof rawFile.file_url);
      console.log('  file_type:', rawFile.file_type, typeof rawFile.file_type);
      console.log('  upload_date:', rawFile.upload_date, typeof rawFile.upload_date);
      console.log('  created_at:', rawFile.created_at, typeof rawFile.created_at);
      console.log('  updated_at:', rawFile.updated_at, typeof rawFile.updated_at);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkRawDb(); 