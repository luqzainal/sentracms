 # Database Setup Guide

## 🔧 Setup Steps

### 1. Create Environment Variables
Create a `.env` file in your project root with your Neon database connection string:

```env
VITE_NEON_DATABASE_URL=postgresql://username:password@your-hostname.neon.tech/database_name?sslmode=require
```

### 2. Get Your Neon Connection String
1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string
5. Paste it in your `.env` file

### 3. Run Database Setup
```bash
npm run db:setup
```

This will:
- ✅ Create all required tables (clients, chats, chat_messages, users, etc.)
- ✅ Set up proper indexes
- ✅ Insert sample data
- ✅ Verify database setup

### 4. Start Your Application
```bash
npm run dev
```

## 🛠️ Troubleshooting

### Error: "relation does not exist"
- Make sure you've run `npm run db:setup`
- Check your `VITE_NEON_DATABASE_URL` is correct
- Verify your Neon database is active

### Error: "Bad Request 400"
- Check your database connection string
- Ensure your Neon project is not sleeping
- Try running `npm run db:setup` again

## 📋 Database Tables
After setup, you'll have these tables:
- `clients` - Client information
- `chats` - Chat conversations
- `chat_messages` - Individual messages
- `users` - System users
- `invoices` - Invoice records
- `payments` - Payment records
- `calendar_events` - Calendar events
- `components` - Package components
- `progress_steps` - Progress tracking

## 🌱 Sample Data
The setup includes sample data:
- 3 sample clients
- 3 sample chats
- 6 sample chat messages

Ready to use immediately after setup! 🚀 