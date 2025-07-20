import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function fixChatAttachments() {
  try {
    console.log('🔧 Fixing chat attachments...\n');
    
    // Get messages with attachment data but missing URLs
    const messages = await sql`
      SELECT 
        id,
        chat_id,
        sender,
        content,
        message_type,
        attachment_url,
        attachment_name,
        attachment_type,
        attachment_size,
        created_at
      FROM chat_messages 
      WHERE (attachment_name IS NOT NULL OR attachment_type IS NOT NULL OR attachment_size IS NOT NULL)
      AND (attachment_url IS NULL OR attachment_url = '')
      ORDER BY created_at DESC;
    `;
    
    console.log(`📋 Found ${messages.length} messages with missing attachment URLs:`);
    
    if (messages.length === 0) {
      console.log('✅ No messages need fixing!');
      return;
    }
    
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.id}`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Message Type: ${msg.message_type}`);
      console.log(`   Attachment Name: ${msg.attachment_name || 'NULL'}`);
      console.log(`   Attachment Type: ${msg.attachment_type || 'NULL'}`);
      console.log(`   Attachment Size: ${msg.attachment_size || 'NULL'}`);
      console.log(`   Attachment URL: ${msg.attachment_url || 'NULL'}`);
    });
    
    // For now, we'll just update the message_type to 'text' for these messages
    // since we can't recover the original files
    console.log('\n🔄 Updating message types to "text" for messages with missing URLs...');
    
    for (const msg of messages) {
      const updateResult = await sql`
        UPDATE chat_messages 
        SET message_type = 'text',
            attachment_url = NULL,
            attachment_name = NULL,
            attachment_type = NULL,
            attachment_size = NULL
        WHERE id = ${msg.id};
      `;
      console.log(`   Updated message ID ${msg.id}`);
    }
    
    console.log(`✅ Updated ${messages.length} messages`);
    
    // Show updated messages
    const updatedMessages = await sql`
      SELECT 
        id,
        content,
        message_type,
        attachment_url
      FROM chat_messages 
      WHERE (attachment_name IS NOT NULL OR attachment_type IS NOT NULL OR attachment_size IS NOT NULL)
      AND (attachment_url IS NULL OR attachment_url = '')
      ORDER BY created_at DESC;
    `;
    
    if (updatedMessages.length === 0) {
      console.log('✅ All messages fixed successfully!');
    } else {
      console.log(`⚠️  Still have ${updatedMessages.length} messages with issues`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing chat attachments:', error);
  }
}

fixChatAttachments(); 