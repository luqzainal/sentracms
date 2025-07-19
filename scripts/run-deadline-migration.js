import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function runDeadlineMigration() {
  try {
    console.log('🔧 Running deadline migration...\n');
    
    // Add new deadline columns to progress_steps table
    console.log('📋 Adding new deadline columns...');
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_deadline TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS first_draft_deadline TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS second_draft_deadline TIMESTAMPTZ;
    `;
    console.log('✅ Added deadline columns');
    
    // Add completion status columns for each deadline
    console.log('📋 Adding completion status columns...');
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS first_draft_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS second_draft_completed BOOLEAN DEFAULT false;
    `;
    console.log('✅ Added completion status columns');
    
    // Add completion date columns for each deadline
    console.log('📋 Adding completion date columns...');
    await sql`
      ALTER TABLE progress_steps 
      ADD COLUMN IF NOT EXISTS onboarding_completed_date DATE,
      ADD COLUMN IF NOT EXISTS first_draft_completed_date DATE,
      ADD COLUMN IF NOT EXISTS second_draft_completed_date DATE;
    `;
    console.log('✅ Added completion date columns');
    
    // Update existing package setup steps with default deadlines
    console.log('📋 Updating existing package setup steps...');
    const result = await sql`
      UPDATE progress_steps 
      SET 
        onboarding_deadline = deadline + INTERVAL '7 days',
        first_draft_deadline = deadline + INTERVAL '14 days',
        second_draft_deadline = deadline + INTERVAL '21 days'
      WHERE title LIKE '% - Package Setup%';
    `;
    console.log(`✅ Updated ${result.count} package setup steps`);
    
    // Create index for better performance
    console.log('📋 Creating index...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_progress_steps_deadlines 
      ON progress_steps (onboarding_deadline, first_draft_deadline, second_draft_deadline);
    `;
    console.log('✅ Created index');
    
    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'progress_steps' 
      AND column_name IN ('onboarding_deadline', 'first_draft_deadline', 'second_draft_deadline', 
                         'onboarding_completed', 'first_draft_completed', 'second_draft_completed',
                         'onboarding_completed_date', 'first_draft_completed_date', 'second_draft_completed_date')
      ORDER BY column_name;
    `;
    
    console.log('\n📋 New columns added:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check sample data
    console.log('\n🔍 Checking sample data...');
    const sampleSteps = await sql`
      SELECT id, title, onboarding_deadline, first_draft_deadline, second_draft_deadline
      FROM progress_steps 
      WHERE title LIKE '% - Package Setup%'
      LIMIT 3;
    `;
    
    console.log('\n📋 Sample package steps:');
    sampleSteps.forEach(step => {
      console.log(`  - ${step.title}:`);
      console.log(`    Onboarding: ${step.onboarding_deadline}`);
      console.log(`    First Draft: ${step.first_draft_deadline}`);
      console.log(`    Second Draft: ${step.second_draft_deadline}`);
    });
    
    console.log('\n✅ Deadline migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running deadline migration:', error);
    process.exit(1);
  }
}

runDeadlineMigration(); 