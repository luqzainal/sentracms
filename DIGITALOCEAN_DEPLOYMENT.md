# DigitalOcean App Platform Deployment Guide

## 🚀 Step-by-Step Deployment Instructions

### 1. **Push Code to GitHub**

First, ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Add database debugging and deployment fixes"
git push origin main
```

### 2. **Set Environment Variables in DigitalOcean**

1. **Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/)**
2. **Click "Apps" in the left sidebar**
3. **Click on your app name (sentracms)**
4. **Click "Settings" tab**
5. **Scroll down to "Environment Variables" section**
6. **Click "Edit" button**
7. **Add the following variable:**

```
Key: VITE_NEON_DATABASE_URL
Value: postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
Scope: Build & Run (IMPORTANT!)
```

**⚠️ Critical Points:**
- Make sure **Scope** is set to "Build & Run" (not just "Run")
- The environment variable MUST be available during build time
- Click "Save" after adding the variable

### 3. **Redeploy the Application**

After saving the environment variable:

1. **Go to "Deployments" tab**
2. **Click "Create Deployment"**
3. **Select "GitHub" as source**
4. **Choose branch: main**
5. **Click "Deploy"**

### 4. **Monitor the Deployment**

1. **Watch the "Build Logs"** during deployment
2. **Look for the debug output:** `🔍 Database Environment Check:`
3. **Check Runtime Logs** after deployment

### 5. **Verify Database Connection**

After deployment, visit your app URL and check the dashboard. You should see:

- **Yellow debug section** (in production only)
- **Database connection status** showing:
  - ✅ Database Available: true
  - ✅ Has Connection String: true
  - ✅ Connection String Length: >0

### 6. **Test Functionality**

Try the following operations:
1. **Add a new client**
2. **Create an invoice**
3. **Add a calendar event**
4. **Add a user**

If data is being saved properly, the debug section can be removed.

## 🔧 Troubleshooting

### Issue: Database still showing as unavailable

**Possible causes:**
1. Environment variable not set correctly
2. Scope not set to "Build & Run"
3. Environment variable not available during build

**Solutions:**
1. Double-check the environment variable in DigitalOcean settings
2. Ensure the scope is "Build & Run"
3. Try redeploying after setting the variable
4. Check build logs for environment variable debug output

### Issue: Environment variable appears truncated

**Possible causes:**
1. Copy-paste error when setting the variable
2. Special characters not handled properly

**Solutions:**
1. Re-copy the database URL from Neon dashboard
2. Ensure no extra spaces or characters
3. Test the URL directly in a database client

### Issue: Build fails

**Possible causes:**
1. Environment variable missing during build
2. Syntax error in code

**Solutions:**
1. Check build logs for specific error messages
2. Ensure all dependencies are installed
3. Verify the environment variable is accessible during build

## 📋 Expected Debug Output

In production, you should see:

```
🔍 Database Environment Check: {
  hasEnvVar: true,
  envVarLength: 200+,
  isDatabaseAvailable: true,
  env: 'production'
}
```

## 🎯 Success Indicators

- ✅ App deploys successfully
- ✅ Debug section shows database as available
- ✅ Adding clients/invoices/events works
- ✅ Data appears in Neon database
- ✅ No console errors related to database

## 📞 Next Steps

Once everything is working:
1. Test all functionality thoroughly
2. Remove the debug section (optional)
3. Monitor for any errors in production
4. Set up proper monitoring and alerts

## 🔗 Useful Links

- [DigitalOcean App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Neon Database Documentation](https://neon.tech/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Need Help?** Check the debug output in the dashboard after deployment to identify specific issues. 