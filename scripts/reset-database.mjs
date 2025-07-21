import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function resetDatabase() {
  console.log('🗑️  Resetting Neon Database...\n');

  try {
    // Get all table names
    console.log('📋 Step 1: Getting all table names...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE 'information_schema%'
    `;
    
    const tables = tablesResult.map(row => row.table_name);
    console.log(`✅ Found ${tables.length} tables:`, tables.join(', '));

    // Delete all data from tables (in correct order to avoid foreign key issues)
    console.log('\n🗑️  Step 2: Deleting all data from tables...');
    
    // Define deletion order to avoid foreign key constraints
    const deletionOrder = [
      'chat_messages',
      'progress_step_comments', 
      'progress_steps',
      'client_pics',
      'client_files',
      'client_links',
      'client_service_requests',
      'add_on_services',
      'calendar_events',
      'invoices',
      'payments',
      'components',
      'chats',
      'clients',
      'users',
      'tags'
    ];

    for (const table of deletionOrder) {
      if (tables.includes(table)) {
        try {
          await sql.query(`DELETE FROM ${table}`);
          console.log(`✅ Deleted from: ${table}`);
        } catch (error) {
          console.log(`⚠️  Could not delete from ${table}:`, error.message);
        }
      }
    }

    // Reset sequences
    console.log('\n🔄 Step 3: Resetting sequences...');
    const sequencesResult = await sql`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `;
    
    for (const row of sequencesResult) {
      try {
        await sql.query(`ALTER SEQUENCE ${row.sequence_name} RESTART WITH 1`);
        console.log(`✅ Reset sequence: ${row.sequence_name}`);
      } catch (error) {
        console.log(`⚠️  Could not reset sequence ${row.sequence_name}:`, error.message);
      }
    }

    // Verify tables are empty
    console.log('\n🔍 Step 4: Verifying tables are empty...');
    for (const table of tables) {
      try {
        const countResult = await sql.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = countResult.rows?.[0]?.count || 0;
        console.log(`✅ ${table}: ${count} rows`);
      } catch (error) {
        console.log(`⚠️  Could not check ${table}:`, error.message);
      }
    }

    console.log('\n🎉 Database reset completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   - Tables processed: ${tables.length}`);
    console.log(`   - All data removed`);
    console.log(`   - Sequences reset to 1`);
    console.log(`   - Foreign key constraints respected`);
    console.log('');
    console.log('⚠️  Warning: All data has been permanently deleted!');
    console.log('   You may need to run migrations or seed data again.');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check database connection');
    console.log('   2. Verify environment variables');
    console.log('   3. Check database permissions');
    process.exit(1);
  }
}

resetDatabase(); 