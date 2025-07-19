import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function forceRefreshFiles() {
  try {
    console.log('🔄 Force refreshing client files...\n');
    
    // Get all files from database
    const allFiles = await sql`
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
      ORDER BY created_at DESC
    `;
    
    console.log('📋 All files in database:');
    allFiles.forEach(file => {
      console.log(`  - ID: ${file.id} | Client: ${file.clientId} | File: ${file.fileName} | Size: ${file.fileSize}`);
    });
    
    // Check specific client files
    const client1Files = allFiles.filter(f => f.clientId === 1);
    console.log(`\n📁 Files for client 1: ${client1Files.length}`);
    client1Files.forEach(file => {
      console.log(`  - ${file.fileName} (${file.fileSize})`);
    });
    
    console.log('\n✅ Force refresh completed!');
    console.log('💡 Now check the browser console for debug logs');
    
  } catch (error) {
    console.error('❌ Error force refreshing files:', error);
  } finally {
    process.exit(0);
  }
}

forceRefreshFiles(); 