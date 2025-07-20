import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// RDS connection configuration
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

async function importToRDS() {
  const client = new Client(rdsConfig);
  
  try {
    console.log('🔄 Connecting to Amazon RDS...');
    await client.connect();
    console.log('✅ Connected to RDS successfully');
    
    const exportDir = './database-export';
    if (!fs.existsSync(exportDir)) {
      throw new Error('Export directory not found. Please run export-neon-data.mjs first.');
    }
    
    // Read export summary
    const summaryPath = path.join(exportDir, 'export-summary.json');
    if (!fs.existsSync(summaryPath)) {
      throw new Error('Export summary not found. Please run export-neon-data.mjs first.');
    }
    
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    console.log(`📋 Found ${summary.totalTables} tables to import`);
    
    // Import tables in order (to handle foreign key constraints)
    const importOrder = [
      'users',
      'clients', 
      'invoices',
      'payments',
      'calendar_events',
      'components',
      'progress_steps',
      'progress_step_comments',
      'chats',
      'chat_messages',
      'client_links',
      'client_files',
      'tags',
      'add_on_services',
      'client_service_requests',
      'client_pics'
    ];
    
    for (const tableName of importOrder) {
      const tableFile = path.join(exportDir, `${tableName}.json`);
      
      if (!fs.existsSync(tableFile)) {
        console.log(`⏭️ Skipping ${tableName} (file not found)`);
        continue;
      }
      
      console.log(`📦 Importing table: ${tableName}`);
      
      const tableExport = JSON.parse(fs.readFileSync(tableFile, 'utf8'));
      const { data } = tableExport;
      
      if (data.length === 0) {
        console.log(`⏭️ Skipping ${tableName} (no data)`);
        continue;
      }
      
      // Get column names
      const columns = Object.keys(data[0]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      
      // Create insert query
      const insertQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')})
        VALUES (${placeholders})
        ON CONFLICT DO NOTHING
      `;
      
      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        for (const row of batch) {
          const values = columns.map(col => row[col]);
          await client.query(insertQuery, values);
        }
        
        console.log(`  ✅ Imported batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}`);
      }
      
      console.log(`✅ Completed import for ${tableName}`);
    }
    
    console.log('\n✅ RDS import completed successfully!');
    console.log('🎉 Your database has been migrated to Amazon RDS');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

importToRDS(); 