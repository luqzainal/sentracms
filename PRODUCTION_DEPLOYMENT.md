# Production Deployment Guide for Sentra.vip

## 🚀 Overview

This guide explains how to deploy the Sentra CMS application to production at https://www.sentra.vip/

## 📋 Prerequisites

1. **Domain**: https://www.sentra.vip/ (already configured)
2. **DigitalOcean Spaces**: Already configured for file storage
3. **Neon Database**: Already configured
4. **Environment Variables**: Must be set on production server

## 🔧 Environment Variables Required

Create a `.env` file on your production server with these variables:

```env
# Database
VITE_NEON_DATABASE_URL=your_neon_database_url

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://mediasentra.sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_BUCKET=mediasentra

# Demo Users (optional)
VITE_DEMO_ADMIN_EMAIL=superadmin@sentra.com
VITE_DEMO_ADMIN_PASSWORD=password123
VITE_DEMO_ADMIN_NAME=Super Admin
VITE_DEMO_CLIENT_EMAIL=client@demo.com
VITE_DEMO_CLIENT_PASSWORD=client123
VITE_DEMO_CLIENT_NAME=Demo Client
```

## 🏗️ Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Start the API Server

The API server is required for file uploads. Run it on your production server:

```bash
# Start API server (runs on port 3001)
npm run start-api
```

### 3. Serve the Frontend

```bash
# Serve the built application (runs on port 8080)
npm run start
```

## 🔄 Production Setup Scripts

Run these scripts to configure production:

```bash
# Setup CORS for production domain
node scripts/setup-production-cors.mjs

# Fix file permissions
node scripts/fix-existing-files-acl.mjs

# Test production upload
node scripts/test-production-upload.mjs
```

## 🌐 Production URLs

- **Frontend**: https://www.sentra.vip/
- **API Server**: https://www.sentra.vip:3001/ (or configure reverse proxy)
- **File Upload API**: https://www.sentra.vip/api/generate-upload-url

## 🔧 Reverse Proxy Configuration (Recommended)

For better production setup, configure a reverse proxy (nginx/apache) to:

1. **Serve frontend** on port 80/443
2. **Proxy API requests** to port 3001
3. **Handle SSL certificates**

### Nginx Example Configuration

```nginx
server {
    listen 80;
    server_name www.sentra.vip sentra.vip;
    
    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testing Production

### 1. Test File Upload

```bash
# Test production API
node scripts/test-production-api.mjs
```

### 2. Test Database Connection

```bash
# Test database
npm run db:test
```

### 3. Manual Testing

1. Visit https://www.sentra.vip/
2. Login with demo credentials
3. Go to a client profile
4. Try uploading a file
5. Verify file appears in attachments

## 🚨 Troubleshooting

### Upload Failed Error

**Problem**: File upload fails on production

**Solutions**:
1. Check if API server is running: `npm run start-api`
2. Verify environment variables are set
3. Check production server logs
4. Test API endpoint: `node scripts/test-production-api.mjs`

### CORS Error

**Problem**: CORS policy blocks uploads

**Solutions**:
1. Run: `node scripts/setup-production-cors.mjs`
2. Verify domain is in allowed origins
3. Check browser console for CORS errors

### File Access Denied

**Problem**: Uploaded files show "Access Denied"

**Solutions**:
1. Run: `node scripts/fix-existing-files-acl.mjs`
2. Verify bucket policy allows public read
3. Check file URLs are correct

## 📊 Monitoring

### Check Server Status

```bash
# Check if processes are running
ps aux | grep node

# Check ports in use
netstat -tlnp | grep :3001
netstat -tlnp | grep :8080
```

### View Logs

```bash
# API server logs
tail -f logs/api.log

# Application logs
tail -f logs/app.log
```

## 🔒 Security Considerations

1. **Environment Variables**: Keep sensitive data in `.env` file
2. **API Keys**: Rotate DigitalOcean Spaces keys regularly
3. **Database**: Use strong passwords for database access
4. **SSL**: Enable HTTPS for production
5. **Firewall**: Restrict access to necessary ports only

## 📞 Support

If you encounter issues:

1. Check server logs for error messages
2. Run diagnostic scripts provided
3. Verify all environment variables are set
4. Test each component individually

## ✅ Success Checklist

- [ ] Environment variables configured
- [ ] Application built successfully
- [ ] API server running on port 3001
- [ ] Frontend served on port 8080
- [ ] CORS policy updated for production
- [ ] File permissions fixed
- [ ] Database connection working
- [ ] File uploads working
- [ ] SSL certificate configured (recommended)
- [ ] Reverse proxy configured (recommended) 