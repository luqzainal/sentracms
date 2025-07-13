#!/usr/bin/env node

/**
 * Deployment Fix Script
 * This script helps fix common deployment issues with SentraCMS
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 SentraCMS Deployment Fix Tool\n');

// Check for .env file
const envPath = join(process.cwd(), '.env');
let envExists = existsSync(envPath);

console.log('📋 Checking Environment Configuration:');

if (!envExists) {
  console.log('  ⚠️  .env file not found, creating example...');
  
  const envExample = `# Database Configuration
# Get your Neon database URL from https://console.neon.tech/
VITE_NEON_DATABASE_URL=postgresql://username:password@your-hostname.neon.tech/database_name?sslmode=require

# Optional: Development Settings
NODE_ENV=development
PORT=3000
`;
  
  writeFileSync(envPath, envExample);
  console.log('  ✅ Created .env file with example configuration');
  console.log('  📝 Please edit .env with your actual database URL');
} else {
  console.log('  ✅ .env file exists');
  
  // Check if database URL is configured
  const envContent = readFileSync(envPath, 'utf8');
  if (envContent.includes('VITE_NEON_DATABASE_URL=') && !envContent.includes('postgresql://username:password')) {
    console.log('  ✅ Database URL appears to be configured');
  } else {
    console.log('  ⚠️  Database URL needs to be configured in .env');
  }
}

// Check deployment platform specific configurations
console.log('\n🚀 Deployment Platform Configurations:');

// Heroku
console.log('\n📦 Heroku:');
console.log('  Set environment variable:');
console.log('    heroku config:set VITE_NEON_DATABASE_URL="your-database-url"');

// Vercel
console.log('\n⚡ Vercel:');
console.log('  1. Go to your project settings');
console.log('  2. Add Environment Variable:');
console.log('     Name: VITE_NEON_DATABASE_URL');
console.log('     Value: your-database-url');

// Netlify
console.log('\n🌐 Netlify:');
console.log('  1. Go to Site settings > Environment variables');
console.log('  2. Add new variable:');
console.log('     Key: VITE_NEON_DATABASE_URL');
console.log('     Value: your-database-url');

// Railway
console.log('\n🚂 Railway:');
console.log('  1. Go to your project Variables');
console.log('  2. Add variable:');
console.log('     VITE_NEON_DATABASE_URL=your-database-url');

// Docker
console.log('\n🐳 Docker:');
console.log('  Build with environment variable:');
console.log('    docker build --build-arg VITE_NEON_DATABASE_URL="your-database-url" -t sentracms .');

console.log('\n⚠️  Important Notes:');
console.log('  • Environment variables must be set BEFORE building');
console.log('  • Vite embeds environment variables at build time');
console.log('  • After setting variables, rebuild and redeploy');

console.log('\n🔍 Debugging Steps:');
console.log('  1. Run: npm run verify-deployment');
console.log('  2. Run: npm run db:test');
console.log('  3. Check deployment platform logs');
console.log('  4. Verify database URL is accessible');

console.log('\n✅ Fix script complete!');
console.log('📖 For detailed instructions, see README.md'); 