import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function debugS3Upload() {
  console.log('🔍 Debugging S3 Upload Process...\n');

  try {
    // 1. Check environment variables
    console.log('📋 Step 1: Checking environment variables...');
    const requiredVars = {
      'AWS_ACCESS_KEY_ID': process.env.AWS_ACCESS_KEY_ID,
      'AWS_SECRET_ACCESS_KEY': process.env.AWS_SECRET_ACCESS_KEY,
      'AWS_REGION': process.env.AWS_REGION,
      'AWS_S3_BUCKET': process.env.AWS_S3_BUCKET
    };

    let allVarsPresent = true;
    Object.entries(requiredVars).forEach(([key, value]) => {
      if (value) {
        console.log(`✅ ${key}: ${key.includes('KEY') ? '***' : value}`);
      } else {
        console.log(`❌ ${key}: MISSING`);
        allVarsPresent = false;
      }
    });

    if (!allVarsPresent) {
      console.log('\n❌ Missing environment variables. Please check your .env file.');
      return;
    }

    // 2. Test API endpoint
    console.log('\n📋 Step 2: Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/generate-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'test-debug.jpg',
          fileType: 'image/jpeg',
        }),
      });

      console.log(`📡 API Response Status: ${response.status}`);
      console.log(`📡 API Response Headers:`, Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response Data:');
        console.log('   - uploadUrl length:', data.uploadUrl?.length || 0);
        console.log('   - publicUrl:', data.publicUrl);
        console.log('   - fileName:', data.fileName);

        // 3. Test S3 upload with the generated URL
        console.log('\n📋 Step 3: Testing S3 upload...');
        
        // Create a test file content
        const testFileContent = 'This is a test file for debugging S3 upload';
        const testFile = new Blob([testFileContent], { type: 'image/jpeg' });

        console.log('📤 Uploading test file to S3...');
        console.log('   - File size:', testFile.size, 'bytes');
        console.log('   - File type:', testFile.type);

        const uploadResponse = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: testFile,
          headers: {
            'Content-Type': 'image/jpeg',
          },
        });

        console.log(`📡 S3 Upload Response Status: ${uploadResponse.status}`);
        console.log(`📡 S3 Upload Response Headers:`, Object.fromEntries(uploadResponse.headers.entries()));

        if (uploadResponse.ok) {
          console.log('✅ S3 upload successful!');
          
          // 4. Test accessing the uploaded file
          console.log('\n📋 Step 4: Testing file access...');
          try {
            const fileResponse = await fetch(data.publicUrl);
            console.log(`📡 File Access Status: ${fileResponse.status}`);
            
            if (fileResponse.ok) {
              console.log('✅ File is accessible via public URL!');
            } else {
              console.log('❌ File not accessible via public URL');
              console.log('   - This might be a CORS or bucket policy issue');
            }
          } catch (error) {
            console.log('❌ Error accessing file:', error.message);
          }
        } else {
          console.log('❌ S3 upload failed!');
          const errorText = await uploadResponse.text();
          console.log('   - Error response:', errorText);
          
          // Check for specific error patterns
          if (errorText.includes('AccessDenied')) {
            console.log('   - Issue: S3 bucket access denied');
            console.log('   - Solution: Check bucket permissions and IAM policies');
          } else if (errorText.includes('InvalidAccessKeyId')) {
            console.log('   - Issue: Invalid AWS access key');
            console.log('   - Solution: Check AWS_ACCESS_KEY_ID in .env');
          } else if (errorText.includes('SignatureDoesNotMatch')) {
            console.log('   - Issue: Invalid AWS secret key');
            console.log('   - Solution: Check AWS_SECRET_ACCESS_KEY in .env');
          }
        }
      } else {
        console.log('❌ API endpoint failed!');
        const errorText = await response.text();
        console.log('   - Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ Error testing API endpoint:');
      console.log('   - Error:', error.message);
      console.log('   - Make sure the development server is running on localhost:3000');
    }

    // 5. Test direct S3 client
    console.log('\n📋 Step 5: Testing direct S3 client...');
    try {
      const testKey = `debug-test-${Date.now()}.txt`;
      const testContent = 'Direct S3 client test';
      
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
      });

      console.log('📤 Testing direct S3 upload...');
      const result = await s3Client.send(command);
      console.log('✅ Direct S3 upload successful!');
      console.log('   - ETag:', result.ETag);
      console.log('   - VersionId:', result.VersionId);
    } catch (error) {
      console.log('❌ Direct S3 upload failed:');
      console.log('   - Error:', error.message);
      console.log('   - Error code:', error.Code);
      console.log('   - Error name:', error.name);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('   If API endpoint fails: Check if dev server is running');
    console.log('   If S3 upload fails: Check AWS credentials and bucket permissions');
    console.log('   If file access fails: Check bucket CORS and public access settings');

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugS3Upload(); 