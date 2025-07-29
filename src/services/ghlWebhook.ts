// GHL Webhook Service for Outbound Integration
// This service triggers GHL webhooks when events are created/updated in Sentra

interface WebhookPayload {
  event_type: 'calendar_event_created' | 'calendar_event_updated' | 'calendar_event_deleted';
  event_data: {
    sentra_event_id: string;
    client_id: number;
    client_email: string;
    client_phone?: string;
    client_name: string;
    event_title: string;
    event_type: 'onboarding' | 'handover';
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
  reference_mapping?: {
    sentra_event_id: string;
    ghl_appointment_id?: string;
    sync_status: 'pending' | 'synced' | 'failed';
    last_sync_attempt?: string;
    sync_error?: string;
  };
}

class GHLWebhookService {
  private webhookUrl: string;
  private isEnabled: boolean;

  constructor() {
    this.webhookUrl = 'https://services.leadconnectorhq.com/hooks/TQ5u2L7jxbXt7rPdOccp/webhook-trigger/acce4873-db55-46d6-b22d-9c1b79b86eda';
    this.isEnabled = import.meta.env.VITE_GHL_WEBHOOK_ENABLED !== 'false';
  }

  // Create mapping reference for tracking sync status
  async createMappingReference(sentraEventId: string, ghlAppointmentId?: string): Promise<void> {
    try {
      const mappingData = {
        sentra_event_id: sentraEventId,
        ghl_appointment_id: ghlAppointmentId || null,
        sync_status: ghlAppointmentId ? 'synced' : 'pending',
        last_sync_attempt: new Date().toISOString(),
        sync_error: null
      };

      // Store in localStorage for now (could be moved to database later)
      const existingMappings = this.getMappingReferences();
      existingMappings[sentraEventId] = mappingData;
      localStorage.setItem('ghl_sync_mappings', JSON.stringify(existingMappings));
      
      console.log('✅ Mapping reference created:', mappingData);
    } catch (error) {
      console.error('❌ Error creating mapping reference:', error);
    }
  }

  // Get mapping reference by Sentra event ID
  getMappingReference(sentraEventId: string): any {
    try {
      const mappings = this.getMappingReferences();
      return mappings[sentraEventId] || null;
    } catch (error) {
      console.error('❌ Error getting mapping reference:', error);
      return null;
    }
  }

  // Get all mapping references
  getMappingReferences(): Record<string, any> {
    try {
      const stored = localStorage.getItem('ghl_sync_mappings');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ Error getting mapping references:', error);
      return {};
    }
  }

  // Update mapping reference
  async updateMappingReference(sentraEventId: string, updates: Partial<any>): Promise<void> {
    try {
      const mappings = this.getMappingReferences();
      if (mappings[sentraEventId]) {
        mappings[sentraEventId] = {
          ...mappings[sentraEventId],
          ...updates,
          last_sync_attempt: new Date().toISOString()
        };
        localStorage.setItem('ghl_sync_mappings', JSON.stringify(mappings));
        console.log('✅ Mapping reference updated:', mappings[sentraEventId]);
      }
    } catch (error) {
      console.error('❌ Error updating mapping reference:', error);
    }
  }

  // Trigger webhook for event creation
  async triggerEventCreated(eventData: {
    id: string;
    client_id: number;
    client_email: string;
    client_phone?: string;
    client_name: string;
    title: string;
    type: 'onboarding' | 'handover';
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    created_at: string;
  }): Promise<{ success: boolean; error?: string; ghl_appointment_id?: string }> {
    
    if (!this.isEnabled) {
      console.log('⚠️ GHL webhook disabled, skipping trigger');
      return { success: false, error: 'Webhook disabled' };
    }

    try {
      console.log('🔄 Triggering GHL webhook for event creation:', eventData.title);

      // Get existing mapping reference
      const existingMapping = this.getMappingReference(eventData.id);

      const payload: WebhookPayload = {
        event_type: 'calendar_event_created',
        event_data: {
          sentra_event_id: eventData.id,
          client_id: eventData.client_id,
          client_email: eventData.client_email,
          client_phone: eventData.client_phone,
          client_name: eventData.client_name,
          event_title: eventData.title,
          event_type: eventData.type,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          description: eventData.description,
          created_at: eventData.created_at,
          updated_at: eventData.created_at
        },
        reference_mapping: existingMapping
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        const ghlAppointmentId = responseData.appointment_id || responseData.ghl_appointment_id;
        
        // Update mapping reference with success
        await this.updateMappingReference(eventData.id, {
          ghl_appointment_id: ghlAppointmentId,
          sync_status: 'synced',
          sync_error: null
        });

        console.log('✅ GHL webhook triggered successfully:', ghlAppointmentId);
        return { 
          success: true, 
          ghl_appointment_id: ghlAppointmentId 
        };
      } else {
        const errorText = await response.text();
        console.error('❌ GHL webhook failed:', response.status, errorText);
        
        // Update mapping reference with error
        await this.updateMappingReference(eventData.id, {
          sync_status: 'failed',
          sync_error: `HTTP ${response.status}: ${errorText}`
        });

        return { 
          success: false, 
          error: `Webhook failed: ${response.status}` 
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error triggering GHL webhook:', error);
      
      // Update mapping reference with error
      await this.updateMappingReference(eventData.id, {
        sync_status: 'failed',
        sync_error: errorMessage
      });

      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }

  // Trigger webhook for event update
  async triggerEventUpdated(eventData: {
    id: string;
    client_id: number;
    client_email: string;
    client_phone?: string;
    client_name: string;
    title: string;
    type: 'onboarding' | 'handover';
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    updated_at: string;
  }): Promise<{ success: boolean; error?: string }> {
    
    if (!this.isEnabled) {
      console.log('⚠️ GHL webhook disabled, skipping trigger');
      return { success: false, error: 'Webhook disabled' };
    }

    try {
      console.log('🔄 Triggering GHL webhook for event update:', eventData.title);

      const existingMapping = this.getMappingReference(eventData.id);

      const payload: WebhookPayload = {
        event_type: 'calendar_event_updated',
        event_data: {
          sentra_event_id: eventData.id,
          client_id: eventData.client_id,
          client_email: eventData.client_email,
          client_phone: eventData.client_phone,
          client_name: eventData.client_name,
          event_title: eventData.title,
          event_type: eventData.type,
          start_date: eventData.start_date,
          end_date: eventData.end_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          description: eventData.description,
          created_at: existingMapping?.created_at || eventData.updated_at,
          updated_at: eventData.updated_at
        },
        reference_mapping: existingMapping
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await this.updateMappingReference(eventData.id, {
          sync_status: 'synced',
          sync_error: null
        });

        console.log('✅ GHL webhook update triggered successfully');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('❌ GHL webhook update failed:', response.status, errorText);
        
        await this.updateMappingReference(eventData.id, {
          sync_status: 'failed',
          sync_error: `HTTP ${response.status}: ${errorText}`
        });

        return { success: false, error: `Webhook failed: ${response.status}` };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error triggering GHL webhook update:', error);
      
      await this.updateMappingReference(eventData.id, {
        sync_status: 'failed',
        sync_error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  // Trigger webhook for event deletion
  async triggerEventDeleted(eventId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isEnabled) {
      console.log('⚠️ GHL webhook disabled, skipping trigger');
      return { success: false, error: 'Webhook disabled' };
    }

    try {
      console.log('🔄 Triggering GHL webhook for event deletion:', eventId);

      const existingMapping = this.getMappingReference(eventId);
      if (!existingMapping) {
        console.log('⚠️ No mapping reference found for deleted event');
        return { success: false, error: 'No mapping reference found' };
      }

      const payload = {
        event_type: 'calendar_event_deleted',
        event_data: {
          sentra_event_id: eventId
        },
        reference_mapping: existingMapping
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Remove mapping reference after successful deletion
        const mappings = this.getMappingReferences();
        delete mappings[eventId];
        localStorage.setItem('ghl_sync_mappings', JSON.stringify(mappings));

        console.log('✅ GHL webhook deletion triggered successfully');
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('❌ GHL webhook deletion failed:', response.status, errorText);
        return { success: false, error: `Webhook failed: ${response.status}` };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error triggering GHL webhook deletion:', error);
      return { success: false, error: errorMessage };
    }
  }

  // Get sync status for an event
  getSyncStatus(eventId: string): {
    synced: boolean;
    status: 'pending' | 'synced' | 'failed';
    error?: string;
    ghl_appointment_id?: string;
    last_sync_attempt?: string;
  } {
    const mapping = this.getMappingReference(eventId);
    if (!mapping) {
      return { synced: false, status: 'pending' };
    }

    return {
      synced: mapping.sync_status === 'synced',
      status: mapping.sync_status,
      error: mapping.sync_error,
      ghl_appointment_id: mapping.ghl_appointment_id,
      last_sync_attempt: mapping.last_sync_attempt
    };
  }

  // Get all sync statuses for dashboard
  getAllSyncStatuses(): Record<string, any> {
    return this.getMappingReferences();
  }

  // Enable/disable webhook
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if webhook is enabled
  isWebhookEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const ghlWebhookService = new GHLWebhookService();
export default ghlWebhookService;