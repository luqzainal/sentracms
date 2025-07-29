import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.raw({ type: 'application/json', limit: '10mb' }));

// Webhook signature verification
const verifyWebhookSignature = (payload, signature, secret) => {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    const calculatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(calculatedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
};

// Helper function to find client by GHL contact ID or email
const findClientByGHLData = async (ghlContactId, email, phone) => {
  try {
    console.log('🔍 Finding client with GHL data:', { ghlContactId, email, phone });
    
    // Try to find by email first
    if (email) {
      const { data: clientByEmail } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .single();
      
      if (clientByEmail) {
        console.log('✅ Found client by email:', clientByEmail.business_name);
        return clientByEmail;
      }
    }
    
    // Try to find by phone
    if (phone) {
      const { data: clientByPhone } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (clientByPhone) {
        console.log('✅ Found client by phone:', clientByPhone.business_name);
        return clientByPhone;
      }
    }
    
    console.log('⚠️ Client not found in database');
    return null;
  } catch (error) {
    console.error('❌ Error finding client:', error);
    return null;
  }
};

// Helper function to create calendar event
const createCalendarEvent = async (eventData) => {
  try {
    console.log('📅 Creating calendar event:', eventData.title);
    
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([eventData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating calendar event:', error);
      return null;
    }
    
    console.log('✅ Calendar event created successfully:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error in createCalendarEvent:', error);
    return null;
  }
};

// Onboarding webhook handler
app.post('/webhook/ghl/onboarding', async (req, res) => {
  try {
    console.log('📨 Onboarding webhook received');
    
    const signature = req.headers['x-ghl-signature'];
    const webhookSecret = process.env.GHL_ONBOARDING_WEBHOOK_SECRET;
    
    // Verify webhook signature (optional but recommended)
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );
      
      if (!isValid) {
        console.log('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const webhookData = req.body;
    console.log('📋 Onboarding webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Extract appointment/event data from GHL webhook
    const {
      contactId,
      appointmentId,
      calendarId,
      locationId,
      title,
      startTime,
      endTime,
      contact,
      calendar
    } = webhookData;
    
    // Find corresponding client in our database
    const client = await findClientByGHLData(
      contactId,
      contact?.email,
      contact?.phone
    );
    
    if (!client) {
      console.log('⚠️ Client not found, skipping event creation');
      return res.json({ 
        status: 'warning', 
        message: 'Client not found in database',
        contactId 
      });
    }
    
    // Convert GHL datetime to our format
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    const startDate = startDateTime.toISOString().split('T')[0];
    const startTimeStr = startDateTime.toTimeString().slice(0, 5);
    const endDate = endDateTime.toISOString().split('T')[0];
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    // Create calendar event
    const eventData = {
      client_id: client.id,
      title: title || 'Onboarding Session',
      description: `Onboarding session scheduled via GHL. 
Appointment ID: ${appointmentId}
Calendar: ${calendar?.name || 'Unknown'}
Contact: ${contact?.name || 'Unknown'}`,
      start_date: startDate,
      end_date: endDate,
      start_time: startTimeStr,
      end_time: endTimeStr,
      type: 'onboarding',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdEvent = await createCalendarEvent(eventData);
    
    if (createdEvent) {
      console.log('✅ Onboarding event processed successfully');
      res.json({
        status: 'success',
        message: 'Onboarding event created',
        eventId: createdEvent.id,
        clientName: client.business_name
      });
    } else {
      console.log('❌ Failed to create onboarding event');
      res.status(500).json({
        status: 'error',
        message: 'Failed to create event'
      });
    }
    
  } catch (error) {
    console.error('❌ Onboarding webhook error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Handover webhook handler
app.post('/webhook/ghl/handover', async (req, res) => {
  try {
    console.log('📨 Handover webhook received');
    
    const signature = req.headers['x-ghl-signature'];
    const webhookSecret = process.env.GHL_HANDOVER_WEBHOOK_SECRET;
    
    // Verify webhook signature (optional but recommended)
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(
        JSON.stringify(req.body),
        signature,
        webhookSecret
      );
      
      if (!isValid) {
        console.log('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const webhookData = req.body;
    console.log('📋 Handover webhook data:', JSON.stringify(webhookData, null, 2));
    
    // Extract appointment/event data from GHL webhook
    const {
      contactId,
      appointmentId,
      calendarId,
      locationId,
      title,
      startTime,
      endTime,
      contact,
      calendar
    } = webhookData;
    
    // Find corresponding client in our database
    const client = await findClientByGHLData(
      contactId,
      contact?.email,
      contact?.phone
    );
    
    if (!client) {
      console.log('⚠️ Client not found, skipping event creation');
      return res.json({ 
        status: 'warning', 
        message: 'Client not found in database',
        contactId 
      });
    }
    
    // Convert GHL datetime to our format
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    
    const startDate = startDateTime.toISOString().split('T')[0];
    const startTimeStr = startDateTime.toTimeString().slice(0, 5);
    const endDate = endDateTime.toISOString().split('T')[0];
    const endTimeStr = endDateTime.toTimeString().slice(0, 5);
    
    // Create calendar event
    const eventData = {
      client_id: client.id,
      title: title || 'Handover Session',
      description: `Handover session scheduled via GHL. 
Appointment ID: ${appointmentId}
Calendar: ${calendar?.name || 'Unknown'}
Contact: ${contact?.name || 'Unknown'}`,
      start_date: startDate,
      end_date: endDate,
      start_time: startTimeStr,
      end_time: endTimeStr,
      type: 'handover',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const createdEvent = await createCalendarEvent(eventData);
    
    if (createdEvent) {
      console.log('✅ Handover event processed successfully');
      res.json({
        status: 'success',
        message: 'Handover event created',
        eventId: createdEvent.id,
        clientName: client.business_name
      });
    } else {
      console.log('❌ Failed to create handover event');
      res.status(500).json({
        status: 'error',
        message: 'Failed to create event'
      });
    }
    
  } catch (error) {
    console.error('❌ Handover webhook error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/webhook/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'GHL Webhook Handler'
  });
});

// Test endpoint for debugging
app.post('/webhook/test', (req, res) => {
  console.log('🧪 Test webhook received:', req.body);
  res.json({
    status: 'success',
    message: 'Test webhook received',
    data: req.body
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

const PORT = process.env.WEBHOOK_PORT || 3001;

app.listen(PORT, () => {
  console.log(`🎯 GHL Webhook Handler running on port ${PORT}`);
  console.log(`📨 Onboarding webhook: POST /webhook/ghl/onboarding`);
  console.log(`📨 Handover webhook: POST /webhook/ghl/handover`);
  console.log(`🏥 Health check: GET /webhook/health`);
});

export default app;