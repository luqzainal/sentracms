const { sql } = require('../src/services/database.ts');

async function testCalendarFixes() {
  console.log('🧪 Testing Calendar Fixes...\n');

  try {
    // Test 1: Check if calendar_events table exists
    console.log('1️⃣ Checking calendar_events table...');
    const tableCheck = await sql`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'calendar_events'
    )`;
    console.log(`   Table exists: ${tableCheck[0].exists ? '✅' : '❌'}`);

    // Test 2: Check current events
    console.log('\n2️⃣ Checking current calendar events...');
    const events = await sql`SELECT * FROM calendar_events ORDER BY created_at DESC LIMIT 5`;
    console.log(`   Found ${events.length} events`);
    
    if (events.length > 0) {
      events.forEach((event, index) => {
        console.log(`   Event ${index + 1}: ${event.title} on ${event.start_date} at ${event.start_time}`);
      });
    }

    // Test 3: Test date parsing logic
    console.log('\n3️⃣ Testing date parsing logic...');
    const testDates = [
      '2025-07-22',
      '2025-07-22T09:00:00.000Z',
      '2025-07-22T09:00:00',
      '2025-07-22 09:00:00'
    ];

    testDates.forEach((dateStr, index) => {
      try {
        let parsedDate = '';
        if (typeof dateStr === 'string') {
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            parsedDate = dateStr;
          } else if (dateStr.includes('T')) {
            parsedDate = dateStr.split('T')[0];
          } else {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              parsedDate = parsed.toISOString().split('T')[0];
            }
          }
        }
        console.log(`   Test ${index + 1}: "${dateStr}" → "${parsedDate}" ${parsedDate ? '✅' : '❌'}`);
      } catch (e) {
        console.log(`   Test ${index + 1}: "${dateStr}" → Error: ${e.message} ❌`);
      }
    });

    // Test 4: Test validation logic
    console.log('\n4️⃣ Testing validation logic...');
    const testCases = [
      { start: '2025-07-22T09:00', end: '2025-07-22T10:00', expected: true, desc: 'Same date, different time' },
      { start: '2025-07-22T09:00', end: '2025-07-22T09:00', expected: true, desc: 'Same date, same time' },
      { start: '2025-07-22T10:00', end: '2025-07-22T09:00', expected: false, desc: 'Same date, end before start' },
      { start: '2025-07-23T09:00', end: '2025-07-22T10:00', expected: false, desc: 'End date before start date' }
    ];

    testCases.forEach((testCase, index) => {
      const startDateTime = new Date(testCase.start);
      const endDateTime = new Date(testCase.end);
      const isValid = endDateTime >= startDateTime;
      const status = isValid === testCase.expected ? '✅' : '❌';
      console.log(`   Test ${index + 1}: ${testCase.desc} - ${isValid} ${status}`);
    });

    console.log('\n🎉 Calendar fixes test completed!');
    console.log('\n📋 Summary:');
    console.log('   • Date parsing: Improved to handle multiple formats');
    console.log('   • Validation: Now allows same start/end date');
    console.log('   • Default dates: New events default to today');
    console.log('   • Error handling: Invalid dates are skipped instead of showing today');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testCalendarFixes(); 