# 🔄 Tukar ke AWS S3 Akaun Baru

## 📋 **Masalah Semasa**
- Sistem masih upload ke storage lama (DigitalOcean Spaces atau AWS S3 lama)
- Anda sudah setup AWS S3 dengan akaun baru
- Perlu tukar konfigurasi ke akaun AWS S3 yang baru

---

## 🚀 **Langkah Penyelesaian**

### **Step 1: Setup File .env**

Jalankan script untuk setup file `.env`:

```bash
npm run setup-new-aws-s3
```

Script ini akan:
- Check jika file `.env` sudah wujud
- Jika tidak wujud, buat template baru
- Jika sudah wujud, tunjukkan konfigurasi semasa

### **Step 2: Edit File .env**

Edit file `.env` dan isi dengan credentials AWS S3 akaun baru:

```env
# AWS S3 Configuration - Akaun Baru
AWS_ACCESS_KEY_ID=your_new_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_new_aws_secret_key_here
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=your_new_s3_bucket_name

# Server Configuration
PORT=3001
NODE_ENV=production
```

**⚠️ Important:** Ganti nilai-nilai berikut:
- `your_new_aws_access_key_here` → Access Key ID dari akaun AWS baru
- `your_new_aws_secret_key_here` → Secret Access Key dari akaun AWS baru  
- `your_new_s3_bucket_name` → Nama bucket S3 yang baru

### **Step 3: Test Konfigurasi Baru**

Jalankan test untuk verify konfigurasi:

```bash
npm run test-new-aws-s3
```

Test ini akan:
- ✅ Verify AWS S3 connection
- ✅ Check jika bucket wujud
- ✅ Test file upload
- ✅ Test pre-signed URL generation

### **Step 4: Restart Server**

Jika test berjaya, restart server:

```bash
# Untuk development
npm run start-api

# Untuk production
npm run start-production
```

---

## 🔧 **AWS S3 Bucket Setup**

### **Bucket Requirements:**
1. **Public Access:** Enabled (untuk file access)
2. **CORS Configuration:** Untuk web uploads
3. **Bucket Policy:** Untuk public read access

### **CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "https://www.sentra.vip",
            "https://sentra.vip",
            "http://localhost:3000",
            "http://localhost:5173"
        ],
        "ExposeHeaders": ["ETag"]
    }
]
```

### **Bucket Policy:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

---

## 🧪 **Testing**

### **Test 1: Environment Variables**
```bash
npm run setup-new-aws-s3
```

### **Test 2: AWS S3 Connection**
```bash
npm run test-new-aws-s3
```

### **Test 3: File Upload**
1. Start server: `npm run start-api`
2. Upload file melalui frontend
3. Check jika file muncul dalam bucket baru

---

## 🚨 **Troubleshooting**

### **Error: "Missing AWS S3 environment variables"**
- Pastikan file `.env` wujud
- Pastikan semua variables diisi dengan betul
- Jalankan: `npm run setup-new-aws-s3`

### **Error: "AccessDenied"**
- Check AWS credentials
- Pastikan IAM user ada permission untuk S3
- Check bucket name dan region

### **Error: "NoSuchBucket"**
- Pastikan bucket wujud dalam region yang betul
- Check bucket name spelling
- Pastikan bucket dalam akaun AWS yang betul

### **File masih upload ke storage lama**
- Restart server selepas edit `.env`
- Check jika server load `.env` file yang betul
- Verify environment variables dalam server logs

---

## 📞 **Support**

Jika masih ada masalah:

1. **Check server logs** untuk error messages
2. **Verify AWS credentials** dalam AWS Console
3. **Test bucket access** secara manual
4. **Restart server** selepas sebarang perubahan

---

## ✅ **Checklist**

- [ ] File `.env` dibuat dan diisi dengan credentials baru
- [ ] AWS S3 bucket sudah setup dengan CORS dan policy
- [ ] Test connection berjaya
- [ ] Server restart dengan konfigurasi baru
- [ ] File upload ke bucket baru berjaya 