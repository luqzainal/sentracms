import { supabase } from '../lib/supabase';

// Client services
export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  },

  async create(client: any) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, updates: any) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Invoice services
export const invoiceService = {
  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(invoice: any) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Payment services
export const paymentService = {
  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(payment: any) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Component services
export const componentService = {
  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(component: any) {
    const { data, error } = await supabase
      .from('components')
      .insert(component)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('components')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Progress step services
export const progressStepService = {
  async getByClientId(clientId: number) {
    const { data, error } = await supabase
      .from('progress_steps')
      .select(`
        *,
        comments:progress_step_comments(*)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(step: any) {
    const { data, error } = await supabase
      .from('progress_steps')
      .insert(step)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('progress_steps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('progress_steps')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async addComment(stepId: string, comment: any) {
    const { data, error } = await supabase
      .from('progress_step_comments')
      .insert({
        step_id: stepId,
        ...comment
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from('progress_step_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
  }
};

// Calendar event services
export const calendarEventService = {
  async getAll() {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(event: any) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Chat services
export const chatService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages:chat_messages(*)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in chatService.getAll:', error);
      if (error.message && error.message.includes('infinite recursion')) {
        console.error('RLS infinite recursion detected in chat service');
      }
      return [];
    }
  },

  async getByClientId(clientId: number) {
    // Bypass due to RLS infinite recursion issue
    console.log('Chat service bypassed due to RLS recursion');
    return null;
  },

  async sendMessage(chatId: number, message: any) {
    // Bypass due to RLS infinite recursion issue
    console.log('Send message bypassed due to RLS recursion');
    return null;
  }
};

// Tag services
export const tagService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(tag: any) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User services
export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(user: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};