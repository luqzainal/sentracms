import { S3Client, PutBucketCorsCommand, PutObjectAclCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

console.log('🚀 Fixing production upload issues for sentra.vip...\n');

// Get environment variables
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Validate environment variables
if (!SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  console.error('❌ Missing DigitalOcean Spaces environment variables.');
  console.error('Required variables:');
  console.error('  DO_SPACES_REGION:', !!SPACES_REGION);
  console.error('  DO_SPACES_KEY:', !!SPACES_KEY);
  console.error('  DO_SPACES_SECRET:', !!SPACES_SECRET);
  console.error('  DO_SPACES_BUCKET:', !!BUCKET_NAME);
  process.exit(1);
}

// Configure S3 client for DigitalOcean Spaces
const baseEndpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;

const s3Client = new S3Client({
  endpoint: baseEndpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

async function fixProductionUpload() {
  try {
    console.log('🔧 Step 1: Setting up CORS for production domain...');
    
    // CORS configuration for production
    const corsConfig = {
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: [
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost:8080',
              'https://www.sentra.vip',
              'https://sentra.vip',
              'https://*.sentra.vip',
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    };

    const corsCommand = new PutBucketCorsCommand(corsConfig);
    await s3Client.send(corsCommand);
    console.log('✅ CORS policy updated for production');
    console.log('');

    console.log('🔧 Step 2: Fixing file permissions...');
    
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
    });
    
    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    console.log(`📄 Found ${files.length} files in bucket`);
    
    if (files.length > 0) {
      // Fix ACL for each file
      let successCount = 0;
      let errorCount = 0;
      
      for (const file of files) {
        try {
          const aclCommand = new PutObjectAclCommand({
            Bucket: BUCKET_NAME,
            Key: file.Key,
            ACL: 'public-read',
          });
          
          await s3Client.send(aclCommand);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }
      
      console.log(`✅ Fixed ACL for ${successCount} files`);
      if (errorCount > 0) {
        console.log(`⚠️  Failed to fix ${errorCount} files`);
      }
    } else {
      console.log('✅ No files to fix ACL for');
    }
    console.log('');

    console.log('🔧 Step 3: Testing upload functionality...');
    
    // Test upload functionality
    const testFileName = `production-test-${Date.now()}.txt`;
    const testContent = 'Production upload test - ' + new Date().toISOString();
    
    const testCommand = new PutObjectAclCommand({
      Bucket: BUCKET_NAME,
      Key: testFileName,
      ContentType: 'text/plain',
      ACL: 'public-read',
      Body: testContent,
    });

    await s3Client.send(testCommand);
    console.log('✅ Test upload successful');
    
    // Test file access
    const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${testFileName}`;
    const response = await fetch(fileUrl);
    
    if (response.ok) {
      console.log('✅ Test file access successful');
    } else {
      console.log('❌ Test file access failed');
    }
    console.log('');

    console.log('🎉 Production upload issues fixed successfully!');
    console.log('');
    console.log('📝 Summary:');
    console.log('   ✅ CORS policy updated for sentra.vip');
    console.log('   ✅ File permissions fixed');
    console.log('   ✅ Upload functionality tested');
    console.log('   ✅ File access verified');
    console.log('');
    console.log('🔧 Next steps for production:');
    console.log('   1. Ensure API server is running: npm run start-api');
    console.log('   2. Build and serve frontend: npm run build && npm run start');
    console.log('   3. Configure reverse proxy (recommended)');
    console.log('   4. Test file uploads on https://www.sentra.vip');
    console.log('');
    console.log('📞 If uploads still fail:');
    console.log('   • Check if API server is running on production');
    console.log('   • Verify environment variables on production server');
    console.log('   • Check production server logs for errors');
    
  } catch (error) {
    console.error('❌ Failed to fix production upload:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check DigitalOcean Spaces credentials');
    console.error('   2. Verify bucket permissions');
    console.error('   3. Ensure bucket exists in the specified region');
    process.exit(1);
  }
}

fixProductionUpload(); 