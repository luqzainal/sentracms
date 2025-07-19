import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function resetFilesTest() {
  try {
    console.log('🔄 Resetting files test...\n');
    
    // Delete all files
    await sql`DELETE FROM client_files`;
    console.log('✅ All files deleted');
    
    // Add one test file
    const testFile = {
      clientId: 1,
      fileName: 'test-file.txt',
      fileSize: '0.1 MB',
      fileUrl: 'https://test.com/test-file.txt',
      fileType: 'text/plain',
      uploadDate: new Date().toISOString()
    };
    
    const result = await sql`
      INSERT INTO client_files (
        client_id, file_name, file_size, file_url, file_type, upload_date
      ) VALUES (
        ${testFile.clientId}, ${testFile.fileName}, ${testFile.fileSize}, 
        ${testFile.fileUrl}, ${testFile.fileType}, ${testFile.uploadDate}
      ) RETURNING *
    `;
    
    console.log('✅ Test file added:', result[0].file_name);
    
    // Check files
    const files = await sql`SELECT * FROM client_files WHERE client_id = 1`;
    console.log(`📁 Files for client 1: ${files.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

resetFilesTest(); 