# 🚀 Production Update: DigitalOcean App Platform

## Overview

Guide untuk update production deployment di DigitalOcean App Platform dengan database DO yang baru.

## Step 1: Update Environment Variables

### DigitalOcean App Platform Dashboard

1. **Login ke [DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. **Click "Apps" di left sidebar**
3. **Click pada app name: `sentracms`**
4. **Click "Settings" tab**
5. **Scroll down ke "Environment Variables" section**
6. **Click "Edit" button**

### Update Database Connection String

**New (DigitalOcean):**
```
Key: VITE_NEON_DATABASE_URL
Value: postgresql://doadmin:YOUR_DO_PASSWORD@YOUR_DO_HOST:25060/defaultdb?sslmode=require
Scope: Build & Run (IMPORTANT!)
```

**⚠️ Critical Points:**
- **Scope** mesti set ke "Build & Run" (bukan "Run" je)
- Environment variable mesti available semasa build time
- Click "Save" lepas update variable

## Step 2: Redeploy Application

1. **Go to "Deployments" tab**
2. **Click "Create Deployment"**
3. **Select "GitHub" as source**
4. **Choose branch: main**
5. **Click "Deploy"**

## Step 3: Test Production

### Functionality Tests
1. **Login functionality**
2. **Add new client**
3. **Create invoice**
4. **Add calendar event**
5. **Add user**

---

**🎉 After successful update, your production app will use DigitalOcean database!**
