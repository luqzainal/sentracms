import fs from 'fs';
import path from 'path';

// RDS connection details (update these)
const rdsConfig = {
  host: 'YOUR_RDS_ENDPOINT.amazonaws.com', // Replace with your RDS endpoint
  port: 5432,
  database: 'postgres', // or your database name
  user: 'postgres', // or your master username
  password: 'YOUR_RDS_PASSWORD', // Replace with your RDS password
  region: 'ap-southeast-1' // Your RDS region
};

// Generate RDS connection string
const rdsConnectionString = `postgresql://${rdsConfig.user}:${rdsConfig.password}@${rdsConfig.host}:${rdsConfig.port}/${rdsConfig.database}?sslmode=require`;

// Files that need connection string updates
const filesToUpdate = [
  'src/services/database.ts',
  'src/context/SupabaseContext.tsx',
  'scripts/apply-client-pics-migration.mjs',
  'scripts/test-multi-pic.mjs',
  'scripts/create-test-team-users.mjs'
];

async function updateConnectionStrings() {
  try {
    console.log('🔄 Updating connection strings from Neon to RDS...');
    
    // Create backup of current connection string
    const backupFile = './connection-string-backup.txt';
    const currentConnectionString = "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    
    fs.writeFileSync(backupFile, `Neon Connection String (Backup):\n${currentConnectionString}\n\nRDS Connection String:\n${rdsConnectionString}`);
    console.log(`📁 Backup created: ${backupFile}`);
    
    // Update each file
    for (const filePath of filesToUpdate) {
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️ Skipping ${filePath} (file not found)`);
        continue;
      }
      
      console.log(`📝 Updating ${filePath}...`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace Neon connection string with RDS
      const updatedContent = content.replace(
        /postgresql:\/\/neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler\.ap-southeast-1\.aws\.neon\.tech\/neondb\?sslmode=require&channel_binding=require/g,
        rdsConnectionString
      );
      
      // Create backup of original file
      const backupPath = `${filePath}.backup`;
      fs.writeFileSync(backupPath, content);
      
      // Write updated content
      fs.writeFileSync(filePath, updatedContent);
      
      console.log(`✅ Updated ${filePath}`);
      console.log(`📁 Backup created: ${backupPath}`);
    }
    
    // Create environment variable file
    const envContent = `# RDS Database Configuration
DATABASE_URL="${rdsConnectionString}"
RDS_HOST="${rdsConfig.host}"
RDS_PORT="${rdsConfig.port}"
RDS_DATABASE="${rdsConfig.database}"
RDS_USER="${rdsConfig.user}"
RDS_PASSWORD="${rdsConfig.password}"
RDS_REGION="${rdsConfig.region}"
`;
    
    fs.writeFileSync('.env.rds', envContent);
    console.log('📁 Created .env.rds file with RDS configuration');
    
    console.log('\n✅ Connection string update completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the new connection with: npm run test-rds-connection');
    console.log('2. Update your deployment environment variables');
    console.log('3. Restart your application');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

updateConnectionStrings(); 