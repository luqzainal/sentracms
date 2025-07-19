import { S3Client, ListObjectsV2Command, PutObjectAclCommand } from '@aws-sdk/client-s3';
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

    console.log('🔧 Fixing ACL for all files...');

    // List all files in bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // Get up to 1000 files
    });

    const listResult = await s3Client.send(listCommand);
    const files = listResult.Contents || [];
    
    if (files.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No files to fix ACL for',
        fixedCount: 0,
        totalFiles: 0
      });
      return;
    }

    console.log(`📁 Found ${files.length} files, fixing ACL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Fix ACL for all files
    for (const file of files) {
      if (!file.Key || file.Key.endsWith('/')) continue;
      
      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: BUCKET_NAME,
          Key: file.Key,
          ACL: 'public-read',
        });

        await s3Client.send(aclCommand);
        successCount++;
        
        // Show progress every 10 files
        if (successCount % 10 === 0) {
          console.log(`✅ Fixed ${successCount} files...`);
        }
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to fix ACL for ${file.Key}:`, error.message);
      }
    }
    
    console.log('🎉 ACL fix completed!');
    console.log(`✅ Fixed: ${successCount} files`);
    console.log(`❌ Failed: ${errorCount} files`);
    
    res.status(200).json({
      success: true,
      message: 'ACL fix completed successfully',
      fixedCount: successCount,
      failedCount: errorCount,
      totalFiles: files.length
    });

  } catch (error) {
    console.error('❌ Error fixing all files ACL:', error.message);
    res.status(500).json({ 
      error: 'Failed to fix files ACL', 
      details: error.message 
    });
  }
} 