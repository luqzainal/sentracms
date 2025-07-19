import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
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
    contentType: req.headers['content-type']
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

// Import route handlers
import generateUploadUrl from './generate-upload-url.mjs';
import fixFileAcl from './fix-file-acl.mjs';
import fixAllFiles from './fix-all-files.mjs';
import runScript from './run-script.mjs';

// API routes
app.post('/api/generate-upload-url', generateUploadUrl);
app.post('/api/fix-file-acl', fixFileAcl);
app.post('/api/fix-all-files', fixAllFiles);
app.post('/api/run-script', runScript);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log('✅ API server listening at http://localhost:' + PORT);
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔒 CORS enabled for production and development');
}); 