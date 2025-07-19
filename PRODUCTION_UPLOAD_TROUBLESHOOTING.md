# Production Upload Troubleshooting Guide

## 🎯 Masalah: API Return 200 OK Tapi Upload Failed

### **Gejala:**
- API endpoint `/api/generate-upload-url` return 200 OK
- Console log tidak menunjukkan error
- Tapi file upload failed
- Tidak ada error message yang jelas

### **Root Cause Analysis:**

#### **1. Environment Variables Missing**
- `.env` file tidak wujud atau tidak di-load
- DigitalOcean Spaces credentials tidak di-set
- Production environment variables tidak configured

#### **2. Pre-signed URL Issues**
- URL expired atau invalid
- CORS settings tidak betul
- Bucket permissions tidak cukup

#### **3. Upload Process Issues**
- Network timeout
- File size too large
- Content-Type mismatch
- Headers tidak betul

## 🔧 Step-by-Step Troubleshooting

### **Step 1: Check Environment Variables**

```bash
# Check if .env file exists
ls -la .env*

# Check environment variables
echo $DO_SPACES_BUCKET
echo $DO_SPACES_KEY
echo $DO_SPACES_SECRET
echo $DO_SPACES_REGION
```

**Expected Output:**
```
✅ .env file exists
✅ All environment variables are set
```

### **Step 2: Test API Endpoint**

```bash
# Test API endpoint directly
curl -X POST http://localhost:3001/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.txt","fileType":"text/plain"}'
```

**Expected Output:**
```json
{
  "uploadUrl": "https://...",
  "fileName": "1234567890-abc123.txt",
  "publicUrl": "https://mediasentra.sgp1.digitaloceanspaces.com/..."
}
```

### **Step 3: Debug Upload Process**

```bash
# Run comprehensive debug
npm run debug-upload

# Test actual upload
npm run test-actual-upload
```

### **Step 4: Check Browser Console**

1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Try uploading a file**
4. **Look for these logs:**

```
📤 Starting upload for file: test.txt
📋 Upload details: { fileName: "...", fileType: "...", fileSize: 1234 }
🔧 Request headers set
📊 Upload progress: 25%
📊 Upload progress: 50%
📊 Upload progress: 75%
📊 Upload progress: 100%
📤 Upload response received: { status: 200, statusText: "OK" }
✅ Upload successful, processing response...
```

### **Step 5: Check Network Tab**

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Try uploading a file**
4. **Look for these requests:**

#### **Expected Requests:**
1. **POST /api/generate-upload-url** - Status: 200
2. **PUT [pre-signed URL]** - Status: 200

#### **If Requests Fail:**
- Check **Status Code**
- Check **Response Headers**
- Check **Request Headers**
- Check **Response Body**

## 🚨 Common Issues & Solutions

### **Issue 1: Environment Variables Missing**

**Symptoms:**
- API returns 500 error
- "DigitalOcean Spaces configuration missing"

**Solution:**
```bash
# Create .env file
cp .env.example .env

# Set environment variables
DO_SPACES_ENDPOINT=https://mediasentra.sgp1.digitaloceanspaces.com
DO_SPACES_REGION=sgp1
DO_SPACES_KEY=your_spaces_key
DO_SPACES_SECRET=your_spaces_secret
DO_SPACES_BUCKET=mediasentra
```

### **Issue 2: CORS Error**

**Symptoms:**
- Browser console shows CORS error
- Network tab shows failed preflight request

**Solution:**
```bash
# Setup CORS for production
node scripts/setup-production-cors.mjs
```

### **Issue 3: Pre-signed URL Expired**

**Symptoms:**
- Upload fails with 403 Forbidden
- "Request has expired"

**Solution:**
- Increase `expiresIn` in API
- Check server time synchronization

### **Issue 4: Bucket Permissions**

**Symptoms:**
- Upload fails with 403 Forbidden
- "Access Denied"

**Solution:**
```bash
# Fix bucket permissions
node scripts/setup-bucket-policy.js
```

### **Issue 5: File Size Too Large**

**Symptoms:**
- Upload fails with 413 Payload Too Large
- Progress stops at certain percentage

**Solution:**
- Check file size limits
- Implement chunked upload for large files

## 🔍 Advanced Debugging

### **Enable Detailed Logging**

```javascript
// In FileUpload.tsx
console.log('🔍 Detailed upload debug:', {
  file: file.name,
  size: file.size,
  type: file.type,
  uploadUrl: uploadUrl,
  timestamp: new Date().toISOString()
});
```

### **Test Pre-signed URL Manually**

```bash
# Get pre-signed URL
curl -X POST http://localhost:3001/api/generate-upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.txt","fileType":"text/plain"}' \
  | jq -r '.uploadUrl' > upload_url.txt

# Test upload with curl
curl -X PUT -T test.txt \
  -H "Content-Type: text/plain" \
  -H "x-amz-acl: public-read" \
  "$(cat upload_url.txt)"
```

### **Check DigitalOcean Spaces Logs**

1. **Go to DigitalOcean Dashboard**
2. **Navigate to Spaces**
3. **Select your bucket**
4. **Check access logs**

## 📊 Monitoring & Alerts

### **Key Metrics to Monitor:**

1. **Upload Success Rate**
2. **Average Upload Time**
3. **File Size Distribution**
4. **Error Rate by Error Type**
5. **API Response Time**

### **Alert Conditions:**

- Upload success rate < 95%
- Average upload time > 30 seconds
- Error rate > 5%
- API response time > 5 seconds

## 🎯 Quick Fix Checklist

### **Before Deploying to Production:**

- [ ] Environment variables set
- [ ] CORS configured
- [ ] Bucket permissions set
- [ ] API server running
- [ ] Test uploads working
- [ ] Error handling implemented
- [ ] Logging enabled

### **When Upload Fails in Production:**

- [ ] Check environment variables
- [ ] Check API server logs
- [ ] Check browser console
- [ ] Check network tab
- [ ] Test API endpoint directly
- [ ] Verify bucket permissions
- [ ] Check CORS settings

## 🚀 Emergency Fixes

### **If Everything Else Fails:**

1. **Use Direct Upload:**
```bash
npm run quick-fix-files
```

2. **Manual File Fix:**
```bash
node scripts/fix-existing-files-acl.js
```

3. **Reset Upload System:**
```bash
npm run setup-file-upload
```

---

**Remember: Always check the browser console and network tab first!** 🔍 