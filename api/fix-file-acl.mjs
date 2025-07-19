import { S3Client, PutObjectAclCommand } from '@aws-sdk/client-s3';
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

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Get DigitalOcean Spaces credentials from environment variables
    const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
    const SPACES_REGION = process.env.DO_SPACES_REGION;
    const SPACES_KEY = process.env.DO_SPACES_KEY;
    const SPACES_SECRET = process.env.DO_SPACES_SECRET;
    const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

    // Basic validation
    if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
      res.status(500).json({ 
        error: 'File upload not configured. Please set up DigitalOcean Spaces environment variables.',
        details: 'Run "npm run setup-file-upload" for setup instructions.'
      });
      return;
    }

    // Make the endpoint construction more robust
    let endpoint = SPACES_ENDPOINT;
    if (!endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    // Configure the S3 client
    const s3Client = new S3Client({
      endpoint: endpoint,
      region: SPACES_REGION,
      credentials: {
        accessKeyId: SPACES_KEY,
        secretAccessKey: SPACES_SECRET,
      },
    });

    // Get fileName from request body
    const { fileName } = req.body;
    
    if (!fileName) {
      res.status(400).json({ error: 'fileName is required' });
      return;
    }

    console.log('🔧 Fixing ACL for file:', fileName);

    // Fix ACL for the file
    const aclCommand = new PutObjectAclCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ACL: 'public-read',
    });

    await s3Client.send(aclCommand);
    
    console.log('✅ ACL fixed successfully for:', fileName);

    // Return the fixed file URL
    const fileUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${fileName}`;
    
    res.status(200).json({
      success: true,
      message: 'File ACL fixed successfully',
      fileUrl: fileUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ Error fixing file ACL:', error.message);
    res.status(500).json({ 
      error: 'Failed to fix file ACL', 
      details: error.message 
    });
  }
} 