// GHL API Service for Calendar Sync
// This service pushes calendar events from Sentra CMS to GoHighLevel

interface GHLContact {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

interface GHLCalendar {
  id: string;
  name: string;
  locationId: string;
}

interface GHLAppointment {
  calendarId: string;
  contactId: string;
  startTime: string; // ISO format
  endTime: string; // ISO format
  title: string;
  notes?: string;
}

class GHLApiService {
  private baseUrl: string;
  private apiKey: string;
  private locationId: string;
  private onboardingCalendarId: string;
  private handoverCalendarId: string;

  constructor() {
    this.baseUrl = 'https://services.leadconnectorhq.com';
    this.apiKey = import.meta.env.VITE_GHL_API_KEY || '';
    this.locationId = import.meta.env.VITE_GHL_LOCATION_ID || '';
    this.onboardingCalendarId = import.meta.env.VITE_GHL_ONBOARDING_CALENDAR_ID || '';
    this.handoverCalendarId = import.meta.env.VITE_GHL_HANDOVER_CALENDAR_ID || '';
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GHL API Request failed:', error);
      throw error;
    }
  }

  // Find GHL contact by email or phone
  async findContact(email: string, phone?: string): Promise<GHLContact | null> {
    try {
      console.log('🔍 Searching GHL contact:', { email, phone });

      // Search by email first
      if (email) {
        const emailResponse = await this.makeRequest(
          `/contacts/search/duplicate?locationId=${this.locationId}&email=${encodeURIComponent(email)}`
        );

        if (emailResponse.contact) {
          console.log('✅ Found GHL contact by email:', emailResponse.contact.id);
          return emailResponse.contact;
        }
      }

      // Search by phone if email search fails
      if (phone) {
        const phoneResponse = await this.makeRequest(
          `/contacts/search/duplicate?locationId=${this.locationId}&phone=${encodeURIComponent(phone)}`
        );

        if (phoneResponse.contact) {
          console.log('✅ Found GHL contact by phone:', phoneResponse.contact.id);
          return phoneResponse.contact;
        }
      }

      console.log('⚠️ GHL contact not found');
      return null;
    } catch (error) {
      console.error('❌ Error finding GHL contact:', error);
      return null;
    }
  }

  // Create appointment in GHL
  async createAppointment(appointmentData: GHLAppointment): Promise<any> {
    try {
      console.log('📅 Creating GHL appointment:', appointmentData.title);

      const response = await this.makeRequest('/calendars/events/appointments', 'POST', appointmentData);
      
      console.log('✅ GHL appointment created:', response.id);
      return response;
    } catch (error) {
      console.error('❌ Error creating GHL appointment:', error);
      throw error;
    }
  }

  // Update appointment in GHL
  async updateAppointment(appointmentId: string, appointmentData: Partial<GHLAppointment>): Promise<any> {
    try {
      console.log('📝 Updating GHL appointment:', appointmentId);

      const response = await this.makeRequest(
        `/calendars/events/appointments/${appointmentId}`, 
        'PUT', 
        appointmentData
      );
      
      console.log('✅ GHL appointment updated');
      return response;
    } catch (error) {
      console.error('❌ Error updating GHL appointment:', error);
      throw error;
    }
  }

  // Delete appointment in GHL
  async deleteAppointment(appointmentId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting GHL appointment:', appointmentId);

      await this.makeRequest(`/calendars/events/appointments/${appointmentId}`, 'DELETE');
      
      console.log('✅ GHL appointment deleted');
    } catch (error) {
      console.error('❌ Error deleting GHL appointment:', error);
      throw error;
    }
  }

  // Sync Sentra event to GHL
  async syncEventToGHL(eventData: {
    type: 'onboarding' | 'handover';
    title: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    description?: string;
    clientEmail: string;
    clientPhone?: string;
    clientName: string;
  }): Promise<{ success: boolean; ghlAppointmentId?: string; error?: string }> {
    try {
      console.log('🔄 Syncing event to GHL:', eventData.title);

      // Find GHL contact
      const contact = await this.findContact(eventData.clientEmail, eventData.clientPhone);
      if (!contact) {
        return {
          success: false,
          error: 'Client not found in GHL. Please ensure client exists in GoHighLevel first.'
        };
      }

      // Determine calendar ID based on event type
      const calendarId = eventData.type === 'onboarding' 
        ? this.onboardingCalendarId 
        : this.handoverCalendarId;

      if (!calendarId) {
        return {
          success: false,
          error: `GHL ${eventData.type} calendar ID not configured`
        };
      }

      // Convert date/time to ISO format
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}:00`);
      const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}:00`);

      // Create appointment data
      const appointmentData: GHLAppointment = {
        calendarId,
        contactId: contact.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        title: eventData.title,
        notes: eventData.description || `${eventData.type} session created from Sentra CMS for ${eventData.clientName}`
      };

      // Create appointment in GHL
      const ghlAppointment = await this.createAppointment(appointmentData);

      return {
        success: true,
        ghlAppointmentId: ghlAppointment.id
      };

    } catch (error) {
      console.error('❌ Error syncing event to GHL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get GHL calendars for the location
  async getCalendars(): Promise<GHLCalendar[]> {
    try {
      const response = await this.makeRequest(`/calendars/?locationId=${this.locationId}`);
      return response.calendars || [];
    } catch (error) {
      console.error('❌ Error fetching GHL calendars:', error);
      return [];
    }
  }

  // Validate GHL configuration
  isConfigured(): boolean {
    return !!(this.apiKey && this.locationId && this.onboardingCalendarId && this.handoverCalendarId);
  }

  // Get configuration status
  getConfigStatus(): {
    configured: boolean;
    missing: string[];
  } {
    const missing: string[] = [];
    
    if (!this.apiKey) missing.push('GHL API Key');
    if (!this.locationId) missing.push('GHL Location ID');
    if (!this.onboardingCalendarId) missing.push('Onboarding Calendar ID');
    if (!this.handoverCalendarId) missing.push('Handover Calendar ID');

    return {
      configured: missing.length === 0,
      missing
    };
  }
}

// Export singleton instance
export const ghlApiService = new GHLApiService();
export default ghlApiService;