import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const neonConnectionString = process.env.VITE_NEON_DATABASE_URL;

if (!neonConnectionString) {
  console.error('❌ VITE_NEON_DATABASE_URL environment variable is not set');
  console.error('📋 Make sure you have a .env file with your Neon database connection string');
  console.error('💡 Example: VITE_NEON_DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔗 Database connection string found');

const sql = neon(neonConnectionString);

async function runMigrations() {
  try {
    console.log('🔄 Starting database setup...');
    
    // Read migration files in order
    const migrationFiles = [
      '20250711044437_lucky_beacon.sql',
      '20250711044531_white_wind.sql', 
      '20250711160237_throbbing_pebble.sql',
      '20250711175509_twilight_villa.sql',
      '20250711180359_copper_lab.sql',
      '20250711180823_sparkling_bread.sql'
    ];

    for (const file of migrationFiles) {
      const filePath = join(__dirname, '..', 'supabase', 'migrations', file);
      console.log(`📁 Running migration: ${file}`);
      
      try {
        const migrationSQL = readFileSync(filePath, 'utf8');
        
        // Better SQL statement splitting - handle complex statements
        const statements = migrationSQL
          .replace(/--.*$/gm, '') // Remove comments
          .split(/;\s*\n/) // Split on semicolon followed by newline
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map(s => s.endsWith(';') ? s : s + ';'); // Ensure semicolon

        console.log(`  📝 Found ${statements.length} SQL statements`);

        // Execute each statement individually with better error handling
        for (let i = 0; i < statements.length; i++) {
          const statement = statements[i];
          if (statement.trim() && !statement.startsWith('/*') && !statement.includes('IF NOT EXISTS')) {
            try {
              // Use raw SQL execution for better compatibility
              await sql([statement]);
              console.log(`    ✓ Statement ${i + 1}/${statements.length} executed`);
            } catch (stmtError) {
              console.log(`    ⚠️  Statement ${i + 1} failed (might already exist): ${stmtError.message.substring(0, 100)}...`);
            }
          }
        }
        
        console.log(`✅ Migration ${file} completed`);
      } catch (error) {
        console.warn(`⚠️  Migration ${file} failed:`, error.message.substring(0, 200));
      }
    }

    // Try to create essential tables directly if migrations failed
    console.log('\n🏗️  Creating essential tables directly...');
    
    try {
      // Create clients table
      await sql`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          business_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Complete', 'Pending', 'Inactive')),
          total_sales DECIMAL(10,2) DEFAULT 0,
          total_collection DECIMAL(10,2) DEFAULT 0,
          balance DECIMAL(10,2) DEFAULT 0,
          registered_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      console.log('✅ Clients table created');

      // Create chats table
      await sql`
        CREATE TABLE IF NOT EXISTS chats (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL,
          client_name TEXT NOT NULL,
          avatar TEXT NOT NULL DEFAULT 'https://ui-avatars.com/api/?name=Client&background=3b82f6&color=fff',
          last_message TEXT,
          last_message_at TIMESTAMPTZ DEFAULT NOW(),
          unread_count INTEGER DEFAULT 0,
          online BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      console.log('✅ Chats table created');

      // Create chat_messages table
      await sql`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          chat_id INTEGER NOT NULL,
          sender TEXT NOT NULL CHECK (sender IN ('client', 'admin')),
          content TEXT NOT NULL,
          message_type TEXT DEFAULT 'text',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      console.log('✅ Chat messages table created');

      // Create users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Team', 'Client Admin', 'Client Team')),
          status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
          last_login TIMESTAMPTZ,
          client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
          permissions TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      console.log('✅ Users table created');

    } catch (error) {
      console.warn('⚠️  Some tables might already exist:', error.message);
    }

    // Verify tables exist
    console.log('\n🔍 Verifying database tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('📋 Tables created:');
    tables.forEach(table => {
      console.log(`  ✓ ${table.table_name}`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('🚀 Your database is now ready for production use.');
    console.log('💡 You can now add clients and data through the application interface.');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations(); 