const { sql } = require('../src/services/database.ts');

async function applyMigration() {
  try {
    console.log('🔄 Applying separate unread counts migration...');
    
    // Add new columns if they don't exist
    await sql`
      ALTER TABLE chats 
      ADD COLUMN IF NOT EXISTS client_unread_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_unread_count INTEGER DEFAULT 0
    `;
    
    // Update existing chats to have proper initial values
    await sql`
      UPDATE chats 
      SET client_unread_count = 0, 
          admin_unread_count = 0
      WHERE client_unread_count IS NULL OR admin_unread_count IS NULL
    `;
    
    console.log('✅ Migration applied successfully!');
    console.log('📊 Separate unread counts are now available');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

applyMigration(); 