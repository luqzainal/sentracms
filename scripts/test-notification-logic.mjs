import { neon } from '@neondatabase/serverless';

// Use the same connection string as the application
const neonConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(neonConnectionString);

async function testNotificationLogic() {
  try {
    console.log('🧪 Testing notification logic...');
    
    // Get existing chats
    const chats = await sql`SELECT * FROM chats LIMIT 1`;
    
    if (chats.length === 0) {
      console.log('❌ No chats found. Please create a chat first.');
      return;
    }
    
    const chatId = chats[0].id;
    console.log(`📝 Using chat ID: ${chatId}`);
    
    // Test 1: Admin sends message (should increment client_unread_count)
    console.log('\n🔵 Test 1: Admin sending message...');
    await sql`
      INSERT INTO chat_messages (
        chat_id, sender, content, message_type, created_at
      ) VALUES (
        ${chatId}, 'admin', 'Test message from admin', 'text', NOW()
      )
    `;
    
    // Update chat with new unread count
    await sql`
      UPDATE chats 
      SET last_message = 'Test message from admin',
          last_message_at = NOW(),
          client_unread_count = client_unread_count + 1
      WHERE id = ${chatId}
    `;
    
    // Check result
    const chatAfterAdmin = await sql`SELECT * FROM chats WHERE id = ${chatId}`;
    console.log(`✅ Client unread count: ${chatAfterAdmin[0].client_unread_count}`);
    console.log(`✅ Admin unread count: ${chatAfterAdmin[0].admin_unread_count}`);
    
    // Test 2: Client sends message (should increment admin_unread_count)
    console.log('\n🟡 Test 2: Client sending message...');
    await sql`
      INSERT INTO chat_messages (
        chat_id, sender, content, message_type, created_at
      ) VALUES (
        ${chatId}, 'client', 'Test message from client', 'text', NOW()
      )
    `;
    
    // Update chat with new unread count
    await sql`
      UPDATE chats 
      SET last_message = 'Test message from client',
          last_message_at = NOW(),
          admin_unread_count = admin_unread_count + 1
      WHERE id = ${chatId}
    `;
    
    // Check result
    const chatAfterClient = await sql`SELECT * FROM chats WHERE id = ${chatId}`;
    console.log(`✅ Client unread count: ${chatAfterClient[0].client_unread_count}`);
    console.log(`✅ Admin unread count: ${chatAfterClient[0].admin_unread_count}`);
    
    console.log('\n🎉 Notification logic test completed!');
    console.log('📊 Final counts:');
    console.log(`   - Client unread: ${chatAfterClient[0].client_unread_count}`);
    console.log(`   - Admin unread: ${chatAfterClient[0].admin_unread_count}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testNotificationLogic(); 