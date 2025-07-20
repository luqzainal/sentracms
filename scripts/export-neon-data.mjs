import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Neon connection string
const neonConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(neonConnectionString);

async function exportNeonData() {
  try {
    console.log('🔄 Starting Neon data export...');
    
    // Create export directory
    const exportDir = './database-export';
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    // Get all table names
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`📋 Found ${tables.length} tables to export`);
    
    // Export each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`📦 Exporting table: ${tableName}`);
      
      // Get table structure
      const structure = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      // Get table data
      const data = await sql`SELECT * FROM ${sql(tableName)}`;
      
      // Create table export file
      const tableFile = path.join(exportDir, `${tableName}.json`);
      const tableExport = {
        tableName,
        structure,
        data,
        rowCount: data.length,
        exportedAt: new Date().toISOString()
      };
      
      fs.writeFileSync(tableFile, JSON.stringify(tableExport, null, 2));
      console.log(`✅ Exported ${data.length} rows from ${tableName}`);
    }
    
    // Create migration summary
    const summary = {
      totalTables: tables.length,
      tables: tables.map(t => t.table_name),
      exportedAt: new Date().toISOString(),
      neonConnectionString: neonConnectionString.replace(/:[^:@]*@/, ':****@') // Hide password
    };
    
    fs.writeFileSync(path.join(exportDir, 'export-summary.json'), JSON.stringify(summary, null, 2));
    
    console.log('\n✅ Neon data export completed!');
    console.log(`📁 Export location: ${exportDir}`);
    console.log(`📊 Total tables exported: ${tables.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    process.exit(0);
  }
}

exportNeonData(); 