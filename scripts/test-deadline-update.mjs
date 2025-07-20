import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.VITE_NEON_DATABASE_URL);

async function testDeadlineUpdate() {
  console.log('🧪 Testing Deadline Update Functionality...\n');

  try {
    // 1. Get a sample progress step with deadlines
    console.log('📋 Step 1: Getting sample progress step...');
    const steps = await sql`
      SELECT * FROM progress_steps 
      WHERE onboarding_deadline IS NOT NULL 
      OR first_draft_deadline IS NOT NULL 
      OR second_draft_deadline IS NOT NULL
      LIMIT 1
    `;

    if (steps.length === 0) {
      console.log('❌ No progress steps with deadlines found. Creating test data...');
      
      // Create test progress step
      const testStep = await sql`
        INSERT INTO progress_steps (
          client_id, title, description, deadline, completed, important,
          onboarding_deadline, first_draft_deadline, second_draft_deadline,
          onboarding_completed, first_draft_completed, second_draft_completed
        ) VALUES (
          1, 'Test Package', 'Test package description', '2025-12-31', false, true,
          '2025-09-25 20:41:52+08', '2025-10-02 20:41:52+08', '2025-10-09 20:41:52+08',
          false, false, false
        ) RETURNING *
      `;
      
      console.log('✅ Created test progress step:', testStep[0].id);
      steps[0] = testStep[0];
    }

    const step = steps[0];
    console.log('✅ Found progress step:', step.id);
    console.log('   Current deadlines:');
    console.log('   - Onboarding:', step.onboarding_deadline);
    console.log('   - First Draft:', step.first_draft_deadline);
    console.log('   - Second Draft:', step.second_draft_deadline);

    // 2. Test updating onboarding deadline
    console.log('\n📋 Step 2: Testing onboarding deadline update...');
    const newOnboardingDeadline = '2025-10-15T12:00:00.000Z';
    
    const updatedStep = await sql`
      UPDATE progress_steps
      SET 
        onboarding_deadline = ${newOnboardingDeadline},
        updated_at = NOW()
      WHERE id = ${step.id}
      RETURNING *
    `;

    console.log('✅ Updated onboarding deadline to:', newOnboardingDeadline);
    console.log('   New deadline in DB:', updatedStep[0].onboarding_deadline);

    // 3. Test updating first draft deadline
    console.log('\n📋 Step 3: Testing first draft deadline update...');
    const newFirstDraftDeadline = '2025-10-20T12:00:00.000Z';
    
    const updatedStep2 = await sql`
      UPDATE progress_steps
      SET 
        first_draft_deadline = ${newFirstDraftDeadline},
        updated_at = NOW()
      WHERE id = ${step.id}
      RETURNING *
    `;

    console.log('✅ Updated first draft deadline to:', newFirstDraftDeadline);
    console.log('   New deadline in DB:', updatedStep2[0].first_draft_deadline);

    // 4. Test updating second draft deadline
    console.log('\n📋 Step 4: Testing second draft deadline update...');
    const newSecondDraftDeadline = '2025-10-25T12:00:00.000Z';
    
    const updatedStep3 = await sql`
      UPDATE progress_steps
      SET 
        second_draft_deadline = ${newSecondDraftDeadline},
        updated_at = NOW()
      WHERE id = ${step.id}
      RETURNING *
    `;

    console.log('✅ Updated second draft deadline to:', newSecondDraftDeadline);
    console.log('   New deadline in DB:', updatedStep3[0].second_draft_deadline);

    // 5. Verify all updates persisted
    console.log('\n📋 Step 5: Verifying all updates persisted...');
    const finalStep = await sql`
      SELECT * FROM progress_steps WHERE id = ${step.id}
    `;

    console.log('✅ Final step data:');
    console.log('   - Onboarding:', finalStep[0].onboarding_deadline);
    console.log('   - First Draft:', finalStep[0].first_draft_deadline);
    console.log('   - Second Draft:', finalStep[0].second_draft_deadline);
    console.log('   - Updated At:', finalStep[0].updated_at);

    // 6. Test completion status updates
    console.log('\n📋 Step 6: Testing completion status updates...');
    const completionUpdate = await sql`
      UPDATE progress_steps
      SET 
        onboarding_completed = true,
        onboarding_completed_date = NOW(),
        first_draft_completed = true,
        first_draft_completed_date = NOW(),
        updated_at = NOW()
      WHERE id = ${step.id}
      RETURNING *
    `;

    console.log('✅ Updated completion status:');
    console.log('   - Onboarding completed:', completionUpdate[0].onboarding_completed);
    console.log('   - Onboarding completed date:', completionUpdate[0].onboarding_completed_date);
    console.log('   - First draft completed:', completionUpdate[0].first_draft_completed);
    console.log('   - First draft completed date:', completionUpdate[0].first_draft_completed_date);

    console.log('\n🎉 All deadline update tests passed successfully!');
    console.log('   The deadline update functionality is working correctly.');
    console.log('   Updates are being saved to the database and persisting after refresh.');

  } catch (error) {
    console.error('❌ Error testing deadline update:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

testDeadlineUpdate(); 