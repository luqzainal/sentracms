import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function createClientFilesTable() {
  try {
    console.log('🔧 Creating client_files table...');
    
    // Create client_files table
    await sql`
      CREATE TABLE IF NOT EXISTS client_files (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_size VARCHAR(50) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(100),
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('✅ client_files table created successfully!');
    
    // Create index for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_client_files_client_id ON client_files(client_id);
    `;
    
    console.log('✅ Index created successfully!');
    
    console.log('\n📋 Table structure:');
    console.log('- id: Primary key');
    console.log('- client_id: Foreign key to clients table');
    console.log('- file_name: Name of the uploaded file');
    console.log('- file_size: Size of the file (e.g., "1.2 MB")');
    console.log('- file_url: URL to access the file');
    console.log('- file_type: MIME type of the file');
    console.log('- upload_date: When the file was uploaded');
    console.log('- created_at: Record creation timestamp');
    console.log('- updated_at: Record update timestamp');
    
  } catch (error) {
    console.error('❌ Error creating client_files table:', error.message);
    
    if (error.message.includes('relation "client_files" already exists')) {
      console.log('ℹ️ Table client_files already exists');
    } else {
      console.error('💡 Please check your database connection and permissions');
    }
  }
}

createClientFilesTable(); 