import { sql } from '../context/SupabaseContext';
import type { 
  Client, 
  DatabaseUser, 
  Invoice, 
  Payment, 
  CalendarEvent, 
  Component, 
  ProgressStep, 
  Chat, 
  ChatMessage,
  ClientLink
} from '../types/database';

// Helper function to check if database is available
const isDatabaseAvailable = () => {
  return sql !== null && sql !== undefined;
};

// Helper function to handle database unavailable scenario
const handleDatabaseUnavailable = (operation: string) => {
  console.warn(`Database not available for ${operation}. Using fallback.`);
  return [];
};

// Clients Services
export const clientsService = {
  async getAll(): Promise<Client[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll clients') as Client[];
    }
    try {
      const data = await sql!`
        SELECT * FROM clients
        ORDER BY created_at DESC
      `;
      return data as Client[];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<Client | null> {
    if (!isDatabaseAvailable()) {
      console.warn(`Database not available for getById client ${id}. Using fallback.`);
      return null;
    }
    try {
      const data = await sql!`
        SELECT * FROM clients
        WHERE id = ${id}
        LIMIT 1
      `;
      return data[0] as Client || null;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  async create(client: Partial<Client>): Promise<Client> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for creating client. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      // Stripped down to the absolute essential columns for debugging
      const data = await sql!`
        INSERT INTO clients (
          name, 
          business_name, 
          email, 
          phone,
          status,
          total_sales,
          total_collection,
          balance
        ) VALUES (
          ${client.name}, 
          ${client.business_name}, 
          ${client.email}, 
          ${client.phone},
          ${client.status || 'Pending'},
          ${client.total_sales || 0},
          ${client.total_collection || 0},
          ${client.balance || 0}
        )
        RETURNING *
      `;
      return data[0] as Client;
    } catch (error: any) {
      console.error('Detailed error creating client:', JSON.stringify(error, null, 2));
      if (error.body && error.body.message) {
        console.error('Error message from database:', error.body.message);
      }
      throw error;
    }
  },

  async update(id: number, updates: Partial<Client>): Promise<Client> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for updating client. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        UPDATE clients
        SET 
          name = COALESCE(${updates.name}, name),
          business_name = COALESCE(${updates.business_name}, business_name),
          email = COALESCE(${updates.email}, email),
          phone = COALESCE(${updates.phone}, phone),
          status = COALESCE(${updates.status}, status),
          total_sales = COALESCE(${updates.total_sales}, total_sales),
          total_collection = COALESCE(${updates.total_collection}, total_collection),
          balance = COALESCE(${updates.balance}, balance),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as Client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for deleting client. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        DELETE FROM clients
        WHERE id = ${id}
        RETURNING *
      `;
      if (data.length === 0) {
        throw new Error(`Client with id ${id} not found`);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};

// Users Services
export const usersService = {
  async authenticateUser(email: string, password: string): Promise<DatabaseUser | null> {
    try {
      // Only allow Super Admin authentication
      if (email === 'superadmin@sentra.com' && password === 'password123') {
        return {
          id: 'superadmin-user-id',
          name: 'Super Admin',
          email: 'superadmin@sentra.com',
          role: 'Super Admin',
          status: 'Active',
          last_login: new Date().toISOString(),
          client_id: undefined,
          permissions: ['all'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      // For future database integration, check the users table
      if (isDatabaseAvailable()) {
        try {
          const data = await sql!`
            SELECT u.*, c.username, c.password 
            FROM users u 
            LEFT JOIN clients c ON u.client_id = c.id 
            WHERE u.email = ${email} 
            LIMIT 1
          `;
          
          if (data.length > 0) {
            const user = data[0];
            // In a real system, you would hash the password and compare
            if (user.password === password) {
              return user as DatabaseUser;
            }
          }
        } catch (dbError) {
          console.log('Database not available, using demo mode');
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  async getAll(): Promise<DatabaseUser[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll users') as DatabaseUser[];
    }
    try {
      const data = await sql!`
        SELECT * FROM users
        ORDER BY created_at DESC
      `;
      return data as DatabaseUser[];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<DatabaseUser | null> {
    if (!isDatabaseAvailable()) {
      console.warn(`Database not available for getById user ${id}. Using fallback.`);
      return null;
    }
    try {
      const data = await sql!`
        SELECT * FROM users
        WHERE id = ${id}
        LIMIT 1
      `;
      return data[0] as DatabaseUser || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async create(user: Partial<DatabaseUser> & { password?: string }): Promise<DatabaseUser> {
    if (!sql) {
      throw new Error('Database not available');
    }
    
    try {
      console.log('🔍 Debug usersService.create - user data:', JSON.stringify(user, null, 2));
      
      if (user.password) {
        console.log('🔑 Creating user with password');
        const data = await sql!`
          INSERT INTO users (
            name, email, role, status, client_id, permissions, password
          ) VALUES (
            ${user.name}, ${user.email}, ${user.role}, 
            ${user.status || 'Active'}, ${user.client_id}, 
            ${user.permissions || []}, 
            crypt(${user.password}, gen_salt('bf'))
          )
          RETURNING *
        `;
        console.log('✅ User created successfully:', data[0]);
        return data[0] as DatabaseUser;
      } else {
        console.log('⚠️ Creating user without password');
        const data = await sql!`
          INSERT INTO users (
            name, email, role, status, client_id, permissions
          ) VALUES (
            ${user.name}, ${user.email}, ${user.role}, 
            ${user.status || 'Active'}, ${user.client_id}, 
            ${user.permissions || []}
          )
          RETURNING *
        `;
        console.log('✅ User created successfully:', data[0]);
        return data[0] as DatabaseUser;
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<DatabaseUser>): Promise<DatabaseUser> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for updating user. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        UPDATE users
        SET 
          name = COALESCE(${updates.name}, name),
          email = COALESCE(${updates.email}, email),
          role = COALESCE(${updates.role}, role),
          status = COALESCE(${updates.status}, status),
          client_id = COALESCE(${updates.client_id}, client_id),
          permissions = COALESCE(${updates.permissions}, permissions),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as DatabaseUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for deleting user. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      await sql!`
        DELETE FROM users
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

// Invoices Services
export const invoicesService = {
  async getAll(): Promise<Invoice[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll invoices') as Invoice[];
    }
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll ${service.replace("Service", "s")}') as any[];
    }
    try {
      const data = await sql!`
        SELECT 
          i.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        package_name: row.package_name,
        amount: row.amount,
        paid: row.paid,
        due: row.due,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as Invoice[];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  },

  async getByClientId(clientId: number): Promise<Invoice[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getByClientId invoices') as Invoice[];
    }
    try {
      const data = await sql!`
        SELECT 
          i.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.client_id = ${clientId}
        ORDER BY i.created_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        package_name: row.package_name,
        amount: row.amount,
        paid: row.paid,
        due: row.due,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as Invoice[];
    } catch (error) {
      console.error('Error fetching invoices for client:', error);
      throw error;
    }
  },

  async create(invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const data = await sql!`
        INSERT INTO invoices (
          client_id, package_name, amount, paid, due, status
        ) VALUES (
          ${invoice.client_id}, ${invoice.package_name}, 
          ${invoice.amount}, ${invoice.paid || 0}, 
          ${invoice.due}, ${invoice.status || 'Pending'}
        )
        RETURNING *
      `;
      return data[0] as Invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      const data = await sql!`
        UPDATE invoices
        SET 
          package_name = COALESCE(${updates.package_name}, package_name),
          amount = COALESCE(${updates.amount}, amount),
          paid = COALESCE(${updates.paid}, paid),
          due = COALESCE(${updates.due}, due),
          status = COALESCE(${updates.status}, status),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as Invoice;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await sql!`
        DELETE FROM invoices
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};

// Payments Services
export const paymentsService = {
  async getAll(): Promise<Payment[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll payments') as Payment[];
    }
    try {
      const data = await sql!`
        SELECT 
          p.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email,
          i.package_name as invoice_package_name,
          i.amount as invoice_amount
        FROM payments p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        ORDER BY p.created_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        invoice_id: row.invoice_id,
        amount: row.amount,
        payment_source: row.payment_source,
        status: row.status,
        paid_at: row.paid_at,
        receipt_file_url: row.receipt_file_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined,
        invoice: row.invoice_package_name ? {
          id: row.invoice_id,
          package_name: row.invoice_package_name,
          amount: row.invoice_amount
        } : undefined
      })) as Payment[];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  },

  async getByClientId(clientId: number): Promise<Payment[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getByClientId payments') as Payment[];
    }
    try {
      const data = await sql!`
        SELECT 
          p.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email,
          i.package_name as invoice_package_name,
          i.amount as invoice_amount
        FROM payments p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
        WHERE p.client_id = ${clientId}
        ORDER BY p.created_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        invoice_id: row.invoice_id,
        amount: row.amount,
        payment_source: row.payment_source,
        status: row.status,
        paid_at: row.paid_at,
        receipt_file_url: row.receipt_file_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined,
        invoice: row.invoice_package_name ? {
          id: row.invoice_id,
          package_name: row.invoice_package_name,
          amount: row.invoice_amount
        } : undefined
      })) as Payment[];
    } catch (error) {
      console.error('Error fetching payments for client:', error);
      throw error;
    }
  },

  async create(payment: Partial<Payment>): Promise<Payment> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for creating payment. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        INSERT INTO payments (
          client_id, invoice_id, amount, payment_source, status, paid_at
        ) VALUES (
          ${payment.client_id}, ${payment.invoice_id}, 
          ${payment.amount}, ${payment.payment_source}, 
          ${payment.status || 'Pending'}, ${payment.paid_at || new Date().toISOString()}
        )
        RETURNING *
      `;
      return data[0] as Payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Payment>): Promise<Payment> {
    try {
      const data = await sql!`
        UPDATE payments
        SET 
          amount = COALESCE(${updates.amount}, amount),
          payment_source = COALESCE(${updates.payment_source}, payment_source),
          status = COALESCE(${updates.status}, status),
          paid_at = COALESCE(${updates.paid_at}, paid_at),
          receipt_file_url = COALESCE(${updates.receipt_file_url}, receipt_file_url),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as Payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await sql!`
        DELETE FROM payments
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }
};

// Calendar Events Services
export const calendarService = {
  async getAll(): Promise<CalendarEvent[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll ${service.replace("Service", "s")}') as any[];
    }
    try {
      const data = await sql!`
        SELECT 
          e.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM calendar_events e
        LEFT JOIN clients c ON e.client_id = c.id
        ORDER BY e.start_date ASC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        title: row.title,
        start_date: row.start_date,
        end_date: row.end_date,
        start_time: row.start_time,
        end_time: row.end_time,
        description: row.description,
        type: row.type,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as CalendarEvent[];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  async getByClientId(clientId: number): Promise<CalendarEvent[]> {
    try {
      const data = await sql!`
        SELECT 
          e.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM calendar_events e
        LEFT JOIN clients c ON e.client_id = c.id
        WHERE e.client_id = ${clientId}
        ORDER BY e.start_date ASC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        title: row.title,
        start_date: row.start_date,
        end_date: row.end_date,
        start_time: row.start_time,
        end_time: row.end_time,
        description: row.description,
        type: row.type,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as CalendarEvent[];
    } catch (error) {
      console.error('Error fetching calendar events for client:', error);
      throw error;
    }
  },

  async create(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    if (!isDatabaseAvailable()) {
      throw new Error('Database not available');
    }
    try {
      const data = await sql!`
        INSERT INTO calendar_events (
          client_id, title, start_date, end_date, start_time, 
          end_time, description, type
        ) VALUES (
          ${event.client_id}, ${event.title}, ${event.start_date}, 
          ${event.end_date}, ${event.start_time}, ${event.end_time}, 
          ${event.description}, ${event.type || 'meeting'}
        )
        RETURNING *
      `;
      return data[0] as CalendarEvent;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const data = await sql!`
        UPDATE calendar_events
        SET 
          title = COALESCE(${updates.title}, title),
          start_date = COALESCE(${updates.start_date}, start_date),
          end_date = COALESCE(${updates.end_date}, end_date),
          start_time = COALESCE(${updates.start_time}, start_time),
          end_time = COALESCE(${updates.end_time}, end_time),
          description = COALESCE(${updates.description}, description),
          type = COALESCE(${updates.type}, type),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as CalendarEvent;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const result = await sql!`
        DELETE FROM calendar_events
        WHERE id = ${id}
        RETURNING *
      `;
      if (!result[0]) {
        throw new Error('Calendar event not found');
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }
};

// Components Services
export const componentsService = {
  async getAll(): Promise<Component[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll components') as Component[];
    }
    try {
      const data = await sql!`
        SELECT * FROM components
        ORDER BY created_at DESC
      `;
      return data as Component[];
    } catch (error) {
      console.error('Error fetching components:', error);
      throw error;
    }
  },

  async getByClientId(clientId: number): Promise<Component[]> {
    try {
      const data = await sql!`
        SELECT 
          comp.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM components comp
        LEFT JOIN clients c ON comp.client_id = c.id
        WHERE comp.client_id = ${clientId}
        ORDER BY comp.created_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        name: row.name,
        price: row.price,
        active: row.active,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as Component[];
    } catch (error) {
      console.error('Error fetching components for client:', error);
      throw error;
    }
  },

  async create(component: Partial<Component>): Promise<Component> {
    console.log('=== componentsService.create called ===');
    console.log('Raw component object:', component);
    console.log('component.client_id:', component.client_id);
    console.log('(component as any).clientId:', (component as any).clientId);
    console.log('component.invoice_id:', component.invoice_id);
    console.log('(component as any).invoiceId:', (component as any).invoiceId);
    
    try {
      const clientId = component.client_id || (component as any).clientId;
      const invoiceId = component.invoice_id || (component as any).invoiceId;
      const price = component.price || 0; // Default to 0 if price is not provided
      const active = component.active !== undefined ? component.active : true;
      
      console.log('Values to be inserted:');
      console.log('- clientId:', clientId);
      console.log('- invoiceId:', invoiceId);
      console.log('- name:', component.name);
      console.log('- price:', price);
      console.log('- active:', active);
      
      const data = await sql!`
        INSERT INTO components (
          client_id, invoice_id, name, price, active
        ) VALUES (
          ${clientId}, ${invoiceId}, ${component.name}, 
          ${price}, ${active}
        )
        RETURNING *
      `;
      console.log('Database insert result:', data[0]);
      return data[0] as Component;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Component>): Promise<Component> {
    try {
      const data = await sql!`
        UPDATE components
        SET 
          name = COALESCE(${updates.name}, name),
          price = COALESCE(${updates.price}, price),
          active = COALESCE(${updates.active}, active),
          invoice_id = COALESCE(${(updates as any).invoiceId}, invoice_id),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as Component;
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    console.log(`Attempting to delete component with ID: ${id}`);
    try {
      const result = await sql!`
        DELETE FROM components
        WHERE id = ${id}
        RETURNING *
      `;
      console.log(`Delete result:`, result);
      if (result.length === 0) {
        console.warn(`No component found with ID: ${id}`);
        throw new Error(`Component with id ${id} not found`);
      } else {
        console.log(`Successfully deleted component:`, result[0]);
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  }
};

// Progress Steps Services
export const progressService = {
  async getAll(): Promise<ProgressStep[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll progressSteps') as ProgressStep[];
    }
    try {
      const data = await sql!`
        SELECT * FROM progress_steps
        ORDER BY created_at ASC
      `;
      return data as ProgressStep[];
    } catch (error) {
      console.error('Error fetching all progress steps:', error);
      throw error;
    }
  },

  async getByClientId(clientId: number): Promise<ProgressStep[]> {
    try {
      const data = await sql!`
        SELECT 
          ps.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM progress_steps ps
        LEFT JOIN clients c ON ps.client_id = c.id
        WHERE ps.client_id = ${clientId}
        ORDER BY ps.deadline ASC
      `;
      
      // Get comments for each step
      const stepsWithComments = await Promise.all(
        data.map(async (row) => {
          const comments = await sql!`
            SELECT * FROM progress_step_comments
            WHERE step_id = ${row.id}
            ORDER BY created_at DESC
          `;
          
          return {
            id: row.id,
            client_id: row.client_id,
            title: row.title,
            description: row.description,
            deadline: row.deadline,
            completed: row.completed,
            completed_date: row.completed_date,
            important: row.important,
            created_at: row.created_at,
            updated_at: row.updated_at,
            client: row.client_name ? {
              id: row.client_id,
              name: row.client_name,
              business_name: row.client_business_name,
              email: row.client_email
            } : undefined,
            comments: comments || []
          };
        })
      );
      
      return stepsWithComments as ProgressStep[];
    } catch (error) {
      console.error('Error fetching progress steps for client:', error);
      throw error;
    }
  },

  async create(step: Partial<ProgressStep>): Promise<ProgressStep> {
    try {
      const data = await sql!`
        INSERT INTO progress_steps (
          client_id, title, description, deadline, completed, important
        ) VALUES (
          ${step.client_id}, ${step.title}, ${step.description}, 
          ${step.deadline}, ${step.completed || false}, ${step.important || false}
        )
        RETURNING *
      `;
      return data[0] as ProgressStep;
    } catch (error) {
      console.error('Error creating progress step:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<ProgressStep>): Promise<ProgressStep> {
    try {
      const data = await sql!`
        UPDATE progress_steps
        SET 
          title = COALESCE(${updates.title}, title),
          description = COALESCE(${updates.description}, description),
          deadline = COALESCE(${updates.deadline}, deadline),
          completed = COALESCE(${updates.completed}, completed),
          completed_date = COALESCE(${updates.completed_date}, completed_date),
          important = COALESCE(${updates.important}, important),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as ProgressStep;
    } catch (error) {
      console.error('Error updating progress step:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await sql!`
        DELETE FROM progress_steps
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting progress step:', error);
      throw error;
    }
  },

  async addComment(comment: { step_id: string; text: string; username: string; attachment_url?: string; attachment_type?: string; }): Promise<any> {
    try {
      const data = await sql!`
        INSERT INTO progress_step_comments (step_id, text, username, attachment_url, attachment_type)
        VALUES (${comment.step_id}, ${comment.text}, ${comment.username}, ${comment.attachment_url || null}, ${comment.attachment_type || null})
        RETURNING *
      `;
      return data[0];
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async deleteComment(id: string): Promise<void> {
    try {
      await sql!`
        DELETE FROM progress_step_comments
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};

// Chat Services
export const chatService = {
  async getAll(): Promise<Chat[]> {
    if (!sql) {
      // Mock data fallback
      return [
        {
          id: 1,
          client_id: 1,
          client_name: 'John Doe',
          avatar: 'JD',
          last_message: 'Hello, how is the project going?',
          last_message_at: new Date().toISOString(),
          unread_count: 2,
          online: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          client: {
            id: 1,
            name: 'John Doe',
            business_name: 'John Doe Business',
            email: 'john@example.com'
          }
        }
      ] as Chat[];
    }

    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll ${service.replace("Service", "s")}') as any[];
    }
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getAll ${service.replace("Service", "s")}') as any[];
    }
    try {
      const data = await sql!`
        SELECT 
          ch.*,
          c.name as client_name,
          c.business_name as client_business_name,
          c.email as client_email
        FROM chats ch
        LEFT JOIN clients c ON ch.client_id = c.id
        ORDER BY ch.last_message_at DESC
      `;
      return data.map((row: any) => ({
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name,
        avatar: row.avatar,
        last_message: row.last_message,
        last_message_at: row.last_message_at,
        unread_count: row.unread_count,
        online: row.online,
        created_at: row.created_at,
        updated_at: row.updated_at,
        client: row.client_name ? {
          id: row.client_id,
          name: row.client_name,
          business_name: row.client_business_name,
          email: row.client_email
        } : undefined
      })) as Chat[];
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  async getMessages(chatId: number): Promise<ChatMessage[]> {
    if (!sql) {
      // Mock messages fallback
      return [
        {
          id: 1,
          chat_id: chatId,
          sender: 'client',
          content: 'Hello, how is the project going?',
          message_type: 'text',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          chat_id: chatId,
          sender: 'admin',
          content: 'Hi! The project is progressing well. We are currently in the development phase.',
          message_type: 'text',
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ] as ChatMessage[];
    }

    try {
      const data = await sql!`
        SELECT * FROM chat_messages
        WHERE chat_id = ${chatId}
        ORDER BY created_at ASC
      `;
      return data as ChatMessage[];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  async sendMessage(message: {
    chat_id: number;
    sender: 'client' | 'admin';
    content: string;
    message_type?: string;
  }): Promise<ChatMessage> {
    if (!sql) {
      // Mock message creation
      const newMessage: ChatMessage = {
        id: Date.now(),
        chat_id: message.chat_id,
        sender: message.sender,
        content: message.content,
        message_type: message.message_type || 'text',
        created_at: new Date().toISOString()
      };
      
      // In a real app, this would trigger a store update
      return newMessage;
    }

    try {
      const data = await sql!`
        INSERT INTO chat_messages (
          chat_id, sender, content, message_type, created_at
        ) VALUES (
          ${message.chat_id}, ${message.sender}, 
          ${message.content}, ${message.message_type || 'text'}, NOW()
        )
        RETURNING *
      `;
      
      const newMessage = data[0] as ChatMessage;
      
      // Update chat last message
      await sql!`
        UPDATE chats 
        SET last_message = ${message.content}, 
            last_message_at = NOW(),
            unread_count = CASE 
              WHEN ${message.sender} = 'client' THEN unread_count + 1
              ELSE unread_count
            END
        WHERE id = ${message.chat_id}
      `;
      
      return newMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async markAsRead(chatId: number): Promise<void> {
    if (!sql) {
      // Mock - in real app this would update the store
      return;
    }

    try {
      await sql!`
        UPDATE chats 
        SET unread_count = 0 
        WHERE id = ${chatId}
      `;
    } catch (error) {
      console.error('Error marking chat as read:', error);
      throw error;
    }
  },

  async createChat(clientId: number): Promise<Chat> {
    if (!sql) {
      // Mock chat creation
      return {
        id: Date.now(),
        client_id: clientId,
        client_name: 'New Client',
        avatar: 'NC',
        last_message: undefined,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Chat;
    }

    try {
      // Get client info
      const clientData = await sql!`
        SELECT name, business_name, email FROM clients WHERE id = ${clientId}
      `;
      
      if (clientData.length === 0) {
        throw new Error('Client not found');
      }
      
      const client = clientData[0];
      const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
      
      const data = await sql!`
        INSERT INTO chats (
          client_id, client_name, avatar, last_message_at, unread_count, online, created_at, updated_at
        ) VALUES (
          ${clientId}, ${client.name}, ${initials}, NOW(), 0, false, NOW(), NOW()
        )
        RETURNING *
      `;
      
      return data[0] as Chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  async updateOnlineStatus(chatId: number, online: boolean): Promise<void> {
    if (!sql) {
      return;
    }

    try {
      await sql!`
        UPDATE chats 
        SET online = ${online}, updated_at = NOW()
        WHERE id = ${chatId}
      `;
    } catch (error) {
      console.error('Error updating online status:', error);
      throw error;
    }
  },

  async getUnreadCount(): Promise<number> {
    if (!sql) {
      return 0;
    }

    try {
      const data = await sql!`
        SELECT SUM(unread_count) as total_unread 
        FROM chats
      `;
      return data[0]?.total_unread || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  async deleteMessage(messageId: number): Promise<void> {
    if (!sql) {
      return;
    }

    try {
      await sql!`
        DELETE FROM chat_messages 
        WHERE id = ${messageId}
      `;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async updateChatOnlineStatus(chatId: number, online: boolean): Promise<void> {
    if (!isDatabaseAvailable()) {
      console.warn(`Database not available for updating chat status on chat ${chatId}.`);
      return;
    }
    try {
      await sql!`
        UPDATE chats
        SET online = ${online}, updated_at = NOW()
        WHERE id = ${chatId}
      `;
    } catch (error) {
      console.error('Error updating chat online status:', error);
      throw error;
    }
  },

  async updateChat(id: number, updates: Partial<Chat>): Promise<Chat> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for updating chat. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }

    try {
      const data = await sql!`
        UPDATE chats 
        SET client_name = COALESCE(${updates.client_name}, client_name),
            avatar = COALESCE(${updates.avatar}, avatar),
            last_message = COALESCE(${updates.last_message}, last_message),
            last_message_at = COALESCE(${updates.last_message_at}, last_message_at),
            unread_count = COALESCE(${updates.unread_count}, unread_count),
            online = COALESCE(${updates.online}, online),
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return data[0] as Chat;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  },

  async getStats() {
    if (!sql) {
      return {
        totalChats: 1,
        totalMessages: 10,
        totalUnread: 2,
        activeChats: 1
      };
    }

    try {
      const [chatsData, messagesData, unreadData, activeData] = await Promise.all([
        sql`SELECT COUNT(*) as total FROM chats`,
        sql`SELECT COUNT(*) as total FROM chat_messages`,
        sql`SELECT SUM(unread_count) as total FROM chats`,
        sql`SELECT COUNT(*) as total FROM chats WHERE online = true`
      ]);

      return {
        totalChats: parseInt(chatsData[0]?.total || '0'),
        totalMessages: parseInt(messagesData[0]?.total || '0'),
        totalUnread: parseInt(unreadData[0]?.total || '0'),
        activeChats: parseInt(activeData[0]?.total || '0')
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return {
        totalChats: 0,
        totalMessages: 0,
        totalUnread: 0,
        activeChats: 0
      };
    }
  }
};

// Dashboard Services
export const dashboardService = {
  async getStats() {
    try {
      const [clients, invoices, payments, events] = await Promise.all([
        clientsService.getAll(),
        invoicesService.getAll(),
        paymentsService.getAll(),
        calendarService.getAll()
      ]);

      return {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'Complete').length,
        pendingClients: clients.filter(c => c.status === 'Pending').length,
        totalRevenue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        totalPaid: payments.reduce((sum, pay) => sum + pay.amount, 0),
        outstandingAmount: invoices.reduce((sum, inv) => sum + inv.due, 0),
        todaysEvents: events.filter(e => e.start_date === new Date().toISOString().split('T')[0]),
        recentClients: clients.slice(0, 5),
        recentInvoices: invoices.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}; 

// Client Links Services
export const clientLinksService = {
  async getByClientId(clientId: number): Promise<ClientLink[]> {
    if (!isDatabaseAvailable()) {
      return handleDatabaseUnavailable('getByClientId clientLinks') as ClientLink[];
    }
    try {
      const data = await sql!`
        SELECT * FROM client_links
        WHERE client_id = ${clientId}
        ORDER BY created_at DESC
      `;
      return data as ClientLink[];
    } catch (error) {
      console.error('Error fetching client links:', error);
      throw error;
    }
  },

  async create(link: Partial<ClientLink>): Promise<ClientLink> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for creating client link. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        INSERT INTO client_links (
          client_id, title, url
        ) VALUES (
          ${link.client_id}, ${link.title}, ${link.url}
        )
        RETURNING *
      `;
      return data[0] as ClientLink;
    } catch (error) {
      console.error('Error creating client link:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isDatabaseAvailable()) {
      console.error('Database not available for deleting client link. Cannot proceed.');
      throw new Error('Database connection not available. Please check your configuration.');
    }
    try {
      const data = await sql!`
        DELETE FROM client_links
        WHERE id = ${id}
        RETURNING *
      `;
      if (data.length === 0) {
        throw new Error(`Link with id ${id} not found`);
      }
    } catch (error) {
      console.error('Error deleting client link:', error);
      throw error;
    }
  }
}; 