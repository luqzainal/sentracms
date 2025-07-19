# 🚀 Migrate dari DigitalOcean Spaces ke AWS S3

## 📋 **Migration Steps**

### **Step 1: Setup AWS S3 Bucket**

1. **Login ke AWS Console**
2. **Create S3 Bucket:**
   - Bucket name: `sentra-cms-files` (atau nama yang anda suka)
   - Region: `ap-southeast-1` (Singapore)
   - Block all public access: **Uncheck** (untuk public file access)
   - Versioning: Optional
   - Encryption: Default

3. **Configure Bucket Policy untuk Public Access:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sentra-cms-files/*"
        }
    ]
}
```

4. **Configure CORS:**
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://www.sentra.vip",
            "https://sentra.vip",
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

### **Step 2: Create AWS IAM User**

1. **Go to IAM Console**
2. **Create User:**
   - Username: `sentra-cms-upload`
   - Access type: Programmatic access

3. **Attach Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::sentra-cms-files",
                "arn:aws:s3:::sentra-cms-files/*"
            ]
        }
    ]
}
```

4. **Save Access Key ID dan Secret Access Key**

### **Step 3: Update Environment Variables**

**Update `.env` file:**
```bash
# Remove DigitalOcean Spaces variables
# DO_SPACES_KEY=...
# DO_SPACES_SECRET=...
# DO_SPACES_BUCKET=...
# DO_SPACES_REGION=...

# Add AWS S3 variables
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=sentra-cms-files
```

### **Step 4: Update Production Server**

Server sudah di-update untuk menggunakan AWS S3. Check `api/final-production-server.mjs`.

### **Step 5: Test Migration**

```bash
# Test AWS S3 upload
npm run test-aws-upload

# Test production server
npm run start-production
```

## 🔧 **AWS S3 Configuration**

### **Bucket Settings:**
- **Name:** `sentra-cms-files`
- **Region:** `ap-southeast-1` (Singapore)
- **Public Access:** Enabled
- **CORS:** Configured for web uploads
- **Versioning:** Optional

### **IAM Permissions:**
- **PutObject:** Upload files
- **PutObjectAcl:** Set public access
- **GetObject:** Download files
- **DeleteObject:** Remove files
- **ListBucket:** List files

### **CORS Configuration:**
- **Allowed Origins:** Production domains + localhost
- **Allowed Methods:** GET, PUT, POST, DELETE, HEAD
- **Allowed Headers:** All headers
- **Expose Headers:** ETag

## 🎯 **Benefits of AWS S3:**

1. **Better Integration:** Native AWS SDK support
2. **Global CDN:** CloudFront integration available
3. **Better Pricing:** Pay per use model
4. **More Features:** Versioning, lifecycle policies, etc.
5. **Better Documentation:** Extensive AWS documentation

## 🚀 **Next Steps:**

1. **Setup AWS S3 bucket** dengan settings di atas
2. **Create IAM user** dengan permissions yang betul
3. **Update `.env` file** dengan AWS credentials
4. **Test upload** menggunakan new server
5. **Deploy ke production**

## 📊 **Cost Comparison:**

### **DigitalOcean Spaces:**
- $5/month untuk 250GB
- Additional storage: $0.02/GB

### **AWS S3:**
- Storage: $0.023/GB/month
- Requests: $0.0004 per 1,000 requests
- Data transfer: $0.09/GB (outbound)

**Untuk 250GB usage:**
- DO Spaces: $5/month
- AWS S3: ~$5.75/month + requests

**AWS S3 lebih cost-effective untuk low usage!** 