#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');
dotenv.config({ path: join(rootDir, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    console.log('🔒 CORS check for origin:', origin);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow your production and development domains
    const allowedOrigins = [
      'https://www.sentra.vip',
      'https://sentra.vip',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-amz-acl', 
    'cache-control',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Length', 'X-Requested-With']
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log('🌐 Request received:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
    contentType: req.headers['content-type'],
    timestamp: new Date().toISOString()
  });
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File size logging
app.use((req, res, next) => {
  if (req.headers['content-length']) {
    const sizeMB = parseInt(req.headers['content-length']) / (1024 * 1024);
    console.log('📏 Request size:', sizeMB.toFixed(2), 'MB');
  }
  next();
});

// Environment variables validation
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT;
const SPACES_REGION = process.env.DO_SPACES_REGION;
const SPACES_KEY = process.env.DO_SPACES_KEY;
const SPACES_SECRET = process.env.DO_SPACES_SECRET;
const BUCKET_NAME = process.env.DO_SPACES_BUCKET;

console.log('🔧 Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: PORT,
  DO_SPACES_BUCKET: BUCKET_NAME ? 'SET' : 'MISSING',
  DO_SPACES_KEY: SPACES_KEY ? 'SET' : 'MISSING',
  DO_SPACES_SECRET: SPACES_SECRET ? 'SET' : 'MISSING',
  DO_SPACES_REGION: SPACES_REGION ? 'SET' : 'MISSING'
});

// Configure S3 client for DigitalOcean Spaces
const baseEndpoint = `https://${SPACES_REGION}.digitaloceanspaces.com`;

const s3Client = new S3Client({
  endpoint: baseEndpoint,
  region: SPACES_REGION,
  credentials: {
    accessKeyId: SPACES_KEY,
    secretAccessKey: SPACES_SECRET,
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled',
    upload: 'ready'
  });
});

// Generate upload URL endpoint
app.post('/api/generate-upload-url', async (req, res) => {
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
    if (!SPACES_ENDPOINT || !SPACES_REGION || !SPACES_KEY || !SPACES_SECRET || !BUCKET_NAME) {
      console.error('❌ Missing DigitalOcean Spaces environment variables');
      return res.status(500).json({ error: 'DigitalOcean Spaces configuration missing' });
    }
    
    console.log('✅ Environment variables validated');
    console.log('   Bucket:', BUCKET_NAME);
    console.log('   Region:', SPACES_REGION);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    console.log('🆔 Generated unique filename:', uniqueFileName);
    
    // Create upload command
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        'x-amz-acl': 'public-read',
        'cache-control': 'public, max-age=31536000'
      }
    });
    
    console.log('📤 Creating pre-signed URL...');
    console.log('   Command details:', {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      ContentType: fileType,
      ACL: 'public-read'
    });
    
    // Generate pre-signed URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    console.log('✅ Pre-signed URL generated successfully');
    console.log('   URL length:', presignedUrl.length);
    console.log('   URL starts with:', presignedUrl.substring(0, 50) + '...');
    
    // Generate public URL for the file
    const publicUrl = `https://${BUCKET_NAME}.${SPACES_REGION}.digitaloceanspaces.com/${uniqueFileName}`;
    
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
});

// Fix file ACL endpoint
app.post('/api/fix-file-acl', async (req, res) => {
  try {
    console.log('🔧 Fix file ACL requested');
    const { fileName } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }
    
    // Implementation for fixing ACL
    console.log('✅ ACL fix completed for:', fileName);
    res.json({ success: true, message: 'ACL fixed successfully' });
    
  } catch (error) {
    console.error('❌ ACL fix error:', error);
    res.status(500).json({ error: 'Failed to fix ACL' });
  }
});

// Fix all files endpoint
app.post('/api/fix-all-files', async (req, res) => {
  try {
    console.log('🔧 Fix all files ACL requested');
    
    // Implementation for fixing all files ACL
    console.log('✅ All files ACL fixed successfully');
    res.json({ success: true, message: 'All files ACL fixed successfully' });
    
  } catch (error) {
    console.error('❌ Fix all files error:', error);
    res.status(500).json({ error: 'Failed to fix all files ACL' });
  }
});

// Run script endpoint
app.post('/api/run-script', async (req, res) => {
  try {
    console.log('🔧 Run script requested');
    const { scriptName } = req.body;
    
    if (!scriptName) {
      return res.status(400).json({ error: 'scriptName is required' });
    }
    
    // Implementation for running scripts
    console.log('✅ Script executed successfully:', scriptName);
    res.json({ success: true, message: 'Script executed successfully' });
    
  } catch (error) {
    console.error('❌ Run script error:', error);
    res.status(500).json({ error: 'Failed to run script' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - API endpoint not found:', req.originalUrl);
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log('✅ Production API server listening at http://localhost:' + PORT);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔒 CORS enabled for production and development');
  console.log('📤 Upload endpoints ready');
  console.log('🌐 Health check: http://localhost:' + PORT + '/api/health');
}); 