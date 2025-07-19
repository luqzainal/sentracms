# 🚀 DigitalOcean API Server Deployment Guide

## ✅ **Status: GitHub Repository Ready**

API server sudah berjaya push ke: `https://github.com/luqzainal/sentra-api.git`

---

## 📋 **Step-by-Step DigitalOcean Deployment**

### **Step 1: Access DigitalOcean**
1. **Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. **Login** dengan account anda
3. **Click "Apps"** dalam left sidebar

### **Step 2: Create New App**
1. **Click "Create App"** button
2. **Choose "GitHub"** sebagai source
3. **Connect GitHub** jika belum connect
4. **Select repository:** `luqzainal/sentra-api`
5. **Choose branch:** `main`
6. **Click "Next"**

### **Step 3: Configure App Settings**
1. **App Name:** `sentra-api`
2. **Environment:** `Node.js`
3. **Build Command:** `npm install`
4. **Run Command:** `npm start`
5. **Port:** `3001`
6. **Click "Next"**

### **Step 4: Set Environment Variables**
Add these variables dalam "Environment Variables" section:

```
Key: AWS_ACCESS_KEY_ID
Value: your_aws_access_key_here
Scope: Run

Key: AWS_SECRET_ACCESS_KEY
Value: your_aws_secret_key_here
Scope: Run

Key: AWS_REGION
Value: ap-southeast-1
Scope: Run

Key: AWS_S3_BUCKET
Value: sentra-test
Scope: Run

Key: NODE_ENV
Value: production
Scope: Run
```

**⚠️ Important:** Replace `your_aws_access_key_here` dan `your_aws_secret_key_here` dengan actual AWS credentials!

### **Step 5: Deploy**
1. **Click "Create Resources"**
2. **Wait for deployment** (biasanya 2-3 minit)
3. **Copy the app URL** (e.g., `https://sentra-api-xxxxx.ondigitalocean.app`)

---

## 🧪 **Test Deployment**

### **Test 1: Health Check**
```bash
curl https://sentra-api-xxxxx.ondigitalocean.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX...",
  "cors": "enabled",
  "upload": "ready"
}
```

### **Test 2: Upload URL Generation**
```bash
curl -X POST https://sentra-api-xxxxx.ondigitalocean.app/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf"}'
```

**Expected Response:**
```json
{
  "uploadUrl": "https://sentra-test.s3.ap-southeast-1.amazonaws.com/...",
  "fileName": "1234567890-abc123.pdf",
  "publicUrl": "https://sentra-test.s3.ap-southeast-1.amazonaws.com/1234567890-abc123.pdf"
}
```

---

## 🔧 **Troubleshooting**

### **Issue: Build Fails**
**Check:**
- Environment variables sudah set dengan betul
- AWS credentials valid
- Repository access permissions

### **Issue: Runtime Errors**
**Check DigitalOcean logs:**
1. **Go to App Dashboard**
2. **Click "Runtime Logs"**
3. **Look for error messages**

### **Issue: CORS Errors**
**Solution:** CORS sudah configure untuk domain production dalam server code.

---

## 🎯 **Expected Result**

Selepas deployment berjaya:

1. ✅ **API Server URL:** `https://sentra-api-xxxxx.ondigitalocean.app`
2. ✅ **Health Check:** Returns JSON response
3. ✅ **Upload URL Generation:** Returns valid S3 URLs
4. ✅ **CORS:** Allows requests from `https://www.sentra.vip`

---

## 📞 **Next Steps After Deployment**

1. **Copy API Server URL** dari DigitalOcean dashboard
2. **Update Frontend** untuk guna API server URL
3. **Test Upload** dalam production
4. **Monitor Logs** untuk any errors

---

**🚀 Ready to deploy! Follow the steps above to get your API server running on DigitalOcean.** 