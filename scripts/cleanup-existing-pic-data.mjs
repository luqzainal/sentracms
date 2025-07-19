import { neon } from '@neondatabase/serverless';

// Initialize Neon client
const neonConnectionString = process.env.VITE_NEON_DATABASE_URL || "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(neonConnectionString, {
  disableWarningInBrowsers: true
});

// Skrip untuk membersihkan data PIC yang sedia ada yang tidak konsisten
async function cleanupExistingPicData() {
  console.log('🧹 Cleaning up existing PIC data that may be inconsistent...\n');

  try {
    // 1. Dapatkan semua user yang bukan Team role
    console.log('1. Finding users that are not Team role...');
    const nonTeamUsers = await sql`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE role != 'Team' AND status = 'Active'
    `;
    
    console.log(`📋 Found ${nonTeamUsers.length} active users that are not Team role:`);
    nonTeamUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // 2. Dapatkan semua klien yang mungkin ada PIC dari user bukan Team
    console.log('\n2. Finding clients that may have PIC from non-Team users...');
    const clientsWithPIC = await sql`
      SELECT id, name, email, pic 
      FROM clients 
      WHERE pic IS NOT NULL AND pic != ''
    `;
    
    console.log(`📋 Found ${clientsWithPIC.length} clients with PIC data:`);
    clientsWithPIC.forEach(client => {
      console.log(`   - ${client.name}: PIC = "${client.pic}"`);
    });

    // 3. Periksa dan bersihkan PIC yang tidak konsisten
    console.log('\n3. Checking and cleaning inconsistent PIC data...');
    let cleanedCount = 0;

    for (const client of clientsWithPIC) {
      if (!client.pic) continue;

      let pic1 = '';
      let pic2 = '';
      let needsUpdate = false;

      // Parse PIC data
      if (client.pic.includes(' - ')) {
        [pic1, pic2] = client.pic.split(' - ');
      } else {
        pic1 = client.pic;
        pic2 = '';
      }

      // Check if PIC1 is from non-Team user
      if (pic1) {
        const pic1User = nonTeamUsers.find(user => user.name === pic1);
        if (pic1User) {
          console.log(`   ❌ Client ${client.name}: PIC1 "${pic1}" is from non-Team user (${pic1User.role})`);
          pic1 = '';
          needsUpdate = true;
        }
      }

      // Check if PIC2 is from non-Team user
      if (pic2) {
        const pic2User = nonTeamUsers.find(user => user.name === pic2);
        if (pic2User) {
          console.log(`   ❌ Client ${client.name}: PIC2 "${pic2}" is from non-Team user (${pic2User.role})`);
          pic2 = '';
          needsUpdate = true;
        }
      }

      // Update client if needed
      if (needsUpdate) {
        const newPicValue = pic1 && pic2 ? `${pic1} - ${pic2}` : pic1 || pic2;
        
        try {
          await sql`
            UPDATE clients 
            SET pic = ${newPicValue}, updated_at = NOW()
            WHERE id = ${client.id}
          `;
          console.log(`   ✅ Updated client ${client.name} PIC: "${client.pic}" -> "${newPicValue}"`);
          cleanedCount++;
        } catch (error) {
          console.error(`   ❌ Error updating client ${client.name}:`, error);
        }
      }
    }

    // 4. Periksa user yang status Inactive
    console.log('\n4. Finding inactive Team users...');
    const inactiveTeamUsers = await sql`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE role = 'Team' AND status = 'Inactive'
    `;
    
    if (inactiveTeamUsers.length > 0) {
      console.log(`📋 Found ${inactiveTeamUsers.length} inactive Team users:`);
      inactiveTeamUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Status: ${user.status}`);
      });

      // Clean up PIC for inactive Team users
      console.log('\n5. Cleaning up PIC for inactive Team users...');
      for (const user of inactiveTeamUsers) {
        const clientsWithInactivePIC = await sql`
          SELECT id, name, pic 
          FROM clients 
          WHERE pic LIKE ${`%${user.name}%`}
        `;

        for (const client of clientsWithInactivePIC) {
          let pic1 = '';
          let pic2 = '';
          if (client.pic && client.pic.includes(' - ')) {
            [pic1, pic2] = client.pic.split(' - ');
          } else {
            pic1 = client.pic || '';
            pic2 = '';
          }

          // Remove inactive user from PIC
          if (pic1 === user.name) {
            pic1 = '';
          }
          if (pic2 === user.name) {
            pic2 = '';
          }

          const newPicValue = pic1 && pic2 ? `${pic1} - ${pic2}` : pic1 || pic2;

          try {
            await sql`
              UPDATE clients 
              SET pic = ${newPicValue}, updated_at = NOW()
              WHERE id = ${client.id}
            `;
            console.log(`   ✅ Updated client ${client.name} PIC for inactive user: "${client.pic}" -> "${newPicValue}"`);
            cleanedCount++;
          } catch (error) {
            console.error(`   ❌ Error updating client ${client.name}:`, error);
          }
        }
      }
    } else {
      console.log('   ✅ No inactive Team users found');
    }

    // 5. Summary
    console.log('\n🎉 PIC cleanup completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Non-Team users found: ${nonTeamUsers.length}`);
    console.log(`   - Inactive Team users found: ${inactiveTeamUsers.length}`);
    console.log(`   - Total clients cleaned: ${cleanedCount}`);
    
    if (cleanedCount === 0) {
      console.log('   ✅ No inconsistent PIC data found - all data is clean!');
    } else {
      console.log(`   🧹 Cleaned ${cleanedCount} inconsistent PIC references`);
    }

  } catch (error) {
    console.error('❌ Error during PIC cleanup:', error);
  } finally {
    process.exit(0);
  }
}

// Jalankan cleanup
cleanupExistingPicData(); 