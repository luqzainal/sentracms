#!/usr/bin/env node

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Simple CORS
app.use(cors());

// Simple middleware
app.use((req, res, next) => {
  console.log('🌐 Request:', req.method, req.url);
  next();
});

// Health endpoint
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint
app.post('/api/test', (req, res) => {
  console.log('✅ Test endpoint requested');
  res.json({ message: 'Test successful' });
});

app.listen(PORT, () => {
  console.log('✅ Simple test server running on http://localhost:' + PORT);
  console.log('🔧 Test with: curl http://localhost:3001/api/health');
}); 