# Database Reset Script

## 🗑️ Overview

Script untuk reset semua data dalam Neon database dengan command mudah: `npm run db:reset`

## 🚀 Usage

```bash
npm run db:reset
```

## 📋 What It Does

### **Step 1: Get All Tables**
- Detect semua tables dalam database
- Skip system tables (pg_*, information_schema)

### **Step 2: Delete All Data**
- Delete data dari semua tables dalam order yang betul
- Respect foreign key constraints
- Order: child tables → parent tables

### **Step 3: Reset Sequences**
- Reset semua auto-increment sequences ke 1
- Ensure new records start from ID 1

### **Step 4: Verify Reset**
- Check semua tables untuk confirm empty
- Display row count untuk setiap table

## 🔧 Technical Details

### **Deletion Order (Foreign Key Safe):**
1. `chat_messages` (child)
2. `progress_step_comments` (child)
3. `progress_steps` (child)
4. `client_pics` (child)
5. `client_files` (child)
6. `client_links` (child)
7. `client_service_requests` (child)
8. `add_on_services` (child)
9. `calendar_events` (child)
10. `invoices` (child)
11. `payments` (child)
12. `components` (child)
13. `chats` (child)
14. `clients` (parent)
15. `users` (parent)
16. `tags` (parent)

### **Environment Variables Required:**
```bash
VITE_NEON_DATABASE_URL=postgresql://...
```

## ⚠️ Warning

**PERMANENT DELETION!** Script ini akan:
- ❌ Delete semua data dalam database
- ❌ Reset semua sequences
- ❌ Cannot be undone

## 📊 Example Output

```
🗑️  Resetting Neon Database...

📋 Step 1: Getting all table names...
✅ Found 16 tables: invoices, payments, components, clients, chats, users, progress_step_comments, calendar_events, client_files, tags, client_links, client_service_requests, add_on_services, progress_steps, chat_messages, client_pics

🗑️  Step 2: Deleting all data from tables...
✅ Deleted from: chat_messages
✅ Deleted from: progress_step_comments
✅ Deleted from: progress_steps
✅ Deleted from: client_pics
✅ Deleted from: client_files
✅ Deleted from: client_links
✅ Deleted from: client_service_requests
✅ Deleted from: add_on_services
✅ Deleted from: calendar_events
✅ Deleted from: invoices
✅ Deleted from: payments
✅ Deleted from: components
✅ Deleted from: chats
✅ Deleted from: clients
✅ Deleted from: users
✅ Deleted from: tags

🔄 Step 3: Resetting sequences...
✅ Reset sequence: add_on_services_id_seq
✅ Reset sequence: client_service_requests_id_seq
✅ Reset sequence: client_files_id_seq
✅ Reset sequence: client_pics_id_seq
✅ Reset sequence: clients_id_seq
✅ Reset sequence: chats_id_seq
✅ Reset sequence: chat_messages_id_seq

🔍 Step 4: Verifying tables are empty...
✅ invoices: 0 rows
✅ payments: 0 rows
✅ components: 0 rows
✅ clients: 0 rows
✅ chats: 0 rows
✅ users: 0 rows
✅ progress_step_comments: 0 rows
✅ calendar_events: 0 rows
✅ client_files: 0 rows
✅ tags: 0 rows
✅ client_links: 0 rows
✅ client_service_requests: 0 rows
✅ add_on_services: 0 rows
✅ progress_steps: 0 rows
✅ chat_messages: 0 rows
✅ client_pics: 0 rows

🎉 Database reset completed successfully!

📋 Summary:
   - Tables processed: 16
   - All data removed
   - Sequences reset to 1
   - Foreign key constraints respected

⚠️  Warning: All data has been permanently deleted!
   You may need to run migrations or seed data again.
```

## 🔧 Troubleshooting

### **If script fails:**

1. **Check database connection:**
   ```bash
   npm run db:test
   ```

2. **Verify environment variables:**
   ```bash
   echo $VITE_NEON_DATABASE_URL
   ```

3. **Check database permissions:**
   - Ensure user has DELETE permissions
   - Ensure user can modify sequences

### **Common Issues:**

- **Permission denied:** Check database user permissions
- **Connection failed:** Verify database URL
- **Foreign key errors:** Script handles this automatically

## 📝 Notes

- **Safe for Neon:** Uses DELETE instead of TRUNCATE (Neon limitation)
- **Foreign Key Safe:** Deletes in correct order
- **Verification:** Confirms all tables are empty
- **Sequences:** Resets all auto-increment counters

**Database reset script ready! Run `npm run db:reset` untuk reset semua data.** 🎉 