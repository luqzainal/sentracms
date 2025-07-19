const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.main = async (args) => {
  try {
    console.log('🔍 Upload URL request:', args);
    
    const { fileName, fileType } = args;
    
    if (!fileName || !fileType) {
      return {
        statusCode: 400,
        body: { error: 'fileName and fileType required' }
      };
    }
    
    // Validate environment variables
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET) {
      console.error('❌ Missing AWS S3 environment variables');
      return {
        statusCode: 500,
        body: { error: 'AWS S3 configuration missing' }
      };
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Create S3 upload command
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: uniqueFileName,
      ContentType: fileType,
      CacheControl: 'public, max-age=31536000',
    });
    
    // Generate pre-signed URL for upload
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Generate public URL
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    
    const response = {
      uploadUrl: presignedUrl,
      fileName: uniqueFileName,
      publicUrl: publicUrl
    };
    
    console.log('✅ Upload URL generated:', uniqueFileName);
    console.log('   Public URL:', publicUrl);
    
    return {
      statusCode: 200,
      body: response
    };
    
  } catch (error) {
    console.error('❌ Upload URL error:', error);
    return {
      statusCode: 500,
      body: { error: 'Upload URL generation failed', details: error.message }
    };
  }
}; 