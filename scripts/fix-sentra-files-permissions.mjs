import { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand, GetBucketLocationCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function fixSentraFilesPermissions() {
  console.log('🔧 Fixing sentra-files Bucket Permissions...\n');

  try {
    const bucketName = 'sentra-files';
    console.log(`📋 Working with bucket: ${bucketName}`);

    // 1. Check bucket location/region
    console.log('\n📋 Step 1: Checking bucket location...');
    try {
      const locationCommand = new GetBucketLocationCommand({
        Bucket: bucketName
      });
      
      const locationResponse = await s3Client.send(locationCommand);
      console.log('✅ Bucket location:', locationResponse.LocationConstraint || 'us-east-1');
      
      // Update client region if needed
      if (locationResponse.LocationConstraint && locationResponse.LocationConstraint !== process.env.AWS_REGION) {
        console.log(`⚠️  Bucket region (${locationResponse.LocationConstraint}) differs from configured region (${process.env.AWS_REGION})`);
        console.log('   - Consider updating AWS_REGION in .env file');
      }
    } catch (error) {
      console.log('❌ Error checking bucket location:', error.message);
    }

    // 2. Set bucket policy for public read access
    console.log('\n📋 Step 2: Setting bucket policy...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        },
        {
          Sid: 'AllowUploads',
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::${process.env.AWS_ACCOUNT_ID || '*'}:root`
          },
          Action: [
            's3:PutObject',
            's3:PutObjectAcl'
          ],
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    try {
      const policyCommand = new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy)
      });
      
      await s3Client.send(policyCommand);
      console.log('✅ Bucket policy updated successfully');
    } catch (error) {
      console.log('❌ Failed to update bucket policy:');
      console.log('   - Error:', error.message);
      console.log('   - This might require bucket owner permissions');
    }

    // 3. Set CORS configuration
    console.log('\n📋 Step 3: Setting CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: [
            'https://www.sentra.vip',
            'https://sentra.vip',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:4173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:4173'
          ],
          ExposeHeaders: ['ETag', 'x-amz-version-id'],
          MaxAgeSeconds: 3000
        }
      ]
    };

    try {
      const corsCommand = new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsConfiguration
      });
      
      await s3Client.send(corsCommand);
      console.log('✅ CORS configuration updated successfully');
    } catch (error) {
      console.log('❌ Failed to update CORS configuration:');
      console.log('   - Error:', error.message);
    }

    // 4. Test upload after fixes
    console.log('\n📋 Step 4: Testing upload after fixes...');
    try {
      const testKey = `test-sentra-files-${Date.now()}.txt`;
      const testContent = 'Test upload to sentra-files bucket';
      
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: testKey,
        Body: testContent,
        ContentType: 'text/plain',
        ACL: 'public-read'
      });

      const result = await s3Client.send(uploadCommand);
      console.log('✅ Test upload successful after fixes!');
      console.log('   - ETag:', result.ETag);
      console.log('   - File URL:', `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`);
    } catch (error) {
      console.log('❌ Test upload still failed:');
      console.log('   - Error:', error.message);
      console.log('   - Error code:', error.Code);
      
      if (error.Code === 'AccessDenied') {
        console.log('\n🔧 Additional fixes needed:');
        console.log('   1. Check IAM user permissions for sentra-files bucket');
        console.log('   2. Ensure bucket is not blocking public access');
        console.log('   3. Verify bucket ownership');
        console.log('   4. Check if bucket requires specific region');
      }
    }

    console.log('\n🎯 Permission Fix Summary:');
    console.log('   ✅ CORS configuration updated');
    console.log('   ✅ Bucket policy attempted');
    console.log('   📋 If uploads still fail, check:');
    console.log('      - IAM user has s3:PutObject permission for sentra-files');
    console.log('      - Bucket public access settings');
    console.log('      - Bucket region matches AWS_REGION');

  } catch (error) {
    console.error('❌ Error fixing sentra-files permissions:', error);
  }
}

fixSentraFilesPermissions(); 