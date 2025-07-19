import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function setupTagsTable() {
  try {
    console.log('🔧 Creating tags table...');
    
    // Create tags table
    await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text UNIQUE NOT NULL,
        color text DEFAULT '#3B82F6',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `;
    
    console.log('✅ Tags table created successfully!');
    
    // Add indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);`;
    
    console.log('✅ Indexes created successfully!');
    
    // Insert default tags
    const defaultTags = [
      { name: 'VIP', color: '#F59E0B' },
      { name: 'Premium', color: '#8B5CF6' },
      { name: 'New', color: '#10B981' },
      { name: 'Priority', color: '#EF4444' },
      { name: 'Enterprise', color: '#6366F1' }
    ];
    
    for (const tag of defaultTags) {
      try {
        await sql`
          INSERT INTO tags (name, color) 
          VALUES (${tag.name}, ${tag.color})
          ON CONFLICT (name) DO NOTHING;
        `;
        console.log(`✅ Default tag "${tag.name}" added`);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`ℹ️  Tag "${tag.name}" already exists`);
        } else {
          console.warn(`⚠️  Error adding tag "${tag.name}":`, error.message);
        }
      }
    }
    
    // Verify table structure
    const result = await sql`
      SELECT table_name, column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'tags' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Tags table structure:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check current tags count
    const count = await sql`SELECT COUNT(*) as count FROM tags;`;
    console.log(`\n✅ Current tags count: ${count[0].count}`);
    
    console.log('\n🎉 Tags table setup completed successfully!');
    console.log('🚀 Global tags are now ready for use in the application.');
    
  } catch (error) {
    console.error('❌ Error setting up tags table:', error.message);
    
    if (error.message.includes('relation "tags" already exists')) {
      console.log('ℹ️  Tags table already exists');
    } else {
      console.error('💡 Please check your database connection and permissions');
    }
  }
}

setupTagsTable().catch(console.error); 