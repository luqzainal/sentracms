#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');

console.log('🔧 Setup AWS S3 Configuration Baru');
console.log('=====================================\n');

// Check if .env file exists
const envPath = join(rootDir, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 File .env sudah wujud');
  console.log('   Path:', envPath);
  
  // Read current .env content
  const currentEnv = fs.readFileSync(envPath, 'utf8');
  console.log('\n📋 Konfigurasi semasa:');
  console.log(currentEnv);
  
  console.log('\n⚠️  Untuk tukar ke akaun AWS S3 baru, sila:');
  console.log('1. Edit file .env');
  console.log('2. Tukar nilai-nilai berikut:');
  console.log('   - AWS_ACCESS_KEY_ID');
  console.log('   - AWS_SECRET_ACCESS_KEY');
  console.log('   - AWS_S3_BUCKET (jika perlu)');
  console.log('3. Restart server');
  
} else {
  console.log('📁 File .env tidak wujud');
  console.log('   Path:', envPath);
  
  // Create .env template
  const envTemplate = `# AWS S3 Configuration
# Sila isi dengan credentials AWS S3 akaun baru anda
AWS_ACCESS_KEY_ID=your_new_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_new_aws_secret_key_here
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your_new_s3_bucket_name

# Server Configuration
PORT=3001
NODE_ENV=production
`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ File .env telah dibuat');
    console.log('   Path:', envPath);
    console.log('\n📝 Sila edit file .env dan isi dengan:');
    console.log('1. AWS_ACCESS_KEY_ID - Access key dari akaun AWS baru');
    console.log('2. AWS_SECRET_ACCESS_KEY - Secret key dari akaun AWS baru');
    console.log('3. AWS_S3_BUCKET - Nama bucket S3 yang baru');
    console.log('4. AWS_REGION - Region bucket (biasanya ap-southeast-1)');
    
  } catch (error) {
    console.error('❌ Error membuat file .env:', error.message);
    console.log('\n📝 Sila buat file .env secara manual dengan kandungan:');
    console.log(envTemplate);
  }
}

console.log('\n🔍 Langkah seterusnya:');
console.log('1. Edit file .env dengan credentials AWS S3 baru');
console.log('2. Pastikan bucket S3 sudah dibuat dan dikonfigurasi');
console.log('3. Test upload dengan: npm run test-aws-upload');
console.log('4. Restart server jika perlu'); 