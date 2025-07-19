import { sql } from '../src/context/SupabaseContext.ts';

async function checkRawDatabaseData() {
  try {
    console.log('🔍 Checking raw database data for client files...');
    
    // Check raw data without aliases
    const rawData = await sql`
      SELECT * FROM client_files 
      WHERE client_id = 1
      ORDER BY created_at DESC
    `;
    
    console.log('📋 Raw database data (no aliases):');
    console.log('  Count:', rawData.length);
    if (rawData.length > 0) {
      console.log('  Sample file:', rawData[0]);
      console.log('  All column names:', Object.keys(rawData[0]));
    }
    
    // Check data with aliases
    const aliasedData = await sql`
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
    
    console.log('\n📋 Aliased database data:');
    console.log('  Count:', aliasedData.length);
    if (aliasedData.length > 0) {
      console.log('  Sample file:', aliasedData[0]);
      console.log('  All column names:', Object.keys(aliasedData[0]));
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkRawDatabaseData(); 