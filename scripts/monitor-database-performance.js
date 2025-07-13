import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function monitorDatabasePerformance() {
  try {
    console.log('🔍 Monitoring Database Performance & Autoscaling...\n');
    
    // 1. Check database connection and basic info
    console.log('=== DATABASE CONNECTION INFO ===');
    const serverInfo = await sql`SELECT version(), current_database(), current_user`;
    console.log(`Database: ${serverInfo[0].current_database}`);
    console.log(`User: ${serverInfo[0].current_user}`);
    console.log(`Version: ${serverInfo[0].version.split(' ')[0]} ${serverInfo[0].version.split(' ')[1]}`);
    
    // 2. Check if neon extension is available (for file cache monitoring)
    console.log('\n=== NEON EXTENSION STATUS ===');
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS neon`;
      console.log('✅ Neon extension loaded successfully');
      
      // Check file cache performance (Neon specific)
      const cacheStats = await sql`SELECT * FROM neon_stat_file_cache`;
      if (cacheStats.length > 0) {
        const stats = cacheStats[0];
        console.log(`File cache hits: ${stats.file_cache_hits?.toLocaleString()}`);
        console.log(`File cache misses: ${stats.file_cache_misses?.toLocaleString()}`);
        console.log(`File cache hit ratio: ${stats.file_cache_hit_ratio}%`);
        console.log(`File cache used: ${stats.file_cache_used}`);
        
        if (stats.file_cache_hit_ratio < 99) {
          console.log('⚠️  Cache hit ratio below 99% - consider increasing compute size');
        } else {
          console.log('✅ Cache performance is good');
        }
      }
    } catch (error) {
      console.log('⚠️  Neon extension not available or error accessing cache stats');
    }
    
    // 3. Check database size and growth
    console.log('\n=== DATABASE SIZE & GROWTH ===');
    const dbSize = await sql`
      SELECT 
        pg_database_size(current_database()) as size_bytes,
        pg_size_pretty(pg_database_size(current_database())) as size_human
    `;
    console.log(`Database size: ${dbSize[0].size_human}`);
    
    // 4. Check table sizes (especially chat tables)
    console.log('\n=== TABLE SIZES ===');
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
    
    tableSizes.forEach(table => {
      console.log(`${table.tablename}: ${table.size}`);
    });
    
    // 5. Check chat messages growth
    console.log('\n=== CHAT MESSAGES ANALYSIS ===');
    const chatStats = await sql`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT chat_id) as total_chats,
        AVG(LENGTH(message)) as avg_message_length,
        MAX(created_at) as latest_message,
        MIN(created_at) as oldest_message
      FROM chat_messages
    `;
    
    if (chatStats[0].total_messages > 0) {
      console.log(`Total messages: ${chatStats[0].total_messages.toLocaleString()}`);
      console.log(`Total chats: ${chatStats[0].total_chats}`);
      console.log(`Average message length: ${Math.round(chatStats[0].avg_message_length)} characters`);
      console.log(`Latest message: ${chatStats[0].latest_message}`);
      console.log(`Oldest message: ${chatStats[0].oldest_message}`);
    } else {
      console.log('No chat messages found');
    }
    
    // 6. Performance metrics
    console.log('\n=== PERFORMANCE METRICS ===');
    
    // Check active connections
    const connections = await sql`
      SELECT count(*) as active_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;
    console.log(`Active connections: ${connections[0].active_connections}`);
    
    // Check long running queries
    const longQueries = await sql`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query
      FROM pg_stat_activity
      WHERE (now() - pg_stat_activity.query_start) > interval '5 seconds'
      AND state = 'active'
      ORDER BY duration DESC
    `;
    
    if (longQueries.length > 0) {
      console.log(`⚠️  ${longQueries.length} long-running queries found`);
    } else {
      console.log('✅ No long-running queries');
    }
    
    // 7. Autoscaling recommendations
    console.log('\n=== AUTOSCALING RECOMMENDATIONS ===');
    
    const totalSize = tableSizes.reduce((sum, table) => sum + parseInt(table.size_bytes), 0);
    const sizeInGB = totalSize / (1024 * 1024 * 1024);
    
    if (sizeInGB > 5) {
      console.log('📈 Database size > 5GB - consider enabling autoscaling');
      console.log('💡 Recommended: Set minimum 2 CU, maximum 4+ CU');
    } else if (sizeInGB > 1) {
      console.log('📊 Database size > 1GB - autoscaling recommended');
      console.log('💡 Recommended: Set minimum 1 CU, maximum 2+ CU');
    } else {
      console.log('📉 Database size < 1GB - basic scaling sufficient');
      console.log('💡 Recommended: Set minimum 0.25 CU, maximum 1 CU');
    }
    
    if (chatStats[0].total_messages > 1000) {
      console.log('💬 High message volume - consider connection pooling');
    }
    
    console.log('\n=== MONITORING TIPS ===');
    console.log('🔍 Monitor these metrics regularly:');
    console.log('  • File cache hit ratio (should be >99%)');
    console.log('  • Database size growth');
    console.log('  • Active connections');
    console.log('  • Query performance');
    console.log('\n💡 Enable autoscaling in Neon Console:');
    console.log('  • Go to your project dashboard');
    console.log('  • Click on compute settings');
    console.log('  • Set min/max compute units');
    console.log('  • Monitor usage graphs');
    
  } catch (error) {
    console.error('❌ Error monitoring database:', error);
  }
}

// Export function untuk reuse
export { monitorDatabasePerformance };

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  monitorDatabasePerformance();
} 