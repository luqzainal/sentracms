import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function productionMigration() {
  try {
    console.log('🚀 Running production migration...\n');
    
    // Check if columns already exist
    console.log('🔍 Checking existing columns...');
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'progress_steps' 
      AND column_name IN ('onboarding_deadline', 'first_draft_deadline', 'second_draft_deadline')
      ORDER BY column_name;
    `;
    
    if (existingColumns.length === 3) {
      console.log('✅ All deadline columns already exist!');
      console.log('Columns found:', existingColumns.map(col => col.column_name).join(', '));
      return;
    }
    
    console.log('📋 Adding missing columns...');
    
    // Add deadline columns safely
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_deadline TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS first_draft_deadline TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS second_draft_deadline TIMESTAMPTZ;
    `;
    console.log('✅ Added deadline columns');
    
    // Add completion status columns
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS first_draft_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS second_draft_completed BOOLEAN DEFAULT false;
    `;
    console.log('✅ Added completion status columns');
    
    // Add completion date columns
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_completed_date DATE,
      ADD COLUMN IF NOT EXISTS first_draft_completed_date DATE,
      ADD COLUMN IF NOT EXISTS second_draft_completed_date DATE;
    `;
    console.log('✅ Added completion date columns');
    
    // Update existing package setup steps with default deadlines
    console.log('📋 Updating existing package steps...');
    const result = await sql`
      UPDATE progress_steps 
      SET 
        onboarding_deadline = deadline + INTERVAL '7 days',
        first_draft_deadline = deadline + INTERVAL '14 days',
        second_draft_deadline = deadline + INTERVAL '21 days'
      WHERE title LIKE '% - Package Setup%'
      AND (onboarding_deadline IS NULL OR first_draft_deadline IS NULL OR second_draft_deadline IS NULL);
    `;
    console.log(`✅ Updated ${result.count} package steps`);
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const finalColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'progress_steps' 
      AND column_name IN ('onboarding_deadline', 'first_draft_deadline', 'second_draft_deadline')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 Final deadline columns:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    console.log('\n✅ Production migration completed successfully!');
    console.log('🎯 Deadline functionality is now ready for production use.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n💡 If this is a production environment, please:');
    console.log('1. Check database connection');
    console.log('2. Verify database permissions');
    console.log('3. Run migration manually in database admin panel');
  }
}

// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  productionMigration();
}

export { productionMigration }; 