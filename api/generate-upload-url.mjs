import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
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

// This is the main handler for the serverless function
// Suitable for platforms like Vercel or Netlify
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    console.log('ENV DEBUG:', {
      DO_SPACES_KEY: process.env.DO_SPACES_KEY,
      DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
      DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
      DO_SPACES_REGION: process.env.DO_SPACES_REGION,
      DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    });

    // Get DigitalOcean Spaces credentials from environment variables
    const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
    const SPACES_REGION = process.env.DO_SPACES_REGION;
    const SPACES_KEY = process.env.DO_SPACES_KEY;
    const SPACES_SECRET = process.env.DO_SPACES_SECRET;
    const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

    // Basic validation to ensure environment variables are set
    if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
      console.error("Missing DigitalOcean Spaces environment variables.");
      console.error("Please run: npm run setup-file-upload");
      // Send a more helpful error message
      res.status(500).json({ 
        error: 'File upload not configured. Please set up DigitalOcean Spaces environment variables.',
        details: 'Run "npm run setup-file-upload" for setup instructions.',
        missingVars: {
          DO_SPACES_ENDPOINT: !SPACES_ENDPOINT,
          DO_SPACES_REGION: !SPACES_REGION,
          DO_SPACES_KEY: !SPACES_KEY,
          DO_SPACES_SECRET: !SPACES_SECRET,
          DO_SPACES_BUCKET: !BUCKET_NAME
        }
      });
      return;
    }

    // Make the endpoint construction more robust
    let endpoint = SPACES_ENDPOINT;
    if (!endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    console.log('🔧 S3 Client Configuration:', {
      endpoint,
      region: SPACES_REGION,
      hasKey: !!SPACES_KEY,
      hasSecret: !!SPACES_SECRET,
      bucket: BUCKET_NAME
    });

    // Configure the S3 client for DigitalOcean Spaces INSIDE the handler
    const s3Client = new S3Client({
      endpoint: endpoint,
      region: SPACES_REGION,
      credentials: {
        accessKeyId: SPACES_KEY,
        secretAccessKey: SPACES_SECRET,
      },
    });

    console.log('✅ S3 Client created successfully');

    // Ambil nama file dan tipe file dari body request
    const { fileName, fileType } = req.body;
    
    console.log('📁 File Upload Request:', { fileName, fileType });
    
    if (!fileName || !fileType) {
      res.status(400).json({ error: 'fileName and fileType are required' });
      return;
    }

    // Buat nama file yang unik untuk menghindari penimpaan file
    const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;
    console.log('🆔 Generated unique filename:', uniqueFileName);

    // Buat perintah untuk mengunggah file
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      ACL: 'public-read', // File akan bisa diakses publik setelah diunggah
    });

    console.log('📋 PutObjectCommand created:', {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType
    });

    // Buat URL unggahan yang sudah ditandatangani (pre-signed URL)
    // URL ini berlaku selama 60 detik
    console.log('🔗 Generating signed URL...');
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    console.log('✅ Signed URL generated successfully');

    // URL of the file after upload, to be stored in the database
    // Construct the correct file URL with bucket name
    const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${uniqueFileName}`;
    
    console.log('🔗 Generated URLs:', {
      uploadUrl: uploadUrl.substring(0, 100) + '...',
      fileUrl: fileUrl
    });
    
    res.status(200).json({
      uploadUrl: uploadUrl,
      fileUrl: fileUrl,
    });

  } catch (error) {
    console.error('--- DETAILED UPLOAD ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Full Error Object:', error);
    console.error('--- END OF ERROR ---');
    res.status(500).json({ error: 'Failed to create upload URL', details: error.message });
  }
}
