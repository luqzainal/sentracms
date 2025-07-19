import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testStateManagement() {
  try {
    console.log('🧪 Testing state management for client files...\n');
    
    // Test 1: Get all files from database
    console.log('📋 Step 1: Getting all files from database...');
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
    
    console.log(`✅ Found ${allFiles.length} files in database`);
    
    // Test 2: Get files for specific client
    console.log('\n📋 Step 2: Getting files for client 1...');
    const client1Files = allFiles.filter(f => f.clientId === 1);
    console.log(`✅ Found ${client1Files.length} files for client 1:`);
    client1Files.forEach(file => {
      console.log(`  - ${file.fileName} (${file.fileSize})`);
    });
    
    // Test 3: Simulate state management logic
    console.log('\n📋 Step 3: Simulating state management...');
    const mockState = {
      clientFiles: []
    };
    
    // Simulate adding files to state
    const newState = {
      clientFiles: [...mockState.clientFiles.filter(f => f.clientId !== 1), ...client1Files]
    };
    
    console.log(`✅ State would have ${newState.clientFiles.length} files`);
    console.log('📄 Files in state:', newState.clientFiles.map(f => f.fileName));
    
    // Test 4: Simulate filtering
    console.log('\n📋 Step 4: Simulating filtering...');
    const filteredFiles = newState.clientFiles.filter(f => f.clientId === 1);
    console.log(`✅ Filtered ${filteredFiles.length} files for client 1:`);
    filteredFiles.forEach(file => {
      console.log(`  - ${file.fileName}`);
    });
    
    console.log('\n✅ State management test completed!');
    console.log('💡 Check if the numbers match what you see in the UI');
    
  } catch (error) {
    console.error('❌ Error testing state management:', error);
  } finally {
    process.exit(0);
  }
}

testStateManagement(); 