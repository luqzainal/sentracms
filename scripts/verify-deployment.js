#!/usr/bin/env node

/**
 * Deployment Verification Script
 * This script helps verify that the application is properly configured for deployment
 */

console.log('🔍 SentraCMS Deployment Verification\n');

// Check if running in production mode
const isProduction = process.env.NODE_ENV === 'production';
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Check for required environment variables
const requiredEnvVars = [
  'VITE_NEON_DATABASE_URL'
];

let allEnvVarsPresent = true;
console.log('\n📋 Environment Variables Check:');

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 30)}...`);
  } else {
    console.log(`  ❌ ${varName}: Missing`);
    allEnvVarsPresent = false;
  }
});

// Check build configuration
console.log('\n🔧 Build Configuration:');
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if dist folder exists
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    console.log('  ✅ dist folder exists');
    
    // Check if index.html exists
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('  ✅ index.html exists');
      
      // Check if environment variables are embedded in the build
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('VITE_NEON_DATABASE_URL') || indexContent.includes('postgresql://')) {
        console.log('  ✅ Database URL appears to be embedded in build');
      } else {
        console.log('  ⚠️  Database URL may not be embedded in build');
      }
    } else {
      console.log('  ❌ index.html missing');
    }
  } else {
    console.log('  ❌ dist folder missing - run npm run build first');
  }
} catch (error) {
  console.log('  ⚠️  Could not verify build configuration');
}

// Database connection test
console.log('\n🔗 Database Connection Test:');
if (process.env.VITE_NEON_DATABASE_URL) {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.VITE_NEON_DATABASE_URL);
    
    sql`SELECT NOW() as current_time`
      .then(result => {
        console.log('  ✅ Database connection successful');
        console.log(`  ⏰ Server time: ${result[0].current_time}`);
      })
      .catch(error => {
        console.log('  ❌ Database connection failed:', error.message);
      });
  } catch (error) {
    console.log('  ⚠️  Could not test database connection:', error.message);
  }
} else {
  console.log('  ❌ Cannot test database connection - VITE_NEON_DATABASE_URL not set');
}

// Deployment recommendations
console.log('\n🚀 Deployment Recommendations:');

if (!allEnvVarsPresent) {
  console.log('  ⚠️  Set missing environment variables in your deployment platform');
  console.log('     - Heroku: heroku config:set VITE_NEON_DATABASE_URL="..."');
  console.log('     - Vercel: Add to Environment Variables in project settings');
  console.log('     - Netlify: Add to Environment Variables in site settings');
}

console.log('  📖 For detailed deployment instructions, see README.md');
console.log('  🔧 Run `npm run db:test` to verify database connection');
console.log('  🏗️  Run `npm run db:setup` to initialize database tables');

console.log('\n✅ Verification complete!'); 