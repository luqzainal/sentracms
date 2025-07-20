import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testChatAttachment() {
  console.log('🧪 Testing Chat Attachment Functionality...\n');

  try {
    // 1. Check if chat_messages table has attachment columns
    console.log('📋 Step 1: Checking chat_messages table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'chat_messages' 
      AND column_name IN ('attachment_url', 'attachment_name', 'attachment_type', 'attachment_size')
      ORDER BY column_name;
    `;
    
    console.log('✅ Attachment columns found:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'})`);
    });

    // 2. Check if there are any existing chats
    console.log('\n📋 Step 2: Checking existing chats...');
    const chats = await sql`
      SELECT id, client_id, client_name, created_at 
      FROM chats 
      LIMIT 3
    `;
    
    if (chats.length === 0) {
      console.log('❌ No chats found. Creating test chat...');
      
      // Create test chat
      const testChat = await sql`
        INSERT INTO chats (client_id, client_name, avatar, last_message_at, unread_count, online)
        VALUES (1, 'Test Client', 'TC', NOW(), 0, false)
        RETURNING *
      `;
      
      console.log('✅ Created test chat:', testChat[0].id);
      chats[0] = testChat[0];
    }

    console.log('✅ Found chats:');
    chats.forEach(chat => {
      console.log(`   - Chat ${chat.id}: ${chat.client_name} (Client ID: ${chat.client_id})`);
    });

    const testChatId = chats[0].id;

    // 3. Test sending message with attachment data
    console.log('\n📋 Step 3: Testing message with attachment...');
    const testAttachmentData = {
      attachment_url: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
      attachment_name: 'test-image.jpg',
      attachment_type: 'image/jpeg',
      attachment_size: 1024000 // 1MB
    };

    const testMessage = await sql`
      INSERT INTO chat_messages (
        chat_id, sender, content, message_type,
        attachment_url, attachment_name, attachment_type, attachment_size,
        created_at
      ) VALUES (
        ${testChatId}, 'admin', 'Test message with attachment', 'image',
        ${testAttachmentData.attachment_url}, ${testAttachmentData.attachment_name},
        ${testAttachmentData.attachment_type}, ${testAttachmentData.attachment_size},
        NOW()
      )
      RETURNING *
    `;

    console.log('✅ Test message with attachment created:');
    console.log(`   - Message ID: ${testMessage[0].id}`);
    console.log(`   - Content: ${testMessage[0].content}`);
    console.log(`   - Attachment URL: ${testMessage[0].attachment_url}`);
    console.log(`   - Attachment Name: ${testMessage[0].attachment_name}`);
    console.log(`   - Attachment Type: ${testMessage[0].attachment_type}`);
    console.log(`   - Attachment Size: ${testMessage[0].attachment_size}`);

    // 4. Test retrieving messages with attachments
    console.log('\n📋 Step 4: Testing message retrieval...');
    const messages = await sql`
      SELECT * FROM chat_messages 
      WHERE chat_id = ${testChatId}
      ORDER BY created_at DESC
    `;

    console.log('✅ Retrieved messages:');
    messages.forEach(msg => {
      console.log(`   - Message ${msg.id}: ${msg.content}`);
      if (msg.attachment_url) {
        console.log(`     Attachment: ${msg.attachment_name} (${msg.attachment_type})`);
      }
    });

    // 5. Test API endpoint (if running locally)
    console.log('\n📋 Step 5: Testing upload URL generation...');
    try {
      const response = await fetch('http://localhost:3000/api/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test-image.jpg',
          fileType: 'image/jpeg',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upload URL generated successfully:');
        console.log(`   - Upload URL length: ${data.uploadUrl?.length || 0}`);
        console.log(`   - Public URL: ${data.publicUrl}`);
        console.log(`   - File name: ${data.fileName}`);
      } else {
        console.log('❌ Upload URL generation failed:');
        console.log(`   - Status: ${response.status}`);
        const errorText = await response.text();
        console.log(`   - Error: ${errorText}`);
      }
    } catch (error) {
      console.log('❌ Upload URL generation error:');
      console.log(`   - Error: ${error.message}`);
      console.log('   - Make sure the API server is running on localhost:3000');
    }

    // 6. Check environment variables
    console.log('\n📋 Step 6: Checking environment variables...');
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY', 
      'AWS_REGION',
      'AWS_S3_BUCKET'
    ];

    console.log('✅ Environment variables:');
    requiredEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`   - ${varName}: ${varName.includes('KEY') ? '***' : value}`);
      } else {
        console.log(`   - ${varName}: ❌ MISSING`);
      }
    });

    console.log('\n🎉 Chat attachment test completed!');
    console.log('   If upload URL generation failed, check:');
    console.log('   1. API server is running');
    console.log('   2. AWS credentials are correct');
    console.log('   3. S3 bucket exists and is accessible');

  } catch (error) {
    console.error('❌ Error testing chat attachment:', error);
    process.exit(1);
  }
}

testChatAttachment(); 