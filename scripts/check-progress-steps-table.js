import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function checkProgressStepsTable() {
  try {
    console.log('🔍 Checking progress_steps table structure...\n');
    
    // Get table columns
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'progress_steps' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 progress_steps table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if deadline columns exist
    const deadlineColumns = columns.filter(col => 
      col.column_name.includes('deadline') || 
      col.column_name.includes('completed')
    );
    
    console.log('\n📅 Deadline-related columns:');
    if (deadlineColumns.length > 0) {
      deadlineColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('  ❌ No deadline columns found');
    }
    
    // Check sample data
    console.log('\n📋 Sample progress steps:');
    const sampleSteps = await sql`
      SELECT id, title, deadline, completed, important 
      FROM progress_steps 
      LIMIT 3;
    `;
    
    sampleSteps.forEach(step => {
      console.log(`  - ${step.title}:`);
      console.log(`    Deadline: ${step.deadline}`);
      console.log(`    Completed: ${step.completed}`);
      console.log(`    Important: ${step.important}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking progress_steps table:', error);
  }
}

checkProgressStepsTable(); 