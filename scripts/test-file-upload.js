import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testFileUpload() {
  try {
    console.log('🧪 Testing file upload functionality...\n');
    
    // Test 1: Check current files
    console.log('📋 Current files in database:');
    const currentFiles = await sql`
      SELECT id, client_id, file_name, file_size, created_at 
      FROM client_files 
      ORDER BY created_at DESC
    `;
    
    currentFiles.forEach(file => {
      console.log(`  - ID: ${file.id} | Client: ${file.client_id} | File: ${file.file_name}`);
    });
    
    // Test 2: Add a test file manually
    console.log('\n📤 Adding test file manually...');
    const testFile = {
      clientId: 1,
      fileName: 'test-file-upload.txt',
      fileSize: '0.1 MB',
      fileUrl: 'https://test-bucket.digitaloceanspaces.com/test-file-upload.txt',
      fileType: 'text/plain',
      uploadDate: new Date().toISOString()
    };
    
    const result = await sql`
      INSERT INTO client_files (
        client_id, 
        file_name, 
        file_size, 
        file_url, 
        file_type, 
        upload_date
      ) VALUES (
        ${testFile.clientId},
        ${testFile.fileName},
        ${testFile.fileSize},
        ${testFile.fileUrl},
        ${testFile.fileType},
        ${testFile.uploadDate}
      ) RETURNING *
    `;
    
    console.log('✅ Test file added:', result[0]);
    
    // Test 3: Check files again
    console.log('\n📋 Files after adding test file:');
    const updatedFiles = await sql`
      SELECT id, client_id, file_name, file_size, created_at 
      FROM client_files 
      WHERE client_id = 1
      ORDER BY created_at DESC
    `;
    
    updatedFiles.forEach(file => {
      console.log(`  - ID: ${file.id} | File: ${file.file_name} | Size: ${file.file_size}`);
    });
    
    console.log('\n✅ File upload test completed!');
    
  } catch (error) {
    console.error('❌ Error testing file upload:', error);
  } finally {
    process.exit(0);
  }
}

testFileUpload(); 