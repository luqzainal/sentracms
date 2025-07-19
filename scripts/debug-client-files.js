import { neon } from '@neondatabase/serverless';

// Use the same connection string as the app
const connectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(connectionString);

async function debugClientFiles() {
  try {
    console.log('🔍 Checking client files in database...\n');
    
    // Check all client files
    const clientFiles = await sql`
      SELECT 
        id,
        client_id,
        file_name,
        file_size,
        file_url,
        file_type,
        upload_date,
        created_at,
        updated_at
      FROM client_files
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${clientFiles.length} client files in database:\n`);
    
    clientFiles.forEach((file, index) => {
      console.log(`File ${index + 1}:`);
      console.log(`  ID: ${file.id}`);
      console.log(`  Client ID: ${file.client_id}`);
      console.log(`  File Name: ${file.file_name}`);
      console.log(`  File Size: ${file.file_size}`);
      console.log(`  File URL: ${file.file_url || 'NULL'}`);
      console.log(`  File Type: ${file.file_type || 'NULL'}`);
      console.log(`  Upload Date: ${file.upload_date}`);
      console.log(`  Created At: ${file.created_at}`);
      console.log(`  Updated At: ${file.updated_at}`);
      console.log('');
    });
    
    // Check files by client ID (assuming client ID 1 for Evo Dagang)
    console.log('🔍 Checking files for specific clients...\n');
    
    const clientIds = [1, 2, 3]; // Check first few clients
    for (const clientId of clientIds) {
      const filesForClient = await sql`
        SELECT 
          id,
          client_id,
          file_name,
          file_size,
          file_url,
          file_type,
          upload_date
        FROM client_files
        WHERE client_id = ${clientId}
        ORDER BY created_at DESC
      `;
      
      console.log(`📁 Client ID ${clientId}: ${filesForClient.length} files`);
      if (filesForClient.length > 0) {
        filesForClient.forEach((file, index) => {
          console.log(`  File ${index + 1}: ${file.file_name} (${file.file_size})`);
        });
      }
      console.log('');
    }
    
    // Check database schema
    console.log('🔧 Checking client_files table schema...\n');
    
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'client_files'
      ORDER BY ordinal_position
    `;
    
    console.log('Client files table columns:');
    schema.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging client files:', error);
  } finally {
    await sql.end();
  }
}

debugClientFiles(); 