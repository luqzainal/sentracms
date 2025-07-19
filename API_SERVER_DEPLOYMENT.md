# API Server Deployment Guide

## 🚀 Deploy API Server to DigitalOcean App Platform

### **Masalah Semasa:**
- Frontend di `https://www.sentra.vip` tidak dapat upload file
- API server tidak deployed ke production
- Frontend cuba call `/api/generate-upload-url` tetapi tidak ada server

### **Penyelesaian:**
Deploy API server sebagai separate app di DigitalOcean App Platform.

---

## 📋 Step 1: Prepare API Server

### **1.1 Create API Server Directory**
```bash
mkdir sentra-api
cd sentra-api
```

### **1.2 Copy API Files**
Copy files dari `api/` folder ke `sentra-api/`:
- `final-production-server.mjs` → `server.mjs`
- `package.json` (create new)
- `.env` (create new)

### **1.3 Create package.json**
```json
{
  "name": "sentra-api",
  "version": "1.0.0",
  "type": "module",
  "main": "server.mjs",
  "scripts": {
    "start": "node server.mjs",
    "dev": "node server.mjs"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@aws-sdk/client-s3": "^3.450.0",
    "@aws-sdk/s3-request-presigner": "^3.450.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### **1.4 Create .env**
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sentra-test

# Server Configuration
PORT=3001
NODE_ENV=production
```

---

## 📋 Step 2: Deploy to DigitalOcean

### **2.1 Create New App**
1. **Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. **Click "Apps" → "Create App"**
3. **Choose "GitHub" as source**
4. **Select repository: `sentra-api`**
5. **Choose branch: `main`**

### **2.2 Configure App Settings**
1. **App Name:** `sentra-api`
2. **Environment:** `Node.js`
3. **Build Command:** `npm install`
4. **Run Command:** `npm start`
5. **Port:** `3001`

### **2.3 Set Environment Variables**
Add these environment variables:

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sentra-test
NODE_ENV=production
```

### **2.4 Deploy**
Click "Create Resources" and wait for deployment.

---

## 📋 Step 3: Update Frontend Configuration

### **3.1 Update API Base URL**
Dalam frontend code, update semua API calls untuk guna API server URL:

```typescript
// Instead of relative paths like /api/generate-upload-url
// Use absolute URL to API server
const API_BASE_URL = 'https://sentra-api-xxxxx.ondigitalocean.app';

const res = await fetch(`${API_BASE_URL}/api/generate-upload-url`, {
  // ... rest of the code
});
```

### **3.2 Files to Update:**
- `src/components/common/FileUpload.tsx`
- `src/components/Clients/EditPaymentModal.tsx`
- `src/components/Clients/AddPaymentModal.tsx`
- `src/components/Clients/ClientProgressTracker.tsx`

---

## 📋 Step 4: Test Deployment

### **4.1 Test API Server**
```bash
# Test health check
curl https://sentra-api-xxxxx.ondigitalocean.app/api/health

# Test upload URL generation
curl -X POST https://sentra-api-xxxxx.ondigitalocean.app/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf"}'
```

### **4.2 Test Frontend Upload**
1. **Go to** `https://www.sentra.vip`
2. **Try upload file** dalam payment modal
3. **Check browser console** untuk errors
4. **Verify file upload** ke S3

---

## 🔧 Troubleshooting

### **Issue: CORS Errors**
**Solution:** Update CORS configuration dalam API server:

```javascript
app.use(cors({
  origin: [
    'https://www.sentra.vip',
    'https://sentra.vip',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### **Issue: Environment Variables Missing**
**Solution:** Check DigitalOcean environment variables:
1. **Go to App Settings**
2. **Environment Variables section**
3. **Verify all AWS variables are set**

### **Issue: S3 Upload Fails**
**Solution:** Check AWS credentials and bucket permissions:
1. **Verify AWS credentials** are correct
2. **Check bucket exists** in specified region
3. **Verify bucket permissions** allow uploads

---

## 🎯 Expected Results

After successful deployment:

1. ✅ **API Server:** `https://sentra-api-xxxxx.ondigitalocean.app/api/health` returns JSON
2. ✅ **Upload URL Generation:** Returns valid S3 pre-signed URLs
3. ✅ **Frontend Upload:** Files upload successfully to S3
4. ✅ **Receipt Viewing:** Receipts display correctly in payment modals

---

## 📞 Next Steps

1. **Deploy API server** following this guide
2. **Update frontend** to use API server URL
3. **Test upload functionality** in production
4. **Monitor logs** for any errors
5. **Set up monitoring** and alerts

---

**Need Help?** Check the API server logs in DigitalOcean dashboard for specific error messages. 