import { Client } from 'pg';

// RDS connection configuration (update these values)
const rdsConfig = {
  host: 'YOUR_RDS_ENDPOINT.amazonaws.com', // Replace with your RDS endpoint
  port: 5432,
  database: 'postgres', // or your database name
  user: 'postgres', // or your master username
  password: 'YOUR_RDS_PASSWORD', // Replace with your RDS password
  ssl: {
    rejectUnauthorized: false
  }
};

async function testRDSConnection() {
  const client = new Client(rdsConfig);
  
  try {
    console.log('🧪 Testing RDS connection...');
    console.log(`📍 Host: ${rdsConfig.host}`);
    console.log(`🔌 Port: ${rdsConfig.port}`);
    console.log(`📊 Database: ${rdsConfig.database}`);
    console.log(`👤 User: ${rdsConfig.user}`);
    
    // Test connection
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('✅ Query test successful!');
    console.log(`📋 PostgreSQL version: ${result.rows[0].version}`);
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log(`📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
    // Test specific tables
    const testTables = ['users', 'clients', 'invoices'];
    for (const tableName of testTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log(`✅ ${tableName}: ${countResult.rows[0].count} rows`);
      } catch (error) {
        console.log(`❌ ${tableName}: Table not found or error`);
      }
    }
    
    console.log('\n🎉 RDS connection test completed successfully!');
    console.log('✅ Your application is ready to use Amazon RDS');
    
  } catch (error) {
    console.error('❌ RDS connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your RDS endpoint is correct');
    console.log('2. Verify your username and password');
    console.log('3. Ensure RDS instance is running');
    console.log('4. Check security group allows your IP');
    console.log('5. Verify SSL configuration');
  } finally {
    await client.end();
    process.exit(0);
  }
}

testRDSConnection(); 