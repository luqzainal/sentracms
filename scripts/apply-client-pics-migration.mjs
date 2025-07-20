import { neon } from '@neondatabase/serverless';

// Use the same connection string as the application
const neonConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(neonConnectionString);

async function applyClientPicsMigration() {
  try {
    console.log('🔄 Applying client_pics table migration...');
    
    // Create client_pics table with UUID for pic_id
    await sql`
      CREATE TABLE IF NOT EXISTS client_pics (
        id SERIAL PRIMARY KEY,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        pic_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        position INTEGER NOT NULL CHECK (position >= 3 AND position <= 10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(client_id, position),
        UNIQUE(client_id, pic_id)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_client_pics_client_id ON client_pics(client_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_pics_position ON client_pics(position)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_client_pics_pic_id ON client_pics(pic_id)`;
    
    console.log('✅ Client PICs table migration applied successfully!');
    console.log('📊 Multi-PIC support is now available');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

applyClientPicsMigration(); 