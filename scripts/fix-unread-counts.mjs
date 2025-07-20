import { neon } from '@neondatabase/serverless';

// Use the same connection string as the application
const neonConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🔗 Connecting to database...');
const sql = neon(neonConnectionString);
console.log('✅ Database connected');

async function fixUnreadCounts() {
  try {
    console.log('🔄 Fixing unread counts...');
    
    // Add new columns if they don't exist
    console.log('📝 Adding new columns...');
    await sql`
      ALTER TABLE chats 
      ADD COLUMN IF NOT EXISTS client_unread_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_unread_count INTEGER DEFAULT 0
    `;
    console.log('✅ Columns added');
    
    // Update existing chats to have proper initial values
    console.log('🔄 Updating existing chats...');
    await sql`
      UPDATE chats 
      SET client_unread_count = 0, 
          admin_unread_count = 0
      WHERE client_unread_count IS NULL OR admin_unread_count IS NULL
    `;
    console.log('✅ Chats updated');
    
    console.log('✅ Unread counts fixed successfully!');
    
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    process.exit(0);
  }
}

fixUnreadCounts(); 