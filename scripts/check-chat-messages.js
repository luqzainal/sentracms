import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkChatMessages() {
  try {
    console.log('🔍 Checking chat messages and attachments...\n');
    
    // Get all recent messages
    const allMessages = await sql`
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
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    
    console.log(`📋 Found ${allMessages.length} recent messages:`);
    allMessages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.id}`);
      console.log(`   Chat ID: ${msg.chat_id}`);
      console.log(`   Sender: ${msg.sender}`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Message Type: ${msg.message_type}`);
      console.log(`   Attachment URL: ${msg.attachment_url || 'NULL'}`);
      console.log(`   Attachment Name: ${msg.attachment_name || 'NULL'}`);
      console.log(`   Attachment Type: ${msg.attachment_type || 'NULL'}`);
      console.log(`   Attachment Size: ${msg.attachment_size || 'NULL'}`);
      console.log(`   Created: ${msg.created_at}`);
    });
    
    // Get recent messages to see message_type distribution
    const recentMessages = await sql`
      SELECT 
        message_type,
        COUNT(*) as count
      FROM chat_messages 
      WHERE created_at > NOW() - INTERVAL '1 day'
      GROUP BY message_type
      ORDER BY count DESC;
    `;
    
    console.log('\n📊 Recent message types distribution:');
    recentMessages.forEach(msg => {
      console.log(`   ${msg.message_type}: ${msg.count} messages`);
    });
    
    // Check if there are any messages with wrong message_type
    const wrongTypeMessages = await sql`
      SELECT 
        id,
        content,
        message_type,
        attachment_url
      FROM chat_messages 
      WHERE attachment_url IS NOT NULL 
      AND message_type = 'text'
      ORDER BY created_at DESC
      LIMIT 5;
    `;
    
    if (wrongTypeMessages.length > 0) {
      console.log('\n⚠️  Messages with attachments but wrong message_type:');
      wrongTypeMessages.forEach(msg => {
        console.log(`   ID: ${msg.id}, Content: ${msg.content}, Type: ${msg.message_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking chat messages:', error);
  }
}

checkChatMessages(); 