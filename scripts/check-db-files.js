import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();
const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkDbFiles() {
  try {
    console.log('🔍 Checking database files and mapping...\n');
    
    // Get raw data from database
    const rawFiles = await sql`
      SELECT 
        id,
        client_id as clientId,
        file_name as fileName,
        file_size as fileSize,
        file_url as fileUrl,
        file_type as fileType,
        upload_date as uploadDate,
        created_at as createdAt,
        updated_at as updatedAt
      FROM client_files 
      WHERE client_id = 1
      ORDER BY created_at DESC
    `;
    
    console.log(`📋 Raw database files for client 1: ${rawFiles.length}`);
    
    if (rawFiles.length > 0) {
      const rawFile = rawFiles[0];
      console.log('📋 Sample raw file:', {
        id: rawFile.id,
        clientId: rawFile.clientId,
        fileName: rawFile.fileName,
        fileSize: rawFile.fileSize
      });
      
      // Simulate mapping
      console.log('\n📄 Simulating mapping...');
      const mappedFile = {
        id: rawFile.id,
        clientId: rawFile.clientId,
        fileName: rawFile.fileName,
        fileSize: rawFile.fileSize,
        fileUrl: rawFile.fileUrl,
        fileType: rawFile.fileType,
        uploadDate: rawFile.uploadDate instanceof Date ? rawFile.uploadDate.toISOString() : rawFile.uploadDate,
        createdAt: rawFile.createdAt instanceof Date ? rawFile.createdAt.toISOString() : rawFile.createdAt,
        updatedAt: rawFile.updatedAt instanceof Date ? rawFile.updatedAt.toISOString() : rawFile.updatedAt
      };
      
      console.log('✅ Mapped file:', {
        id: mappedFile.id,
        clientId: mappedFile.clientId,
        fileName: mappedFile.fileName,
        fileSize: mappedFile.fileSize
      });
      
      // Test filtering
      console.log('\n🔍 Testing filtering...');
      const testFiles = [mappedFile];
      const filteredFiles = testFiles.filter(file => file.clientId === 1);
      console.log(`✅ Filtered files for client 1: ${filteredFiles.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkDbFiles(); 