import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Konfigurasi Klien S3 untuk DigitalOcean Spaces
// Variabel ini HARUS diatur di environment tempat Anda mendeploy
const s3Client = new S3Client({
  endpoint: `https://sfo3.digitaloceanspaces.com`, // Ganti 'sfo3' dengan region Spaces Anda
  region: 'us-east-1', // Ini adalah nilai placeholder, S3 SDK membutuhkannya
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
  },
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET_NAME;

// Ini adalah handler utama untuk serverless function
// Cocok untuk platform seperti Vercel atau Netlify
export default async function handler(req, res) {
  // Hanya izinkan metode POST
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

    // Kirim URL kembali ke frontend
    res.status(200).json({
      uploadUrl: uploadUrl,
      // URL file setelah diunggah, untuk disimpan di database
      fileUrl: `https://${BUCKET_NAME}.${s3Client.config.endpoint.split('//')[1]}/${uniqueFileName}`,
    });

  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    res.status(500).json({ error: 'Failed to create upload URL' });
  }
}
