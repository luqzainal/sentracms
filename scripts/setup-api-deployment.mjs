import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');

console.log('🚀 Setting up API Server for Deployment...\n');

// Check if sentra-api directory exists
const apiDir = join(rootDir, 'sentra-api');
if (!fs.existsSync(apiDir)) {
  console.error('❌ sentra-api directory not found!');
  process.exit(1);
}

console.log('✅ sentra-api directory found');

// Check required files
const requiredFiles = [
  'server.mjs',
  'package.json',
  'README.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = join(apiDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Some required files are missing!');
  process.exit(1);
}

// Test package.json
try {
  const packagePath = join(apiDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log('\n📦 Package.json validation:');
  console.log('   Name:', packageJson.name);
  console.log('   Version:', packageJson.version);
  console.log('   Dependencies:', Object.keys(packageJson.dependencies || {}).length, 'packages');
  console.log('   Start script:', packageJson.scripts?.start);
  
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Test server.mjs
try {
  const serverPath = join(apiDir, 'server.mjs');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  console.log('\n🔧 Server.mjs validation:');
  console.log('   File size:', serverContent.length, 'bytes');
  console.log('   Has express import:', serverContent.includes('express'));
  console.log('   Has CORS setup:', serverContent.includes('cors'));
  console.log('   Has S3 client:', serverContent.includes('@aws-sdk/client-s3'));
  console.log('   Has upload endpoint:', serverContent.includes('/api/generate-upload-url'));
  
} catch (error) {
  console.error('❌ Error reading server.mjs:', error.message);
  process.exit(1);
}

console.log('\n🎯 Deployment Instructions:');
console.log('==========================');
console.log('');
console.log('1. 📁 Create GitHub Repository:');
console.log('   - Go to GitHub.com');
console.log('   - Create new repository: sentra-api');
console.log('   - Make it public (for free deployment)');
console.log('');
console.log('2. 📂 Push API Server to GitHub:');
console.log('   cd sentra-api');
console.log('   git init');
console.log('   git add .');
console.log('   git commit -m "Initial API server setup"');
console.log('   git branch -M main');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/sentra-api.git');
console.log('   git push -u origin main');
console.log('');
console.log('3. 🚀 Deploy to DigitalOcean:');
console.log('   - Go to cloud.digitalocean.com/apps');
console.log('   - Click "Create App"');
console.log('   - Choose "GitHub" as source');
console.log('   - Select sentra-api repository');
console.log('   - Choose main branch');
console.log('');
console.log('4. ⚙️ Configure App Settings:');
console.log('   - App Name: sentra-api');
console.log('   - Environment: Node.js');
console.log('   - Build Command: npm install');
console.log('   - Run Command: npm start');
console.log('   - Port: 3001');
console.log('');
console.log('5. 🔑 Set Environment Variables:');
console.log('   AWS_ACCESS_KEY_ID=your_aws_access_key');
console.log('   AWS_SECRET_ACCESS_KEY=your_aws_secret_key');
console.log('   AWS_REGION=ap-southeast-1');
console.log('   AWS_S3_BUCKET=sentra-test');
console.log('   NODE_ENV=production');
console.log('');
console.log('6. 🚀 Deploy:');
console.log('   - Click "Create Resources"');
console.log('   - Wait for deployment to complete');
console.log('   - Copy the app URL');
console.log('');
console.log('7. 🔗 Update Frontend:');
console.log('   - Replace /api/generate-upload-url with full API URL');
console.log('   - Test upload functionality');
console.log('');
console.log('✅ API server is ready for deployment!');
console.log('');
console.log('📖 See API_SERVER_DEPLOYMENT.md for detailed instructions'); 