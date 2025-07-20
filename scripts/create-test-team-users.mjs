import { neon } from '@neondatabase/serverless';

// Use the same connection string as the application
const neonConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(neonConnectionString);

async function createTestTeamUsers() {
  try {
    console.log('👥 Creating test Team users...');
    
    // Check existing Team users
    const existingUsers = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE role = 'Team'
    `;
    
    console.log(`📋 Found ${existingUsers.length} existing Team users`);
    
    if (existingUsers.length >= 3) {
      console.log('✅ Sufficient Team users already exist');
      return;
    }
    
    // Create test Team users
    const testUsers = [
      {
        name: 'John Admin',
        email: 'john.admin@test.com',
        role: 'Team'
      },
      {
        name: 'Sarah Manager',
        email: 'sarah.manager@test.com',
        role: 'Team'
      },
      {
        name: 'Mike Coordinator',
        email: 'mike.coordinator@test.com',
        role: 'Team'
      }
    ];
    
    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;
      
      if (existingUser.length === 0) {
        await sql`
          INSERT INTO users (name, email, role, status)
          VALUES (${user.name}, ${user.email}, ${user.role}, 'Active')
        `;
        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } else {
        console.log(`⏭️ User already exists: ${user.name} (${user.email})`);
      }
    }
    
    // Verify users were created
    const finalUsers = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE role = 'Team'
      ORDER BY name
    `;
    
    console.log(`\n📋 Final Team users (${finalUsers.length}):`);
    finalUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
    });
    
    console.log('\n✅ Test Team users setup completed!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    process.exit(0);
  }
}

createTestTeamUsers(); 