import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');

console.log('🚀 Preparing API Server for Deployment...\n');

// Check if api/package.json exists
const apiPackagePath = join(rootDir, 'api', 'package.json');
if (!fs.existsSync(apiPackagePath)) {
  console.error('❌ api/package.json not found!');
  console.error('Please create package.json in api/ directory first.');
  process.exit(1);
}

console.log('✅ API package.json found');

// Check if final-production-server.mjs exists
const serverPath = join(rootDir, 'api', 'final-production-server.mjs');
if (!fs.existsSync(serverPath)) {
  console.error('❌ api/final-production-server.mjs not found!');
  process.exit(1);
}

console.log('✅ Production server file found');

// Display deployment instructions
console.log('\n📋 Deployment Instructions:');
console.log('============================');
console.log('');
console.log('1. 📁 Create new repository for API server:');
console.log('   - Go to GitHub and create new repository: sentra-api');
console.log('   - Clone the repository locally');
console.log('');
console.log('2. 📂 Copy API files to new repository:');
console.log('   - Copy api/final-production-server.mjs → server.mjs');
console.log('   - Copy api/package.json → package.json');
console.log('   - Create .env file with AWS credentials');
console.log('');
console.log('3. 🔧 Set up .env file:');
console.log('   AWS_ACCESS_KEY_ID=your_aws_access_key');
console.log('   AWS_SECRET_ACCESS_KEY=your_aws_secret_key');
console.log('   AWS_REGION=ap-southeast-1');
console.log('   AWS_S3_BUCKET=sentra-test');
console.log('   PORT=3001');
console.log('   NODE_ENV=production');
console.log('');
console.log('4. 🚀 Deploy to DigitalOcean:');
console.log('   - Go to DigitalOcean App Platform');
console.log('   - Create new app from GitHub repository');
console.log('   - Set environment variables');
console.log('   - Deploy');
console.log('');
console.log('5. 🔗 Update frontend API calls:');
console.log('   - Replace /api/generate-upload-url with full API server URL');
console.log('   - Update CORS configuration if needed');
console.log('');
console.log('📖 See API_SERVER_DEPLOYMENT.md for detailed instructions');
console.log('');
console.log('🎯 Expected API server URL: https://sentra-api-xxxxx.ondigitalocean.app');
console.log('');

// Show current API server configuration
console.log('🔧 Current API Server Configuration:');
console.log('====================================');
console.log('Server File:', serverPath);
console.log('Package File:', apiPackagePath);

try {
  const packageJson = JSON.parse(fs.readFileSync(apiPackagePath, 'utf8'));
  console.log('Dependencies:', Object.keys(packageJson.dependencies || {}));
  console.log('Start Script:', packageJson.scripts?.start);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n✅ API server is ready for deployment!'); 