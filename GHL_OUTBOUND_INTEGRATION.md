# GHL Outbound Integration Guide

## Overview
This integration automatically syncs calendar events from Sentra CMS to GoHighLevel (GHL) when admins create **Onboarding** or **Handover** events.

## Features
- ✅ **Automatic Sync**: Events created in Sentra automatically appear in GHL
- ✅ **Two Event Types**: Supports Onboarding and Handover calendars
- ✅ **Client Matching**: Finds GHL contacts by email or phone
- ✅ **Error Handling**: Local events still created even if GHL sync fails
- ✅ **Appointment Tracking**: Stores GHL appointment IDs for reference

## Setup Instructions

### 1. Database Migration
Run this SQL migration to add GHL appointment ID tracking:

```sql
-- Run in your Neon database console
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS ghl_appointment_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_calendar_events_ghl_appointment_id 
ON calendar_events(ghl_appointment_id);
```

Or run the provided migration file:
```bash
# Execute: add-ghl-appointment-id-column.sql
```

### 2. GHL API Configuration
Add these environment variables to your `.env` file:

```bash
# GHL API Configuration
VITE_GHL_API_KEY=your_ghl_api_key_here
VITE_GHL_LOCATION_ID=your_ghl_location_id_here
VITE_GHL_ONBOARDING_CALENDAR_ID=your_onboarding_calendar_id_here
VITE_GHL_HANDOVER_CALENDAR_ID=your_handover_calendar_id_here
```

### 3. Get GHL Credentials

#### API Key
1. Login to GHL
2. Go to **Settings** → **Company** → **API Keys**
3. Create new API key with **Calendar** permissions
4. Copy the API key

#### Location ID
1. In GHL, go to **Settings** → **Company** → **Locations**
2. Copy your Location ID

#### Calendar IDs
1. Go to **Calendar** → **Settings**
2. Find your Onboarding and Handover calendars
3. Copy their Calendar IDs from the URL or settings

## How It Works

### 1. Event Creation Flow
```
Admin creates event in Sentra CMS
                ↓
Event saved to local database
                ↓
Check if type is 'onboarding' or 'handover'
                ↓
Find GHL contact by email/phone
                ↓
Create appointment in appropriate GHL calendar
                ↓
Store GHL appointment ID in local database
```

### 2. Client Matching Process
The system finds GHL contacts using:
1. **Email match** (primary method)
2. **Phone number match** (fallback)

If no contact is found, the sync fails but the local event is still created.

### 3. Calendar Assignment
- **Onboarding events** → GHL Onboarding Calendar
- **Handover events** → GHL Handover Calendar

## Event Form Changes
The calendar event form now only shows:
- **Onboarding** - For new client setup sessions
- **Handover** - For project completion sessions

Old event types (Meeting, Call, Deadline, Payment) have been removed.

## Testing the Integration

### 1. Create Test Event
1. Go to Calendar page in Sentra CMS
2. Click "Add Event"
3. Fill in details:
   - Title: "Test Onboarding"
   - Type: "Onboarding" 
   - Client: Select existing client
   - Date/Time: Future date
4. Save event

### 2. Check GHL Calendar
1. Login to GHL
2. Go to Calendar
3. Verify appointment appears in Onboarding calendar
4. Check appointment details match Sentra event

### 3. Verify Database
```sql
SELECT id, title, type, ghl_appointment_id, created_at 
FROM calendar_events 
WHERE type IN ('onboarding', 'handover')
ORDER BY created_at DESC;
```

## Troubleshooting

### Common Issues

#### 1. Events Not Syncing to GHL
**Check Configuration:**
```javascript
// In browser console
console.log('GHL Config:', {
  apiKey: import.meta.env.VITE_GHL_API_KEY ? '✓' : '✗',
  locationId: import.meta.env.VITE_GHL_LOCATION_ID ? '✓' : '✗',
  onboardingId: import.meta.env.VITE_GHL_ONBOARDING_CALENDAR_ID ? '✓' : '✗',
  handoverId: import.meta.env.VITE_GHL_HANDOVER_CALENDAR_ID ? '✓' : '✗'
});
```

**Solutions:**
- Verify all environment variables are set
- Check API key has Calendar permissions
- Ensure Location ID is correct
- Verify Calendar IDs exist in GHL

#### 2. Client Not Found in GHL
**Error:** "Client not found in GHL"

**Solutions:**
- Ensure client exists in GHL contacts
- Verify email/phone matches exactly
- Check for typos in contact information
- Create contact in GHL if missing

#### 3. Invalid Calendar ID
**Error:** "GHL calendar ID not configured"

**Solutions:**
- Verify calendar IDs in environment variables
- Check calendar exists in GHL
- Ensure calendar is active and accessible

### Debug Logs
Monitor browser console for sync status:
- `🔄 Syncing onboarding event to GHL:` - Sync started
- `✅ Event synced to GHL successfully:` - Success
- `⚠️ GHL sync failed:` - Error occurred
- `⚠️ GHL not configured, skipping sync` - Missing config

### API Error Responses
Common GHL API errors:
- **401 Unauthorized**: Invalid API key
- **404 Not Found**: Invalid Location/Calendar ID
- **400 Bad Request**: Invalid appointment data
- **429 Rate Limited**: Too many requests

## Advanced Configuration

### Custom Error Handling
The integration includes graceful error handling:
- Local events always created regardless of GHL sync status
- Sync failures logged but don't block event creation
- Retry logic can be added for network failures

### Batch Sync (Future Enhancement)
For bulk syncing existing events:
```sql
-- Find events that need syncing
SELECT * FROM calendar_events 
WHERE type IN ('onboarding', 'handover') 
AND ghl_appointment_id IS NULL;
```

### Webhook Notifications (Future Enhancement)
Set up GHL webhooks to sync appointment updates back to Sentra.

## Security Considerations
- API keys stored in environment variables only
- No sensitive data logged in console
- HTTPS required for GHL API calls
- Rate limiting respected

## Production Checklist
- [ ] Database migration completed
- [ ] Environment variables configured  
- [ ] GHL API key has correct permissions
- [ ] Calendar IDs verified in GHL
- [ ] Test event sync successful
- [ ] Error handling tested
- [ ] Logs monitored for issues

## Support
For issues with this integration:
1. Check browser console for error messages
2. Verify GHL configuration in admin panel
3. Test with sample events
4. Review GHL API documentation
5. Check network connectivity to GHL servers