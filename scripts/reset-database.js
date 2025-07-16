import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config();

const neonConnectionString = process.env.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('❌ VITE_NEON_DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(neonConnectionString);

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...');
    console.log('⚠️  This will delete ALL data but keep table structures');
    
    // List of tables to reset (in order to handle foreign key constraints)
    const tablesToReset = [
      'chat_messages',
      'chats', 
      'progress_step_comments',
      'progress_steps',
      'components',
      'calendar_events',
      'payments',
      'invoices',
      'users',
      'clients',
      'tags'
    ];

    console.log('\n🗑️  Deleting data from tables...');
    
    // Delete data in reverse order to handle foreign key constraints
    for (const table of tablesToReset) {
      try {
        // Use sql.query for dynamic table names
        const result = await sql.query(`DELETE FROM ${table}`);
        console.log(`  ✅ ${table} - cleared`);
      } catch (error) {
        console.log(`  ⚠️  ${table} - ${error.message.includes('does not exist') ? 'table not found' : 'error: ' + error.message}`);
      }
    }
    
    // Reset sequences for auto-increment columns
    console.log('\n🔄 Resetting sequences...');
    
    const sequences = [
      'clients_id_seq',
      'chats_id_seq', 
      'chat_messages_id_seq'
    ];
    
    for (const sequence of sequences) {
      try {
        await sql.query(`ALTER SEQUENCE ${sequence} RESTART WITH 1`);
        console.log(`  ✅ ${sequence} - reset to 1`);
      } catch (error) {
        console.log(`  ⚠️  ${sequence} - ${error.message.includes('does not exist') ? 'sequence not found' : 'error: ' + error.message}`);
      }
    }
    
    // Verify reset
    console.log('\n🔍 Verifying database reset...');
    
    const verificationTables = ['clients', 'chats', 'chat_messages', 'users', 'invoices', 'payments'];
    
    for (const table of verificationTables) {
      try {
        const count = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`  📊 ${table}: ${count[0].count} records`);
      } catch (error) {
        console.log(`  ⚠️  ${table} - table not found`);
      }
    }
    
    console.log('\n✅ Database reset completed successfully!');
    console.log('🎉 Your database is now clean and ready for fresh data.');
    console.log('💡 All table structures are preserved.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase(); 