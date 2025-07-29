# GHL Calendar Webhook Setup Guide

## Overview
This system automatically creates calendar events in Sentra CMS when appointments are booked in GoHighLevel (GHL). It supports two event types:
- **Onboarding** - Initial client sessions
- **Handover** - Project completion sessions

## Setup Instructions

### 1. Environment Variables
Add these to your `.env` file:

```bash
# GHL Webhook Configuration
GHL_ONBOARDING_WEBHOOK_SECRET=your_secret_key_here
GHL_HANDOVER_WEBHOOK_SECRET=your_different_secret_key_here
WEBHOOK_PORT=3001

# Supabase Configuration (required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Start Webhook Server
```bash
cd api
npm install
npm run webhook
```

For development with auto-reload:
```bash
npm run webhook:dev
```

### 3. GHL Webhook Configuration

#### Onboarding Webhook
- **URL**: `https://your-domain.com/webhook/ghl/onboarding`
- **Method**: POST
- **Secret**: Use the value from `GHL_ONBOARDING_WEBHOOK_SECRET`
- **Trigger**: Appointment booked/updated for onboarding calendar

#### Handover Webhook  
- **URL**: `https://your-domain.com/webhook/ghl/handover`
- **Method**: POST
- **Secret**: Use the value from `GHL_HANDOVER_WEBHOOK_SECRET`
- **Trigger**: Appointment booked/updated for handover calendar

### 4. Expected Webhook Payload

The webhook expects GHL to send data in this format:

```json
{
  "contactId": "contact_123",
  "appointmentId": "appointment_456", 
  "calendarId": "calendar_789",
  "locationId": "location_abc",
  "title": "Onboarding Session",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "contact": {
    "email": "client@example.com",
    "phone": "+1234567890",
    "name": "John Doe"
  },
  "calendar": {
    "name": "Onboarding Calendar"
  }
}
```

## How It Works

### 1. Client Matching
The system finds clients using:
1. **Email match** (primary)
2. **Phone number match** (fallback)

If no client is found, the webhook returns a warning but doesn't fail.

### 2. Event Creation
Successfully matched clients get calendar events created with:
- **Title**: From GHL or default ("Onboarding Session"/"Handover Session")
- **Type**: `onboarding` or `handover`
- **Date/Time**: Converted from GHL UTC to local format
- **Description**: Includes GHL appointment details

### 3. Event Types
- **Onboarding**: For new client setup and introduction
- **Handover**: For project completion and final delivery

## Testing

### Health Check
```bash
GET /webhook/health
```
Returns server status and timestamp.

### Test Endpoint
```bash
POST /webhook/test
Content-Type: application/json

{
  "test": "data"
}
```
Logs received data for debugging.

## Troubleshooting

### Common Issues

1. **Client Not Found**
   - Verify client email/phone matches GHL contact
   - Check clients table in database

2. **Webhook Not Triggering**
   - Verify GHL webhook URL is correct
   - Check webhook secret matches environment variable
   - Ensure server is running on correct port

3. **Events Not Creating**
   - Check Supabase connection
   - Verify calendar_events table structure
   - Check server logs for errors

### Debug Logs
The webhook handler provides detailed logging:
- `📨` Webhook received
- `🔍` Client lookup attempts  
- `📅` Event creation
- `✅` Success messages
- `❌` Error messages

### Database Requirements
Ensure your `calendar_events` table has:
- `client_id` (integer, foreign key to clients)
- `title` (text)
- `description` (text)
- `start_date` (date)
- `end_date` (date) 
- `start_time` (time)
- `end_time` (time)
- `type` (text - 'onboarding' or 'handover')
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Security

- Webhook signatures are verified using HMAC-SHA256
- Use different secrets for onboarding and handover webhooks
- Keep secrets in environment variables, never in code
- Use HTTPS in production

## Production Deployment

1. Deploy webhook server to your hosting platform
2. Set environment variables in production
3. Configure GHL webhooks to point to production URLs
4. Monitor logs for successful event creation
5. Test with sample appointments

## Monitoring

Monitor these endpoints:
- `/webhook/health` - Server health
- `/webhook/ghl/onboarding` - Onboarding events
- `/webhook/ghl/handover` - Handover events

Expected response format:
```json
{
  "status": "success",
  "message": "Event created",
  "eventId": 123,
  "clientName": "Client Business Name"
}
```