import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function debugFileData() {
  try {
    console.log('🔍 Debugging file data structure...\n');
    
    // Get raw data from database
    const rawFiles = await sql`SELECT * FROM client_files WHERE client_id = 1 LIMIT 1`;
    
    if (rawFiles.length > 0) {
      const file = rawFiles[0];
      console.log('📋 Raw database file:');
      console.log('  ID:', file.id, typeof file.id);
      console.log('  Client ID:', file.client_id, typeof file.client_id);
      console.log('  File Name:', file.file_name, typeof file.file_name);
      console.log('  File Size:', file.file_size, typeof file.file_size);
      console.log('  File URL:', file.file_url, typeof file.file_url);
      console.log('  File Type:', file.file_type, typeof file.file_type);
      console.log('  Upload Date:', file.upload_date, typeof file.upload_date);
      console.log('  Created At:', file.created_at, typeof file.created_at);
      console.log('  Updated At:', file.updated_at, typeof file.updated_at);
      
      // Test mapping
      console.log('\n📄 Test mapping:');
      const mappedFile = {
        id: file.id,
        clientId: file.client_id,
        fileName: file.file_name,
        fileSize: file.file_size,
        fileUrl: file.file_url,
        fileType: file.file_type,
        uploadDate: file.upload_date,
        createdAt: file.created_at,
        updatedAt: file.updated_at
      };
      
      console.log('✅ Mapped file:', mappedFile);
    } else {
      console.log('❌ No files found for client 1');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugFileData(); 