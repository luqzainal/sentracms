import fs from 'fs';

async function cleanDOSetup() {
  try {
    console.log('🧹 Creating clean DO setup files...');
    
    // Create clean .env file
    const cleanEnvContent = `# DigitalOcean Database Configuration
VITE_NEON_DATABASE_URL=postgresql://doadmin:YOUR_DO_PASSWORD@YOUR_DO_HOST:25060/defaultdb?sslmode=require

# AWS Configuration (if needed)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=sentra-files

# Demo Account Configuration
VITE_DEMO_ADMIN_EMAIL=superadminEVO123@sentra.com
VITE_DEMO_ADMIN_PASSWORD=EVOadmin@123
VITE_DEMO_ADMIN_NAME=Super Admin

# Demo Client Account Configuration
VITE_DEMO_CLIENT_EMAIL=clientEVO123@demo.com
VITE_DEMO_CLIENT_PASSWORD=EVOclient@123
VITE_DEMO_CLIENT_NAME=Demo Client
`;
    
    fs.writeFileSync('.env', cleanEnvContent);
    console.log('✅ Created clean .env file');
    
    // Create clean production guide
    const cleanProductionGuide = `# 🚀 Production Update: DigitalOcean App Platform

## Overview

Guide untuk update production deployment di DigitalOcean App Platform dengan database DO yang baru.

## Step 1: Update Environment Variables

### DigitalOcean App Platform Dashboard

1. **Login ke [DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. **Click "Apps" di left sidebar**
3. **Click pada app name: \`sentracms\`**
4. **Click "Settings" tab**
5. **Scroll down ke "Environment Variables" section**
6. **Click "Edit" button**

### Update Database Connection String

**New (DigitalOcean):**
\`\`\`
Key: VITE_NEON_DATABASE_URL
Value: postgresql://doadmin:YOUR_DO_PASSWORD@YOUR_DO_HOST:25060/defaultdb?sslmode=require
Scope: Build & Run (IMPORTANT!)
\`\`\`

**⚠️ Critical Points:**
- **Scope** mesti set ke "Build & Run" (bukan "Run" je)
- Environment variable mesti available semasa build time
- Click "Save" lepas update variable

## Step 2: Redeploy Application

1. **Go to "Deployments" tab**
2. **Click "Create Deployment"**
3. **Select "GitHub" as source**
4. **Choose branch: main**
5. **Click "Deploy"**

## Step 3: Test Production

### Functionality Tests
1. **Login functionality**
2. **Add new client**
3. **Create invoice**
4. **Add calendar event**
5. **Add user**

---

**🎉 After successful update, your production app will use DigitalOcean database!**
`;
    
    fs.writeFileSync('PRODUCTION_DO_UPDATE.md', cleanProductionGuide);
    console.log('✅ Created clean production guide');
    
    console.log('\n🎉 Clean setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env file with your real DO credentials');
    console.log('2. Commit and push to GitHub');
    console.log('3. Update production environment variables');
    
  } catch (error) {
    console.error('❌ Error creating clean setup:', error);
  }
}

cleanDOSetup(); 