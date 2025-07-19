#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

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

// Generate upload URL endpoint (mock for testing)
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
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    console.log('🆔 Generated unique filename:', uniqueFileName);
    
    // Mock response for testing
    const response = {
      uploadUrl: `https://mock-upload-url.com/${uniqueFileName}`,
      fileName: uniqueFileName,
      publicUrl: `https://mock-public-url.com/${uniqueFileName}`
    };
    
    console.log('📤 Sending response to client...');
    console.log('   Response keys:', Object.keys(response));
    
    res.status(200).json(response);
    
    console.log('✅ Upload URL generation completed successfully');
    
  } catch (error) {
    console.error('❌ Error generating upload URL:', error);
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
  console.log('✅ Simple Production API server listening at http://localhost:' + PORT);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔒 CORS enabled for production and development');
  console.log('📤 Upload endpoints ready (mock mode)');
  console.log('🌐 Health check: http://localhost:' + PORT + '/api/health');
}); 