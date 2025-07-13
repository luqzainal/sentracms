import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
dotenv.config();

const neonConnectionString = process.env.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('❌ VITE_NEON_DATABASE_URL not found in .env file');
  process.exit(1);
}

const sql = neon(neonConnectionString);

// Test avatar generation
function testAvatarGeneration() {
  console.log('\n🎨 Testing Avatar Generation:');
  
  const testNames = [
    'John Doe',
    'Jane Smith', 
    'Bob Johnson',
    'Alice Cooper',
    'David Wilson'
  ];
  
  testNames.forEach(name => {
    const initials = name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
    // Simple hash for consistent colors
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % 12; // 12 colors available
    
    console.log(`  👤 ${name} → ${initials} (color index: ${colorIndex})`);
  });
}

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful!');
    console.log(`⏰ Server time: ${result[0].current_time}`);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('clients', 'chats', 'chat_messages', 'users')
      ORDER BY table_name;
    `;
    
    console.log('\n📋 Checking essential tables:');
    const requiredTables = ['clients', 'chats', 'chat_messages', 'users'];
    const existingTables = tables.map(t => t.table_name);
    
    for (const table of requiredTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table} - exists`);
      } else {
        console.log(`  ❌ ${table} - missing`);
      }
    }
    
    if (existingTables.length === requiredTables.length) {
      console.log('\n🎉 All essential tables exist! Your database is ready.');
      
      // Test data access
      const clientCount = await sql`SELECT COUNT(*) as count FROM clients`;
      const chatCount = await sql`SELECT COUNT(*) as count FROM chats`;
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      
      console.log(`\n📊 Data summary:`);
      console.log(`  • ${clientCount[0].count} clients`);
      console.log(`  • ${chatCount[0].count} chat conversations`);
      console.log(`  • ${userCount[0].count} users`);
      
      if (clientCount[0].count > 0) {
        console.log('\n📝 Ready for production use!');
      } else {
        console.log('\n🆕 Database is clean and ready for your first clients!');
      }
      
    } else {
      console.log('\n⚠️  Some tables are missing. Run: npm run db:setup');
    }
    
    // Test avatar generation
    testAvatarGeneration();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('  1. Check your VITE_NEON_DATABASE_URL in .env file');
    console.log('  2. Ensure your Neon database is active (not sleeping)');
    console.log('  3. Try running: npm run db:setup');
  }
}

testConnection(); 