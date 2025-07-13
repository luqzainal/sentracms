# SentraCMS - Client Management System

A comprehensive client management system built with React, TypeScript, and Vite.

## Features

- **Client Management**: Add, edit, and track clients with detailed profiles
- **Invoice Management**: Create and manage invoices for clients
- **Payment Tracking**: Track payments and outstanding balances
- **Calendar Integration**: Schedule and manage events and appointments
- **Progress Tracking**: Monitor client progress with custom steps
- **Real-time Chat**: Communicate with clients through integrated chat
- **User Management**: Role-based access control with different permission levels
- **Reports & Analytics**: Generate detailed reports and analytics

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Neon Database account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sentracms
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your database connection in `.env`:
```env
VITE_NEON_DATABASE_URL=postgresql://username:password@your-hostname.neon.tech/database_name?sslmode=require
```

5. Set up the database:
```bash
npm run db:setup
```

6. Start the development server:
```bash
npm run dev
```

## Deployment

### Environment Variables

**Critical**: For deployment to work properly, you must set the `VITE_NEON_DATABASE_URL` environment variable in your deployment platform.

#### Heroku Deployment

1. Set the environment variable:
```bash
heroku config:set VITE_NEON_DATABASE_URL="postgresql://username:password@your-hostname.neon.tech/database_name?sslmode=require"
```

2. Deploy:
```bash
git push heroku main
```

#### Docker Deployment

1. Build with environment variable:
```bash
docker build --build-arg VITE_NEON_DATABASE_URL="postgresql://username:password@your-hostname.neon.tech/database_name?sslmode=require" -t sentracms .
```

2. Run the container:
```bash
docker run -p 8080:8080 sentracms
```

#### Other Platforms

Make sure to set the `VITE_NEON_DATABASE_URL` environment variable in your deployment platform:

- **Vercel**: Add to Environment Variables in project settings
- **Netlify**: Add to Environment Variables in site settings
- **Railway**: Add to Variables in project settings

### Database Setup

After deployment, run the database setup:
```bash
npm run db:setup
```

## Database Scripts

- `npm run db:setup` - Set up database tables and sample data
- `npm run db:test` - Test database connection
- `npm run db:monitor` - Monitor database performance

## Troubleshooting

### Database Connection Issues

If you're experiencing issues where data isn't being saved after deployment:

1. **Check Environment Variables**: Ensure `VITE_NEON_DATABASE_URL` is set correctly in your deployment platform
2. **Verify Database URL**: Make sure your Neon database URL is correct and accessible
3. **Check Build Logs**: Look for any errors during the build process related to database connection
4. **Test Connection**: Run `npm run db:test` to verify database connectivity

### Common Issues

- **"Database not available"**: Environment variable not set during build time
- **"Connection failed"**: Database URL is incorrect or database is sleeping
- **"Tables missing"**: Run `npm run db:setup` to create database tables

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Database**: Neon (PostgreSQL)
- **State Management**: Zustand
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

## License

This project is licensed under the MIT License.
