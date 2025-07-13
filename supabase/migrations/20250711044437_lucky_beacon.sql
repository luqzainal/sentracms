/*
  # Initial Schema Setup for Sentra CMS

  1. New Tables
    - `clients` - Client information and business details
    - `users` - System users with role-based access
    - `invoices` - Invoice records linked to clients
    - `payments` - Payment records linked to invoices
    - `calendar_events` - Calendar events and appointments
    - `components` - Package components for clients
    - `progress_steps` - Progress tracking steps for clients
    - `chats` - Chat conversations with clients
    - `chat_messages` - Individual messages in chat conversations

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Super Admin: Full access to all data
    - Team: Access to all client data but limited user management
    - Client Admin: Full access to their organization's data
    - Client Team: Limited access to their organization's data

  3. Relationships
    - Foreign key constraints between related tables
    - Proper indexing for performance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Complete', 'Pending', 'Inactive')),
  pic TEXT,
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_collection DECIMAL(10,2) DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  last_activity DATE DEFAULT CURRENT_DATE,
  invoice_count INTEGER DEFAULT 0,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  company TEXT,
  address TEXT,
  notes TEXT,
  username TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Team', 'Client Admin', 'Client Team')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  last_login TIMESTAMPTZ,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY DEFAULT 'INV-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid DECIMAL(10,2) DEFAULT 0,
  due DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Partial', 'Pending', 'Overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY DEFAULT 'PAY-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Failed', 'Refunded')),
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  receipt_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY DEFAULT 'event-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'meeting' CHECK (type IN ('meeting', 'payment', 'deadline', 'call')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id TEXT PRIMARY KEY DEFAULT 'comp-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_steps table
CREATE TABLE IF NOT EXISTS progress_steps (
  id TEXT PRIMARY KEY DEFAULT 'step-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_date DATE,
  important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_step_comments table
CREATE TABLE IF NOT EXISTS progress_step_comments (
  id TEXT PRIMARY KEY DEFAULT 'comment-' || EXTRACT(EPOCH FROM NOW())::TEXT,
  step_id TEXT NOT NULL REFERENCES progress_steps(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  username TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  online BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client', 'admin')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_client_id ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_components_client_id ON components(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_steps_client_id ON progress_steps(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_step_comments_step_id ON progress_step_comments(step_id);
CREATE INDEX IF NOT EXISTS idx_chats_client_id ON chats(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_step_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Super Admin can access all clients"
  ON clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Super Admin'
    )
  );

CREATE POLICY "Team can access all clients"
  ON clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Team'
    )
  );

CREATE POLICY "Client Admin can access their client"
  ON clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Client Admin'
      AND users.client_id = clients.id
    )
  );

CREATE POLICY "Client Team can read their client"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Client Team'
      AND users.client_id = clients.id
    )
  );

-- RLS Policies for users table
CREATE POLICY "Super Admin can access all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role = 'Super Admin'
    )
  );

CREATE POLICY "Team can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('Team', 'Super Admin')
    )
  );

CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for invoices table
CREATE POLICY "Admin and Team can access all invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = invoices.client_id
    )
  );

-- RLS Policies for payments table
CREATE POLICY "Admin and Team can access all payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = payments.client_id
    )
  );

-- RLS Policies for calendar_events table
CREATE POLICY "Admin and Team can access all calendar events"
  ON calendar_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their calendar events"
  ON calendar_events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = calendar_events.client_id
    )
  );

-- RLS Policies for components table
CREATE POLICY "Admin and Team can access all components"
  ON components FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their components"
  ON components FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = components.client_id
    )
  );

-- RLS Policies for progress_steps table
CREATE POLICY "Admin and Team can access all progress steps"
  ON progress_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their progress steps"
  ON progress_steps FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = progress_steps.client_id
    )
  );

-- RLS Policies for progress_step_comments table
CREATE POLICY "Admin and Team can access all comments"
  ON progress_step_comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access comments on their steps"
  ON progress_step_comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN progress_steps ps ON ps.id = progress_step_comments.step_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('Client Admin', 'Client Team')
      AND u.client_id = ps.client_id
    )
  );

-- RLS Policies for chats table
CREATE POLICY "Admin and Team can access all chats"
  ON chats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their chats"
  ON chats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Client Admin', 'Client Team')
      AND users.client_id = chats.client_id
    )
  );

-- RLS Policies for chat_messages table
CREATE POLICY "Admin and Team can access all chat messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('Super Admin', 'Team')
    )
  );

CREATE POLICY "Client users can access their chat messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN chats c ON c.id = chat_messages.chat_id
      WHERE u.id = auth.uid() 
      AND u.role IN ('Client Admin', 'Client Team')
      AND u.client_id = c.client_id
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_steps_updated_at BEFORE UPDATE ON progress_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();