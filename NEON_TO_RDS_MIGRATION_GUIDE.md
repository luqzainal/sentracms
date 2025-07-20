# 🚀 Migration Guide: Neon → Amazon RDS

## Overview

This guide will help you migrate your SentraCMS database from Neon to Amazon RDS PostgreSQL.

## Prerequisites

- ✅ AWS Account
- ✅ AWS CLI (optional)
- ✅ Node.js and npm
- ✅ PostgreSQL client tools

## Step 1: Create Amazon RDS Instance

### Option A: AWS Console

1. **Login to AWS Console**
   - Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
   - Click "Create database"

2. **Choose Configuration**
   - **Engine type**: PostgreSQL
   - **Version**: 15.x (latest stable)
   - **Template**: Free tier (if available) or Production

3. **Settings**
   - **DB instance identifier**: `sentracms-db`
   - **Master username**: `postgres`
   - **Master password**: Create a strong password

4. **Instance Configuration**
   - **DB instance class**: `db.t3.micro` (free tier) or `db.t3.small`
   - **Storage**: 20GB (minimum)
   - **Storage type**: General Purpose SSD (gp2)

5. **Connectivity**
   - **Public access**: Yes
   - **VPC security group**: Create new or use default
   - **Availability Zone**: Choose closest to you
   - **Database port**: 5432

6. **Database Authentication**
   - **Database authentication options**: Password authentication

7. **Additional Configuration**
   - **Initial database name**: `postgres`
   - **Backup retention**: 7 days
   - **Monitoring**: Disable for cost saving

### Option B: AWS CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier sentracms-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible \
  --backup-retention-period 7 \
  --vpc-security-group-ids sg-xxxxxxxxx
```

## Step 2: Configure Security Group

1. **Go to EC2 Security Groups**
2. **Find your RDS security group**
3. **Add inbound rule**:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: Your IP address (0.0.0.0/0 for development)

## Step 3: Export Data from Neon

```bash
# Install required packages
npm install pg

# Export data from Neon
node scripts/export-neon-data.mjs
```

This will create a `database-export/` directory with all your data.

## Step 4: Create Database Schema in RDS

Before importing data, you need to create the database schema:

```bash
# Connect to your RDS instance
psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres

# Run the migration files
\i supabase/migrations/20250711044437_lucky_beacon.sql
\i add-client-pics-table-migration.sql
```

## Step 5: Import Data to RDS

1. **Update RDS configuration** in `scripts/import-to-rds.mjs`:
   ```javascript
   const rdsConfig = {
     host: 'YOUR_RDS_ENDPOINT.amazonaws.com',
     port: 5432,
     database: 'postgres',
     user: 'postgres',
     password: 'YOUR_RDS_PASSWORD',
     ssl: { rejectUnauthorized: false }
   };
   ```

2. **Run import script**:
   ```bash
   node scripts/import-to-rds.mjs
   ```

## Step 6: Update Application Configuration

1. **Update connection strings**:
   ```bash
   node scripts/update-connection-string.mjs
   ```

2. **Test RDS connection**:
   ```bash
   node scripts/test-rds-connection.mjs
   ```

## Step 7: Update Environment Variables

### For Development
Create `.env.local`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_RDS_ENDPOINT:5432/postgres?sslmode=require"
```

### For Production
Update your deployment platform environment variables:
- **Vercel**: Update `DATABASE_URL` in project settings
- **Netlify**: Update environment variables
- **Railway**: Update `DATABASE_URL`

## Step 8: Test Application

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Test all features**:
   - ✅ Login functionality
   - ✅ Client management
   - ✅ Multi-PIC functionality
   - ✅ Add-on services
   - ✅ Chat system
   - ✅ File uploads

## Step 9: Update Deployment

### Vercel
1. Go to project settings
2. Update environment variables
3. Redeploy

### Netlify
1. Go to site settings
2. Update environment variables
3. Trigger new deployment

### Railway
1. Update environment variables
2. Redeploy application

## Troubleshooting

### Connection Issues
```bash
# Test connection manually
psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres
```

### SSL Issues
```javascript
// In database configuration
ssl: {
  rejectUnauthorized: false
}
```

### Security Group Issues
- Ensure port 5432 is open
- Check your IP is whitelisted
- Verify security group is attached to RDS

### Data Import Issues
```bash
# Check table structure
psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres -c "\d table_name"

# Check data count
psql -h YOUR_RDS_ENDPOINT -U postgres -d postgres -c "SELECT COUNT(*) FROM table_name;"
```

## Cost Optimization

### RDS Instance Types
- **Development**: `db.t3.micro` (free tier)
- **Production**: `db.t3.small` or `db.t3.medium`

### Storage
- **Development**: 20GB
- **Production**: Start with 50GB, auto-scaling enabled

### Backup
- **Development**: 7 days retention
- **Production**: 30 days retention

## Monitoring

### CloudWatch Metrics
- CPU utilization
- Database connections
- Storage space
- Read/Write IOPS

### Alerts
Set up CloudWatch alarms for:
- High CPU usage
- Low storage space
- Connection count

## Rollback Plan

If migration fails:

1. **Keep Neon running** during migration
2. **Test thoroughly** before switching
3. **Backup connection strings**:
   ```bash
   # Restore Neon connection
   cp connection-string-backup.txt src/services/database.ts
   ```

## Post-Migration Checklist

- ✅ [ ] All data imported successfully
- ✅ [ ] Application connects to RDS
- ✅ [ ] All features working
- ✅ [ ] Performance acceptable
- ✅ [ ] Backups configured
- ✅ [ ] Monitoring set up
- ✅ [ ] Security groups configured
- ✅ [ ] Environment variables updated
- ✅ [ ] Deployment updated

## Support

If you encounter issues:

1. **Check AWS RDS documentation**
2. **Review CloudWatch logs**
3. **Test connection manually**
4. **Verify security group settings**

## Cost Comparison

| Service | Development | Production |
|---------|-------------|------------|
| **Neon** | $0-5/month | $20-50/month |
| **RDS** | $0-15/month | $30-100/month |

*Prices are approximate and depend on usage*

## Benefits of RDS

- ✅ **Better performance** for larger datasets
- ✅ **More control** over configuration
- ✅ **Advanced features** (read replicas, Multi-AZ)
- ✅ **Better monitoring** and alerting
- ✅ **Enterprise support** available
- ✅ **Compliance** features

---

**🎉 Congratulations! Your migration to Amazon RDS is complete!** 