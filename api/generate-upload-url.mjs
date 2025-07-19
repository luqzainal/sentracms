import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple possible .env file locations
const possibleEnvPaths = [
  join(__dirname, '..', '.env'),
  join(__dirname, '..', '.env.local'),
  join(process.cwd(), '.env'),
  join(process.cwd(), '.env.local')
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log(`❌ Failed to load from: ${envPath}`);
  }
}

if (!envLoaded) {
  console.log('⚠️ No .env file found in any of the expected locations');
}

// Environment variables validation
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

// Configure AWS S3 client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// This is the main handler for the serverless function
// Suitable for platforms like Vercel or Netlify
export default async function handler(req, res) {
  try {
    console.log('🔍 Upload URL generation started...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      console.error('❌ Missing fileName or fileType');
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }
    
    console.log('✅ File details validated');
    console.log('   File name:', fileName);
    console.log('   File type:', fileType);
    
    // Validate environment variables
    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
      console.error('❌ Missing AWS S3 environment variables');
      return res.status(500).json({ error: 'AWS S3 configuration missing' });
    }
    
    console.log('✅ Environment variables validated');
    console.log('   Bucket:', AWS_S3_BUCKET);
    console.log('   Region:', AWS_REGION);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    console.log('🆔 Generated unique filename:', uniqueFileName);
    
    // Create S3 upload command
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: uniqueFileName,
      ContentType: fileType,
      CacheControl: 'public, max-age=31536000',
    });
    
    console.log('📤 Creating pre-signed URL...');
    console.log('   Command details:', {
      Bucket: AWS_S3_BUCKET,
      Key: uniqueFileName,
      ContentType: fileType,
      CacheControl: 'public, max-age=31536000'
    });
    
    // Generate pre-signed URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    console.log('✅ Pre-signed URL generated successfully');
    console.log('   URL length:', presignedUrl.length);
    console.log('   URL starts with:', presignedUrl.substring(0, 50) + '...');
    
    // Generate public URL for the file
    const publicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    
    console.log('🔗 Public URL generated:', publicUrl);
    
    const response = {
      uploadUrl: presignedUrl,
      fileName: uniqueFileName,
      publicUrl: publicUrl
    };
    
    console.log('📤 Sending response to client...');
    console.log('   Response keys:', Object.keys(response));
    
    res.status(200).json(response);
    
    console.log('✅ Upload URL generation completed successfully');
    
  } catch (error) {
    console.error('❌ Error generating upload URL:', error);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
}
