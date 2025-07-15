import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Get DigitalOcean Spaces credentials from environment variables
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

// Basic validation to ensure environment variables are set
if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
  throw new Error("DigitalOcean Spaces environment variables are not fully configured.");
}

// Configure the S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: `https://${SPACES_ENDPOINT}`,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

// This is the main handler for the serverless function
// Suitable for platforms like Vercel or Netlify
export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    // Ambil nama file dan tipe file dari body request
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      res.status(400).json({ error: 'fileName and fileType are required' });
      return;
    }

    // Buat nama file yang unik untuk menghindari penimpaan file
    const uniqueFileName = `${crypto.randomUUID()}-${fileName}`;

    // Buat perintah untuk mengunggah file
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      ACL: 'public-read', // File akan bisa diakses publik setelah diunggah
    });

    // Buat URL unggahan yang sudah ditandatangani (pre-signed URL)
    // URL ini berlaku selama 60 detik
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // URL of the file after upload, to be stored in the database
    res.status(200).json({
      uploadUrl: uploadUrl,
      fileUrl: `https://${BUCKET_NAME}.${SPACES_ENDPOINT}/${uniqueFileName}`,
    });

  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    res.status(500).json({ error: 'Failed to create upload URL' });
  }
}
