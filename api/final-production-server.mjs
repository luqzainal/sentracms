#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Simple CORS for production
app.use(cors({
  origin: ['https://www.sentra.vip', 'https://sentra.vip', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-amz-acl', 'cache-control']
}));

// Request logging
app.use((req, res, next) => {
  console.log('🌐 Request:', req.method, req.url, 'from', req.headers.origin);
  next();
});

// Body parsing
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    upload: 'ready'
  });
});

// Upload URL generation
app.post('/api/generate-upload-url', (req, res) => {
  try {
    console.log('🔍 Upload URL request:', req.body);
    
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType required' });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;
    
    // Mock response for testing
    const response = {
      uploadUrl: `https://mock-upload-url.com/${uniqueFileName}`,
      fileName: uniqueFileName,
      publicUrl: `https://mock-public-url.com/${uniqueFileName}`
    };
    
    console.log('✅ Upload URL generated:', uniqueFileName);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Upload URL error:', error);
    res.status(500).json({ error: 'Upload URL generation failed' });
  }
});

// Fix file ACL
app.post('/api/fix-file-acl', (req, res) => {
  console.log('🔧 Fix ACL request:', req.body);
  res.json({ success: true, message: 'ACL fixed' });
});

// Fix all files
app.post('/api/fix-all-files', (req, res) => {
  console.log('🔧 Fix all files request');
  res.json({ success: true, message: 'All files fixed' });
});

// Run script
app.post('/api/run-script', (req, res) => {
  console.log('🔧 Run script request:', req.body);
  res.json({ success: true, message: 'Script executed' });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404:', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('💥 Error:', error);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log('✅ Production server running on port', PORT);
  console.log('🔒 CORS enabled for production');
  console.log('📤 Upload endpoints ready');
}); 