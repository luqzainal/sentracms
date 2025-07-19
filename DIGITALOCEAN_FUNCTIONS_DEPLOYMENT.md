# 🚀 DigitalOcean Functions Deployment Guide

## ✅ **Alternative: Serverless Functions**

Instead of App Platform, kita boleh guna **DigitalOcean Functions** yang lebih cost-effective dan simple!

---

## 📋 **Benefits of Functions vs App Platform:**

### **✅ Functions (Recommended):**
- **💰 Cost:** Pay per execution (very cheap)
- **⚡ Speed:** Fast cold start
- **🔧 Simple:** No server management
- **📊 Scaling:** Automatic scaling
- **🛠️ Maintenance:** No server maintenance

### **❌ App Platform:**
- **💰 Cost:** Pay for 24/7 server
- **⚡ Speed:** Slower startup
- **🔧 Complex:** Server management needed
- **📊 Scaling:** Manual scaling
- **🛠️ Maintenance:** Server maintenance required

---

## 🚀 **Deploy to DigitalOcean Functions**

### **Step 1: Install doctl CLI**
```bash
# Download doctl from: https://docs.digitalocean.com/reference/doctl/how-to/install/
# Or use package manager
```

### **Step 2: Authenticate**
```bash
doctl auth init
```

### **Step 3: Create Function**
```bash
# Navigate to functions directory
cd functions

# Create function
doctl serverless deploy .
```

### **Step 4: Set Environment Variables**
```bash
doctl serverless fn env set generate-upload-url AWS_ACCESS_KEY_ID your_aws_access_key
doctl serverless fn env set generate-upload-url AWS_SECRET_ACCESS_KEY your_aws_secret_key
doctl serverless fn env set generate-upload-url AWS_REGION ap-southeast-1
doctl serverless fn env set generate-upload-url AWS_S3_BUCKET sentra-test
```

### **Step 5: Get Function URL**
```bash
doctl serverless fn list
```

---

## 🔧 **Update Frontend for Functions**

### **Function URL Format:**
```
https://api.digitalocean.com/v2/functions/namespaces/YOUR_NAMESPACE/actions/generate-upload-url
```

### **Update API Calls:**
```typescript
// Instead of App Platform URL
const res = await fetch('https://sentra-api-app-sxdm6.ondigitalocean.app/api/generate-upload-url', {

// Use Functions URL
const res = await fetch('https://api.digitalocean.com/v2/functions/namespaces/YOUR_NAMESPACE/actions/generate-upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileName, fileType })
});
```

---

## 🧪 **Test Functions**

### **Test Function:**
```bash
doctl serverless fn invoke generate-upload-url -p fileName=test.pdf -p fileType=application/pdf
```

### **Expected Response:**
```json
{
  "uploadUrl": "https://sentra-test.s3.ap-southeast-1.amazonaws.com/...",
  "fileName": "1234567890-abc123.pdf",
  "publicUrl": "https://sentra-test.s3.ap-southeast-1.amazonaws.com/1234567890-abc123.pdf"
}
```

---

## 💰 **Cost Comparison**

### **Functions (Serverless):**
- **Free Tier:** 90,000 GB-seconds/month
- **Paid:** $0.00001667 per GB-second
- **Typical Cost:** ~$1-5/month untuk upload function

### **App Platform:**
- **Basic Plan:** $5/month minimum
- **Standard Plan:** $12/month minimum
- **Always running** regardless of usage

---

## 🎯 **Migration Steps**

### **Option 1: Keep App Platform (Current)**
- ✅ Already working
- ✅ No changes needed
- ❌ Higher cost

### **Option 2: Migrate to Functions (Recommended)**
- ✅ Lower cost
- ✅ Better performance
- ✅ Simpler maintenance
- ⚠️ Need to update frontend URLs

---

## 📞 **Recommendation**

**Untuk project ni, saya recommend guna Functions kerana:**

1. **💰 Cost-effective** - Pay per use instead of 24/7 server
2. **⚡ Better performance** - Fast response times
3. **🔧 Simpler** - No server management
4. **📊 Auto-scaling** - Handles traffic automatically

**Mahu migrate ke Functions atau kekal dengan App Platform?** 