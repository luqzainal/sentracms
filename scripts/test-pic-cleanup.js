const { sql } = require('@neondatabase/serverless');

// Test script untuk menguji fungsi pembersihan PIC
async function testPicCleanup() {
  console.log('🧪 Testing PIC cleanup functionality...\n');

  try {
    // 1. Buat test user dengan role Team
    console.log('1. Creating test user with Team role...');
    const testUser = await sql`
      INSERT INTO users (name, email, role, status, permissions, created_at, updated_at)
      VALUES ('Test PIC User', 'testpic@example.com', 'Team', 'Active', ARRAY['clients'], NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ Test user created:', testUser[0].name, 'with role:', testUser[0].role);

    // 2. Buat test client dengan PIC
    console.log('\n2. Creating test client with PIC...');
    const testClient = await sql`
      INSERT INTO clients (name, business_name, email, status, pic, total_sales, total_collection, balance, created_at, updated_at)
      VALUES ('Test Client', 'Test Business', 'testclient@example.com', 'Pending', 'Test PIC User - Another PIC', 10000, 5000, 5000, NOW(), NOW())
      RETURNING *
    `;
    console.log('✅ Test client created:', testClient[0].name, 'with PIC:', testClient[0].pic);

    // 3. Tukar role user dari Team ke Client Admin
    console.log('\n3. Changing user role from Team to Client Admin...');
    const updatedUser = await sql`
      UPDATE users 
      SET role = 'Client Admin', updated_at = NOW()
      WHERE email = 'testpic@example.com'
      RETURNING *
    `;
    console.log('✅ User role changed to:', updatedUser[0].role);

    // 4. Periksa sama ada PIC masih ada dalam client
    console.log('\n4. Checking if PIC was cleaned up...');
    const clientAfterUpdate = await sql`
      SELECT * FROM clients WHERE email = 'testclient@example.com'
    `;
    console.log('📋 Client PIC after role change:', clientAfterUpdate[0].pic);

    // 5. Bersihkan data test
    console.log('\n5. Cleaning up test data...');
    await sql`DELETE FROM clients WHERE email = 'testclient@example.com'`;
    await sql`DELETE FROM users WHERE email = 'testpic@example.com'`;
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 PIC cleanup test completed!');
    console.log('\n📝 Note: This test only checks database changes.');
    console.log('   The actual cleanup happens in the frontend when updateUser() is called.');

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    process.exit(0);
  }
}

// Jalankan test
testPicCleanup(); 