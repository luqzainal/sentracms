import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkProgressStepsTable() {
  try {
    console.log('🔍 Checking progress_steps table structure...');
    
    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'progress_steps' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Progress Steps table structure:');
    if (columns.length > 0) {
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('  ❌ No columns found');
    }
    
    // Check existing progress steps
    const steps = await sql`
      SELECT id, client_id, title, description, deadline, completed, important
      FROM progress_steps 
      ORDER BY created_at DESC;
    `;
    
    console.log('\n📋 Existing progress steps:');
    steps.forEach(step => {
      console.log(`  - ID: ${step.id}, Title: ${step.title}, Completed: ${step.completed}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking progress_steps table:', error.message);
  }
}

checkProgressStepsTable().catch(console.error); 