#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up DigitalOcean Spaces for file uploads...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envLocalPath = path.join(__dirname, '..', '.env.local');

let targetPath = null;
if (!fs.existsSync(envPath) && !fs.existsSync(envLocalPath)) {
  console.log('📝 Creating .env file...');
  targetPath = envPath;
} else if (fs.existsSync(envLocalPath)) {
  console.log('📝 Using existing .env.local file...');
  targetPath = envLocalPath;
} else {
  console.log('📝 Using existing .env file...');
  targetPath = envPath;
}

// Read existing content if file exists
let existingContent = '';
if (targetPath && fs.existsSync(targetPath)) {
  existingContent = fs.readFileSync(targetPath, 'utf8');
}

// Check if DigitalOcean Spaces variables already exist
const hasSpacesConfig = existingContent.includes('DO_SPACES_ENDPOINT');

if (hasSpacesConfig) {
  console.log('✅ DigitalOcean Spaces configuration already exists!');
  console.log('\n📋 Current configuration:');
  const lines = existingContent.split('\n');
  lines.forEach(line => {
    if (line.startsWith('DO_SPACES_')) {
      console.log(`   ${line}`);
    }
  });
} else {
  console.log('❌ DigitalOcean Spaces configuration not found.');
  console.log('\n📋 To enable file uploads, you need to:');
  console.log('\n1. Create a DigitalOcean Spaces bucket:');
  console.log('   - Go to https://cloud.digitalocean.com/spaces');
  console.log('   - Click "Create a Space"');
  console.log('   - Choose a region and name');
  console.log('   - Set to "Public" for file access');
  
  console.log('\n2. Get your API credentials:');
  console.log('   - Go to https://cloud.digitalocean.com/account/api/tokens');
  console.log('   - Create a new API token with "Write" access');
  
  console.log('\n3. Add these environment variables to your .env file:');
  console.log(`
DO_SPACES_ENDPOINT=your-bucket-name.your-region.digitaloceanspaces.com
DO_SPACES_REGION=your-region
DO_SPACES_KEY=your-access-key
DO_SPACES_SECRET=your-secret-key
DO_SPACES_BUCKET=your-bucket-name
  `);
  
  console.log('\n4. For production deployment:');
  console.log('   - Add these same variables to your DigitalOcean App Platform');
  console.log('   - Set scope to "Build & Run"');
  
  console.log('\n⚠️  Without these variables, file uploads will fail!');
}

console.log('\n🔗 Useful links:');
console.log('   - DigitalOcean Spaces: https://cloud.digitalocean.com/spaces');
console.log('   - API Tokens: https://cloud.digitalocean.com/account/api/tokens');
console.log('   - Spaces Documentation: https://docs.digitalocean.com/products/spaces/');

console.log('\n✨ Setup complete!'); 