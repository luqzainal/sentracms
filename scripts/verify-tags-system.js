import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function verifyTagsSystem() {
  try {
    console.log('🔍 Verifying tags system...\n');
    
    // 1. Check tags table
    console.log('1️⃣  Checking global tags table:');
    const tags = await sql`
      SELECT id, name, color, created_at 
      FROM tags 
      ORDER BY created_at DESC;
    `;
    
    console.log(`   Found ${tags.length} global tags:`);
    tags.forEach(tag => {
      console.log(`   - ${tag.name} (${tag.color})`);
    });
    
    // 2. Check clients table structure
    console.log('\n2️⃣  Checking clients table structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name = 'tags';
    `;
    
    if (columns.length > 0) {
      const tagsColumn = columns[0];
      console.log(`   ✅ Tags column exists:`);
      console.log(`      Type: ${tagsColumn.data_type}`);
      console.log(`      Nullable: ${tagsColumn.is_nullable}`);
      console.log(`      Default: ${tagsColumn.column_default}`);
    } else {
      console.log('   ❌ Tags column not found');
    }
    
    // 3. Check clients with tags
    console.log('\n3️⃣  Checking clients with tags:');
    const clients = await sql`
      SELECT id, name, business_name, email, tags 
      FROM clients 
      ORDER BY created_at DESC;
    `;
    
    console.log(`   Found ${clients.length} clients:`);
    clients.forEach(client => {
      const tagsCount = client.tags?.length || 0;
      const tagsList = client.tags?.join(', ') || 'none';
      console.log(`   - ${client.name} (${client.business_name}): ${tagsCount} tags [${tagsList}]`);
    });
    
    // 4. Check tags index
    console.log('\n4️⃣  Checking tags index:');
    const indexes = await sql`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'clients' AND indexname LIKE '%tags%';
    `;
    
    if (indexes.length > 0) {
      console.log('   ✅ Tags index exists:');
      indexes.forEach(index => {
        console.log(`      - ${index.indexname}`);
      });
    } else {
      console.log('   ⚠️  No tags index found');
    }
    
    // 5. Summary
    console.log('\n📊 Summary:');
    console.log(`   - Global tags: ${tags.length}`);
    console.log(`   - Clients: ${clients.length}`);
    console.log(`   - Clients with tags: ${clients.filter(c => c.tags && c.tags.length > 0).length}`);
    console.log(`   - Tags column: ${columns.length > 0 ? '✅ Exists' : '❌ Missing'}`);
    console.log(`   - Tags index: ${indexes.length > 0 ? '✅ Exists' : '❌ Missing'}`);
    
    console.log('\n✅ Tags system verification completed!');
    
  } catch (error) {
    console.error('❌ Error verifying tags system:', error.message);
  }
}

verifyTagsSystem().catch(console.error); 