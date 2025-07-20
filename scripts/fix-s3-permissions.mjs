import { S3Client, PutBucketPolicyCommand, PutBucketCorsCommand, GetBucketPolicyCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function fixS3Permissions() {
  console.log('🔧 Fixing S3 Bucket Permissions...\n');

  try {
    const bucketName = process.env.AWS_S3_BUCKET;
    
    if (!bucketName) {
      console.log('❌ AWS_S3_BUCKET not found in environment variables');
      return;
    }

    console.log(`📋 Working with bucket: ${bucketName}`);

    // 1. Set bucket policy for public read access
    console.log('\n📋 Step 1: Setting bucket policy...');
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

    // 2. Set CORS configuration
    console.log('\n📋 Step 2: Setting CORS configuration...');
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
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

    // 3. Check current bucket policy
    console.log('\n📋 Step 3: Checking current bucket policy...');
    try {
      const getPolicyCommand = new GetBucketPolicyCommand({
        Bucket: bucketName
      });
      
      const policyResponse = await s3Client.send(getPolicyCommand);
      console.log('✅ Current bucket policy:');
      console.log('   - Policy exists:', !!policyResponse.Policy);
      if (policyResponse.Policy) {
        const policy = JSON.parse(policyResponse.Policy);
        console.log('   - Statements:', policy.Statement?.length || 0);
      }
    } catch (error) {
      console.log('❌ No bucket policy found or access denied');
      console.log('   - Error:', error.message);
    }

    // 4. Check current CORS configuration
    console.log('\n📋 Step 4: Checking current CORS configuration...');
    try {
      const getCorsCommand = new GetBucketCorsCommand({
        Bucket: bucketName
      });
      
      const corsResponse = await s3Client.send(getCorsCommand);
      console.log('✅ Current CORS configuration:');
      console.log('   - CORS rules:', corsResponse.CORSConfiguration?.CORSRules?.length || 0);
    } catch (error) {
      console.log('❌ No CORS configuration found or access denied');
      console.log('   - Error:', error.message);
    }

    // 5. Test upload after fixes
    console.log('\n📋 Step 5: Testing upload after fixes...');
    try {
      const testKey = `test-after-fix-${Date.now()}.txt`;
      const testContent = 'Test upload after permission fixes';
      
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
        console.log('   1. Check IAM user permissions');
        console.log('   2. Ensure bucket is not blocking public access');
        console.log('   3. Verify bucket ownership');
      }
    }

    console.log('\n🎯 Permission Fix Summary:');
    console.log('   ✅ CORS configuration updated');
    console.log('   ✅ Bucket policy attempted');
    console.log('   📋 If uploads still fail, check:');
    console.log('      - IAM user has s3:PutObject permission');
    console.log('      - Bucket public access settings');
    console.log('      - Bucket ownership and ACL settings');

  } catch (error) {
    console.error('❌ Error fixing S3 permissions:', error);
  }
}

fixS3Permissions(); 