// Database types based on migration schema
export interface DatabaseClient {
  id: number;
  name: string;
  business_name: string;
  email: string;
  phone?: string;
  status: 'Complete' | 'Pending' | 'Inactive';
  pic?: string;
  total_sales: number;
  total_collection: number;
  balance: number;
  last_activity: string;
  invoice_count: number;
  registered_at: string;
  company?: string;
  address?: string;
  notes?: string;
  username?: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  status: 'Active' | 'Inactive';
  last_login?: string;
  client_id?: number;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseInvoice {
  id: string;
  client_id: number;
  package_name: string;
  amount: number;
  paid: number;
  due: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  created_at: string;
  updated_at: string;
}

export interface DatabasePayment {
  id: string;
  client_id: number;
  invoice_id: string;
  amount: number;
  payment_source: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paid_at: string;
  receipt_file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCalendarEvent {
  id: string;
  client_id: number;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  description?: string;
  type: 'meeting' | 'payment' | 'deadline' | 'call';
  created_at: string;
  updated_at: string;
}

export interface DatabaseComponent {
  id: string;
  client_id: number;
  invoice_id?: string;
  name: string;
  price: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProgressStep {
  id: string;
  client_id: number;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completed_date?: string;
  important: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProgressStepComment {
  id: string;
  step_id: string;
  text: string;
  username: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
}

export interface DatabaseChat {
  id: number;
  client_id: number;
  client_name: string;
  avatar: string;
  last_message?: string;
  last_message_at: string;
  unread_count: number;
  online: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChatMessage {
  id: number;
  chat_id: number;
  sender: 'client' | 'admin';
  content: string;
  message_type: string;
  created_at: string;
}

export interface DatabaseClientLink {
  id: string;
  client_id: number;
  title: string;
  url: string;
  created_at: string;
}

// Combined types for frontend use
export interface Client extends DatabaseClient {
  // Additional computed fields can be added here
}

export interface Invoice extends DatabaseInvoice {
  client?: Client;
}

export interface Payment extends DatabasePayment {
  client?: Client;
  invoice?: Invoice;
}

export interface CalendarEvent extends DatabaseCalendarEvent {
  client?: Client;
}

export interface Component extends DatabaseComponent {
  client?: Client;
}

export interface ProgressStep extends DatabaseProgressStep {
  client?: Client;
  comments?: DatabaseProgressStepComment[];
}

export interface Chat extends DatabaseChat {
  client?: Client;
  messages?: DatabaseChatMessage[];
}

export interface ChatMessage extends DatabaseChatMessage {
  chat?: Chat;
} 

export interface ClientLink extends DatabaseClientLink {
  client?: Client;
} 