# GHL Webhook Integration Guide

## Overview
This integration uses GHL webhooks to sync calendar events from Sentra CMS to GoHighLevel. When admins create, update, or delete **Onboarding** or **Handover** events in Sentra, it automatically triggers a webhook to update GHL.

## How It Works

### 1. Webhook Flow
```
Admin creates/updates/deletes event in Sentra
                ↓
Sentra triggers GHL webhook with event data
                ↓
GHL processes webhook and creates/updates appointment
                ↓
GHL returns appointment ID (for creates)
                ↓
Sentra stores GHL appointment ID for reference
```

### 2. Mapping Reference System
The system maintains a mapping between Sentra events and GHL appointments:

```javascript
{
  "sentra_event_id": "123",
  "ghl_appointment_id": "ghl_456", 
  "sync_status": "synced|pending|failed",
  "last_sync_attempt": "2024-01-15T10:00:00Z",
  "sync_error": "error message if failed"
}
```

## Configuration

### 1. Environment Variables
Add to your `.env` file:

```bash
# GHL Webhook Configuration
VITE_GHL_WEBHOOK_ENABLED=true
```

### 2. Webhook URL
The webhook URL is hardcoded in the service:
```
https://services.leadconnectorhq.com/hooks/TQ5u2L7jxbXt7rPdOccp/webhook-trigger/acce4873-db55-46d6-b22d-9c1b79b86eda
```

## Webhook Payload Structure

### Event Created
```json
{
  "event_type": "calendar_event_created",
  "event_data": {
    "sentra_event_id": "123",
    "client_id": 456,
    "client_email": "client@example.com",
    "client_phone": "+1234567890",
    "client_name": "Client Business Name",
    "event_title": "Onboarding Session",
    "event_type": "onboarding",
    "start_date": "2024-01-15",
    "end_date": "2024-01-15", 
    "start_time": "10:00",
    "end_time": "11:00",
    "description": "Initial client onboarding",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T09:00:00Z"
  },
  "reference_mapping": {
    "sentra_event_id": "123",
    "sync_status": "pending"
  }
}
```

### Event Updated
```json
{
  "event_type": "calendar_event_updated",
  "event_data": {
    // Same structure as created
    "updated_at": "2024-01-15T11:00:00Z"
  },
  "reference_mapping": {
    "sentra_event_id": "123",
    "ghl_appointment_id": "ghl_456",
    "sync_status": "synced"
  }
}
```

### Event Deleted
```json
{
  "event_type": "calendar_event_deleted",
  "event_data": {
    "sentra_event_id": "123"
  },
  "reference_mapping": {
    "sentra_event_id": "123",
    "ghl_appointment_id": "ghl_456",
    "sync_status": "synced"
  }
}
```

## Expected GHL Response

### Successful Create Response
```json
{
  "success": true,
  "appointment_id": "ghl_456", 
  "message": "Appointment created successfully"
}
```

### Error Response  
```json
{
  "success": false,
  "error": "Contact not found in GHL",
  "error_code": "CONTACT_NOT_FOUND"
}
```

## Implementation Details

### 1. Automatic Triggering
Webhooks are automatically triggered when:
- ✅ **Creating** onboarding/handover events
- ✅ **Updating** onboarding/handover events  
- ✅ **Deleting** onboarding/handover events

### 2. Mapping Reference Storage
- Stored in browser `localStorage` for now
- Can be moved to database for production
- Tracks sync status and errors for each event

### 3. Error Handling
- Local events always saved regardless of webhook status
- Failed webhooks logged but don't prevent event operations
- Retry mechanism can be added later

## Testing the Integration

### 1. Enable Webhook
Ensure environment variable is set:
```bash
VITE_GHL_WEBHOOK_ENABLED=true
```

### 2. Create Test Event
1. Go to Calendar in Sentra CMS
2. Create new Onboarding event
3. Check browser console for webhook logs:
   - `🔄 Triggering GHL webhook for onboarding event:`
   - `✅ GHL webhook triggered successfully:`

### 3. Check Mapping Reference
In browser console:
```javascript
// View all sync mappings
const webhookService = await import('./src/services/ghlWebhook.ts');
console.log(webhookService.ghlWebhookService.getAllSyncStatuses());

// Check specific event sync status
console.log(webhookService.ghlWebhookService.getSyncStatus('123'));
```

### 4. Test Update/Delete
1. Edit the test event
2. Delete the test event
3. Verify webhook triggers for each operation

## Monitoring & Debugging

### 1. Console Logs
Monitor these log messages:
- `🔄 Triggering GHL webhook for [type] event:` - Webhook started
- `✅ GHL webhook triggered successfully:` - Success  
- `⚠️ GHL webhook failed:` - Error occurred
- `✅ Mapping reference created:` - Reference tracking
- `✅ Mapping reference updated:` - Status updates

### 2. Sync Status Check
```javascript
import { ghlWebhookService } from './src/services/ghlWebhook';

// Get sync status for specific event
const status = ghlWebhookService.getSyncStatus('event_id');
console.log('Sync Status:', status);

// Get all sync statuses
const allStatuses = ghlWebhookService.getAllSyncStatuses();
console.log('All Sync Statuses:', allStatuses);
```

### 3. Common Issues

#### Webhook Not Triggering
- Check `VITE_GHL_WEBHOOK_ENABLED=true` in .env
- Verify event type is 'onboarding' or 'handover'
- Check browser console for errors

#### Webhook Failing
- Verify GHL webhook URL is accessible
- Check GHL webhook configuration
- Review payload structure matches expected format

#### Mapping Reference Issues
- Clear localStorage if corrupted: `localStorage.removeItem('ghl_sync_mappings')`
- Check browser storage permissions

## Advanced Features

### 1. Bulk Sync (Future)
For syncing existing events:
```javascript
// Get all unsynced events
const allMappings = ghlWebhookService.getAllSyncStatuses();
const failedEvents = Object.entries(allMappings)
  .filter(([id, mapping]) => mapping.sync_status === 'failed');

// Retry failed syncs
for (const [eventId, mapping] of failedEvents) {
  // Retry webhook trigger
}
```

### 2. Webhook Status Dashboard (Future)
Display sync status in admin interface:
- Total events synced
- Failed sync count
- Last sync attempt
- Retry failed syncs button

### 3. Database Storage (Future)
Move mapping references from localStorage to database:
```sql
CREATE TABLE ghl_sync_mappings (
  sentra_event_id INTEGER PRIMARY KEY,
  ghl_appointment_id VARCHAR(255),
  sync_status VARCHAR(20),
  last_sync_attempt TIMESTAMP,
  sync_error TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations
- Webhook URL is specific to your GHL account
- No sensitive data exposed in payloads
- Client information limited to necessary fields
- Error messages don't expose system internals

## Production Checklist
- [ ] Environment variable configured
- [ ] GHL webhook endpoint configured to receive payloads
- [ ] Test event creation triggers webhook
- [ ] Test event update triggers webhook  
- [ ] Test event deletion triggers webhook
- [ ] Mapping references working correctly
- [ ] Error handling tested
- [ ] Console logs monitored

## Troubleshooting

### Debug Steps
1. Check environment variables
2. Test with simple onboarding event
3. Monitor browser console logs
4. Verify webhook URL accessibility
5. Check GHL webhook configuration
6. Review payload structure

### Common Error Solutions
- **"Webhook disabled"**: Set `VITE_GHL_WEBHOOK_ENABLED=true`
- **Network errors**: Check internet connectivity
- **GHL errors**: Verify webhook configuration in GHL
- **Mapping errors**: Clear localStorage and retry

## Support
For webhook integration issues:
1. Check browser console for detailed error logs
2. Verify GHL webhook configuration
3. Test with simple events first
4. Review mapping reference system
5. Contact GHL support for webhook endpoint issues