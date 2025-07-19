import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testDeadlineFunctionality() {
  try {
    console.log('🔍 Testing deadline functionality...\n');
    
    // Get client ID for Mohd Shafiq
    const client = await sql`
      SELECT id, name FROM clients WHERE name = 'Mohd Shafiq' LIMIT 1;
    `;
    
    if (client.length === 0) {
      console.log('❌ Client Mohd Shafiq not found');
      return;
    }
    
    const clientId = client[0].id;
    console.log(`✅ Client: ${client[0].name} (ID: ${clientId})`);
    
    // Get progress steps with deadlines
    const progressSteps = await sql`
      SELECT id, title, deadline, completed, important 
      FROM progress_steps 
      WHERE client_id = ${clientId} 
      ORDER BY deadline;
    `;
    
    console.log(`\n📋 Progress steps with deadlines (${progressSteps.length}):`);
    progressSteps.forEach(step => {
      const deadline = new Date(step.deadline);
      const isOverdue = deadline < new Date();
      const status = step.completed ? '✅' : isOverdue ? '🔴' : '⏳';
      const important = step.important ? '⭐' : '';
      
      console.log(`  ${status} ${important} ${step.title}`);
      console.log(`    Deadline: ${deadline.toLocaleDateString()} at ${deadline.toLocaleTimeString()}`);
      console.log(`    Status: ${step.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}`);
      console.log('');
    });
    
    // Check overdue steps
    const overdueSteps = progressSteps.filter(step => {
      const deadline = new Date(step.deadline);
      return !step.completed && deadline < new Date();
    });
    
    if (overdueSteps.length > 0) {
      console.log(`⚠️  Overdue steps (${overdueSteps.length}):`);
      overdueSteps.forEach(step => {
        const deadline = new Date(step.deadline);
        console.log(`  - ${step.title}`);
        console.log(`    Overdue since: ${deadline.toLocaleDateString()}`);
      });
    } else {
      console.log('✅ No overdue steps');
    }
    
    // Check upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingSteps = progressSteps.filter(step => {
      const deadline = new Date(step.deadline);
      return !step.completed && deadline > new Date() && deadline <= nextWeek;
    });
    
    if (upcomingSteps.length > 0) {
      console.log(`\n📅 Upcoming deadlines (next 7 days) (${upcomingSteps.length}):`);
      upcomingSteps.forEach(step => {
        const deadline = new Date(step.deadline);
        const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`  - ${step.title}`);
        console.log(`    Due in: ${daysLeft} day(s) - ${deadline.toLocaleDateString()}`);
      });
    } else {
      console.log('\n📅 No upcoming deadlines in next 7 days');
    }
    
    // Summary
    const completedSteps = progressSteps.filter(step => step.completed).length;
    const pendingSteps = progressSteps.filter(step => !step.completed).length;
    const completionRate = progressSteps.length > 0 ? Math.round((completedSteps / progressSteps.length) * 100) : 0;
    
    console.log(`\n📊 Summary:`);
    console.log(`  - Total steps: ${progressSteps.length}`);
    console.log(`  - Completed: ${completedSteps}`);
    console.log(`  - Pending: ${pendingSteps}`);
    console.log(`  - Overdue: ${overdueSteps.length}`);
    console.log(`  - Upcoming: ${upcomingSteps.length}`);
    console.log(`  - Completion rate: ${completionRate}%`);
    
    console.log('\n✅ Deadline functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing deadline functionality:', error.message);
  }
}

testDeadlineFunctionality().catch(console.error); 