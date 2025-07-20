import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function addChatAttachments() {
  try {
    console.log('🔧 Adding chat attachment fields...\n');
    
    // Add attachment fields to chat_messages table
    console.log('📋 Adding attachment columns...');
    await sql`
      ALTER TABLE chat_messages 
      ADD COLUMN IF NOT EXISTS attachment_url TEXT,
      ADD COLUMN IF NOT EXISTS attachment_name TEXT,
      ADD COLUMN IF NOT EXISTS attachment_type TEXT,
      ADD COLUMN IF NOT EXISTS attachment_size INTEGER;
    `;
    console.log('✅ Added attachment columns');
    
    // Update message_type to include 'file' type
    console.log('📋 Updating message_type constraint...');
    await sql`
      ALTER TABLE chat_messages 
      DROP CONSTRAINT IF EXISTS chat_messages_message_type_check;
    `;
    
    await sql`
      ALTER TABLE chat_messages 
      ADD CONSTRAINT chat_messages_message_type_check 
      CHECK (message_type IN ('text', 'file', 'image'));
    `;
    console.log('✅ Updated message_type constraint');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'chat_messages' 
      AND column_name IN ('attachment_url', 'attachment_name', 'attachment_type', 'attachment_size')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 New attachment columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check constraint
    const constraints = await sql`
      SELECT constraint_name, check_clause
      FROM information_schema.check_constraints 
      WHERE constraint_name = 'chat_messages_message_type_check';
    `;
    
    console.log('\n📋 Message type constraint:');
    if (constraints.length > 0) {
      console.log(`  - ${constraints[0].check_clause}`);
    }
    
    console.log('\n✅ Chat attachment migration completed successfully!');
    console.log('🎯 Chat messages can now include file attachments.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addChatAttachments(); 