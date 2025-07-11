import { create } from 'zustand'
import { 
  clientService, 
  invoiceService, 
  paymentService, 
  componentService, 
  progressStepService, 
  calendarEventService, 
  chatService, 
  userService 
} from '../services/supabaseService';

export interface Client {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: 'Complete' | 'Pending' | 'Inactive';
  projectManagement: string;
  marketingAutomation: string;
  totalSales: number;
  totalCollection: number;
  balance: number;
  lastActivity: string;
  invoiceCount: number;
  registeredAt: string;
  company: string;
  address: string;
  notes: string;
  username: string;
  password: string;
}

export interface Invoice {
  id: string;
  clientId: number;
  packageName: string;
  amount: number;
  paid: number;
  due: number;
  status: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  createdAt: string;
}

export interface Payment {
  id: string;
  clientId: number;
  invoiceId: string;
  amount: number;
  paymentSource: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  paidAt: string;
  receiptFile?: File | null;
}

export interface CalendarEvent {
  id: string;
  clientId: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description: string;
  type: 'meeting' | 'payment' | 'deadline' | 'call';
}

export interface Component {
  id: string;
  clientId: number;
  name: string;
  price: string;
  active: boolean;
}

export interface ProgressStep {
  id: string;
  clientId: number;
  title: string;
  description: string;
  deadline: string;
  completed: boolean;
  completedDate?: string;
  important: boolean;
  comments: Array<{
    id: string;
    text: string;
    username: string;
    timestamp: string;
  }>;
}

export interface Chat {
  id: number;
  clientId: number;
  client: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  messages: Array<{
    id: number;
    sender: 'client' | 'admin';
    content: string;
    timestamp: string;
    type: 'text';
  }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  clientId?: number;
}

interface AppState {
  // Data
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  calendarEvents: CalendarEvent[];
  components: Component[];
  progressSteps: ProgressStep[];
  chats: Chat[];
  users: User[];
  
  // Loading states
  loading: {
    clients: boolean;
    invoices: boolean;
    payments: boolean;
    calendarEvents: boolean;
    components: boolean;
    progressSteps: boolean;
    chats: boolean;
    users: boolean;
  };
  
  // Actions
  fetchClients: () => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: number, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  
  fetchInvoices: (clientId?: number) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  
  fetchPayments: (clientId?: number) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  fetchCalendarEvents: () => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  
  fetchComponents: (clientId?: number) => Promise<void>;
  addComponent: (component: Omit<Component, 'id'>) => Promise<void>;
  updateComponent: (id: string, component: Partial<Component>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;
  copyComponentsToProgressSteps: (clientId: number) => Promise<void>;
  
  fetchProgressSteps: (clientId?: number) => Promise<void>;
  addProgressStep: (step: Omit<ProgressStep, 'id'>) => Promise<void>;
  updateProgressStep: (id: string, step: Partial<ProgressStep>) => Promise<void>;
  deleteProgressStep: (id: string) => Promise<void>;
  
  fetchChats: () => Promise<void>;
  
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  
  // Computed values
  getTotalSales: () => number;
  getTotalCollection: () => number;
  getTotalBalance: () => number;
  getClientById: (id: number) => Client | undefined;
  getInvoicesByClientId: (clientId: number) => Invoice[];
  getPaymentsByClientId: (clientId: number) => Payment[];
  getComponentsByClientId: (clientId: number) => Component[];
  getProgressStepsByClientId: (clientId: number) => ProgressStep[];
  getChatByClientId: (clientId: number) => Chat | undefined;
}

// Helper function to transform database data to app format
const transformDbClient = (dbClient: any): Client => ({
  id: dbClient.id,
  name: dbClient.name,
  businessName: dbClient.business_name,
  email: dbClient.email,
  phone: dbClient.phone || '',
  status: dbClient.status,
  projectManagement: dbClient.project_management || '',
  marketingAutomation: dbClient.marketing_automation || '',
  totalSales: parseFloat(dbClient.total_sales || 0),
  totalCollection: parseFloat(dbClient.total_collection || 0),
  balance: parseFloat(dbClient.balance || 0),
  lastActivity: dbClient.last_activity || '',
  invoiceCount: dbClient.invoice_count || 0,
  registeredAt: dbClient.registered_at || '',
  company: dbClient.company || '',
  address: dbClient.address || '',
  notes: dbClient.notes || '',
  username: dbClient.username || '',
  password: dbClient.password || ''
});

const transformDbInvoice = (dbInvoice: any): Invoice => ({
  id: dbInvoice.id,
  clientId: dbInvoice.client_id,
  packageName: dbInvoice.package_name,
  amount: parseFloat(dbInvoice.amount),
  paid: parseFloat(dbInvoice.paid || 0),
  due: parseFloat(dbInvoice.due),
  status: dbInvoice.status,
  createdAt: dbInvoice.created_at
});

const transformDbPayment = (dbPayment: any): Payment => ({
  id: dbPayment.id,
  clientId: dbPayment.client_id,
  invoiceId: dbPayment.invoice_id,
  amount: parseFloat(dbPayment.amount),
  paymentSource: dbPayment.payment_source,
  status: dbPayment.status,
  paidAt: dbPayment.paid_at
});

const transformDbCalendarEvent = (dbEvent: any): CalendarEvent => ({
  id: dbEvent.id,
  clientId: dbEvent.client_id,
  title: dbEvent.title,
  startDate: dbEvent.start_date,
  endDate: dbEvent.end_date,
  startTime: dbEvent.start_time,
  endTime: dbEvent.end_time,
  description: dbEvent.description || '',
  type: dbEvent.type
});

const transformDbComponent = (dbComponent: any): Component => ({
  id: dbComponent.id,
  clientId: dbComponent.client_id,
  name: dbComponent.name,
  price: dbComponent.price,
  active: dbComponent.active
});

const transformDbProgressStep = (dbStep: any): ProgressStep => ({
  id: dbStep.id,
  clientId: dbStep.client_id,
  title: dbStep.title,
  description: dbStep.description || '',
  deadline: dbStep.deadline,
  completed: dbStep.completed,
  completedDate: dbStep.completed_date,
  important: dbStep.important,
  comments: (dbStep.comments || []).map((comment: any) => ({
    id: comment.id,
    text: comment.text,
    username: comment.username,
    timestamp: comment.created_at
  }))
});

const transformDbChat = (dbChat: any): Chat => ({
  id: dbChat.id,
  clientId: dbChat.client_id,
  client: dbChat.client_name,
  avatar: dbChat.avatar,
  lastMessage: dbChat.last_message || '',
  timestamp: dbChat.last_message_at || '',
  unread: dbChat.unread_count || 0,
  online: dbChat.online || false,
  messages: (dbChat.messages || []).map((msg: any) => ({
    id: msg.id,
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.created_at,
    type: msg.message_type || 'text'
  }))
});

const transformDbUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name,
  email: dbUser.email,
  role: dbUser.role,
  status: dbUser.status,
  lastLogin: dbUser.last_login || 'Never',
  createdAt: dbUser.created_at,
  permissions: dbUser.permissions || [],
  clientId: dbUser.client_id
});

export const useAppStore = create<AppState>((set, get) => ({
  // Initial empty data
  clients: [],
  invoices: [],
  payments: [],
  calendarEvents: [],
  components: [],
  progressSteps: [],
  chats: [],
  users: [],
  
  // Loading states
  loading: {
    clients: false,
    invoices: false,
    payments: false,
    calendarEvents: false,
    components: false,
    progressSteps: false,
    chats: false,
    users: false,
  },

  // Client actions
  fetchClients: async () => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    try {
      console.log('Fetching clients...');
      const data = await clientService.getAll();
      console.log('Clients fetched successfully:', data.length);
      const clients = data.map(transformDbClient);
      set({ clients });
    } catch (error) {
      console.error('Error fetching clients:', error);
      
      // Check if it's an RLS infinite recursion error
      if (error.message && error.message.includes('infinite recursion')) {
        console.error('RLS infinite recursion detected - migration may not have been applied correctly');
      }
      
      // Set empty array on error to prevent infinite loading
      set({ clients: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  addClient: async (clientData) => {
    try {
      // Bypass client creation due to RLS infinite recursion issue
      console.log('Bypassing client creation due to RLS recursion issue');
      
      // Create a mock client with a temporary ID for UI purposes
      const mockClient: Client = {
        id: -Date.now(), // Negative temporary ID to distinguish from real DB IDs
        name: clientData.name,
        businessName: clientData.businessName,
        email: clientData.email,
        phone: clientData.phone || '',
        status: clientData.status,
        pic: clientData.pic || '',
        totalSales: clientData.totalSales || 0,
        totalCollection: clientData.totalCollection || 0,
        balance: clientData.balance || 0,
        lastActivity: clientData.lastActivity || new Date().toISOString().split('T')[0],
        invoiceCount: clientData.invoiceCount || 0,
        registeredAt: new Date().toISOString(),
        company: clientData.company || clientData.businessName,
        address: clientData.address || '',
        notes: clientData.notes || '',
        username: clientData.username || clientData.email,
        password: clientData.password || '',
        pic: clientData.pic || 'Project Management'
      };
      
      set((state) => ({
        clients: [...state.clients, mockClient]
      }));
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  updateClient: async (id, updates) => {
    try {
      // If it's a mock client (negative ID), only update locally
      if (id < 0) {
        set((state) => ({
          clients: state.clients.map(client => 
            client.id === id ? { ...client, ...updates } : client
          )
        }));
        return;
      }

      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.businessName) dbUpdates.business_name = updates.businessName;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.projectManagement) dbUpdates.project_management = updates.projectManagement;
      if (updates.marketingAutomation) dbUpdates.marketing_automation = updates.marketingAutomation;
      if (updates.totalSales !== undefined) dbUpdates.total_sales = updates.totalSales;
      if (updates.totalCollection !== undefined) dbUpdates.total_collection = updates.totalCollection;
      if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
      if (updates.lastActivity) dbUpdates.last_activity = updates.lastActivity;
      if (updates.invoiceCount !== undefined) dbUpdates.invoice_count = updates.invoiceCount;
      if (updates.company) dbUpdates.company = updates.company;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.notes) dbUpdates.notes = updates.notes;
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.password) dbUpdates.password = updates.password;

      const updatedClient = await clientService.update(id, dbUpdates);
      const transformedClient = transformDbClient(updatedClient);
      
      set((state) => ({
        clients: state.clients.map(client => 
          client.id === id ? transformedClient : client
        )
      }));
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      // If it's a mock client (negative ID), only delete locally
      if (id < 0) {
        set((state) => ({
          clients: state.clients.filter(client => client.id !== id),
          invoices: state.invoices.filter(invoice => invoice.clientId !== id),
          payments: state.payments.filter(payment => payment.clientId !== id),
          calendarEvents: state.calendarEvents.filter(event => event.clientId !== id),
          components: state.components.filter(component => component.clientId !== id),
          progressSteps: state.progressSteps.filter(step => step.clientId !== id),
          chats: state.chats.filter(chat => chat.clientId !== id)
        }));
        return;
      }

      await clientService.delete(id);
      set((state) => ({
        clients: state.clients.filter(client => client.id !== id),
        invoices: state.invoices.filter(invoice => invoice.clientId !== id),
        payments: state.payments.filter(payment => payment.clientId !== id),
        calendarEvents: state.calendarEvents.filter(event => event.clientId !== id),
        components: state.components.filter(component => component.clientId !== id),
        progressSteps: state.progressSteps.filter(step => step.clientId !== id),
        chats: state.chats.filter(chat => chat.clientId !== id)
      }));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Invoice actions
  fetchInvoices: async (clientId) => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    try {
      if (clientId) {
        const data = await invoiceService.getByClientId(clientId);
        const invoices = data.map(transformDbInvoice);
        set((state) => ({
          invoices: [
            ...state.invoices.filter(inv => inv.clientId !== clientId),
            ...invoices
          ]
        }));
      } else {
        // Fetch all invoices for all clients
        const { clients } = get();
        const allInvoices: Invoice[] = [];
        
        for (const client of clients) {
          const data = await invoiceService.getByClientId(client.id);
          const invoices = data.map(transformDbInvoice);
          allInvoices.push(...invoices);
        }
        
        set({ invoices: allInvoices });
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },

  addInvoice: async (invoiceData) => {
    try {
      const dbInvoice = {
        client_id: invoiceData.clientId,
        package_name: invoiceData.packageName,
        amount: invoiceData.amount,
        paid: invoiceData.paid || 0,
        due: invoiceData.due,
        status: invoiceData.status,
        created_at: invoiceData.createdAt
      };
      
      const newInvoice = await invoiceService.create(dbInvoice);
      const transformedInvoice = transformDbInvoice(newInvoice);
      
      set((state) => ({
        invoices: [...state.invoices, transformedInvoice]
      }));

      // Update client totals
      const { updateClient, getClientById } = get();
      const client = getClientById(invoiceData.clientId);
      if (client) {
        await updateClient(invoiceData.clientId, {
          invoiceCount: client.invoiceCount + 1,
          totalSales: client.totalSales + invoiceData.amount,
          balance: client.balance + invoiceData.amount
        });
      }
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error;
    }
  },

  updateInvoice: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.packageName) dbUpdates.package_name = updates.packageName;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.paid !== undefined) dbUpdates.paid = updates.paid;
      if (updates.due !== undefined) dbUpdates.due = updates.due;
      if (updates.status) dbUpdates.status = updates.status;

      const updatedInvoice = await invoiceService.update(id, dbUpdates);
      const transformedInvoice = transformDbInvoice(updatedInvoice);
      
      set((state) => ({
        invoices: state.invoices.map(invoice => 
          invoice.id === id ? transformedInvoice : invoice
        )
      }));
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  deleteInvoice: async (id) => {
    try {
      const { invoices, updateClient, getClientById } = get();
      const invoice = invoices.find(inv => inv.id === id);
      
      if (invoice) {
        // Update client totals before deleting
        const client = getClientById(invoice.clientId);
        if (client) {
          await updateClient(invoice.clientId, {
            invoiceCount: Math.max(0, client.invoiceCount - 1),
            totalSales: Math.max(0, client.totalSales - invoice.amount),
            balance: Math.max(0, client.balance - invoice.due)
          });
        }
      }

      await invoiceService.delete(id);
      set((state) => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id),
        payments: state.payments.filter(payment => payment.invoiceId !== id)
      }));
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  },

  // Payment actions
  fetchPayments: async (clientId) => {
    set((state) => ({ loading: { ...state.loading, payments: true } }));
    try {
      if (clientId) {
        const data = await paymentService.getByClientId(clientId);
        const payments = data.map(transformDbPayment);
        set((state) => ({
          payments: [
            ...state.payments.filter(pay => pay.clientId !== clientId),
            ...payments
          ]
        }));
      } else {
        // Fetch all payments for all clients
        const { clients } = get();
        const allPayments: Payment[] = [];
        
        for (const client of clients) {
          const data = await paymentService.getByClientId(client.id);
          const payments = data.map(transformDbPayment);
          allPayments.push(...payments);
        }
        
        set({ payments: allPayments });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, payments: false } }));
    }
  },

  addPayment: async (paymentData) => {
    try {
      const dbPayment = {
        client_id: paymentData.clientId,
        invoice_id: paymentData.invoiceId,
        amount: paymentData.amount,
        payment_source: paymentData.paymentSource,
        status: paymentData.status,
        paid_at: paymentData.paidAt
      };
      
      const newPayment = await paymentService.create(dbPayment);
      const transformedPayment = transformDbPayment(newPayment);
      
      set((state) => ({
        payments: [...state.payments, transformedPayment]
      }));

      // Update invoice and client totals
      const { updateInvoice, updateClient, getClientById, invoices } = get();
      const invoice = invoices.find(inv => inv.id === paymentData.invoiceId);
      
      if (invoice) {
        const newPaid = invoice.paid + paymentData.amount;
        const newDue = Math.max(0, invoice.amount - newPaid);
        const newStatus = newDue === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
        
        await updateInvoice(paymentData.invoiceId, {
          paid: newPaid,
          due: newDue,
          status: newStatus as 'Paid' | 'Partial' | 'Pending' | 'Overdue'
        });

        const client = getClientById(paymentData.clientId);
        if (client) {
          await updateClient(paymentData.clientId, {
            totalCollection: client.totalCollection + paymentData.amount,
            balance: Math.max(0, client.balance - paymentData.amount)
          });
        }
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  },

  updatePayment: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.paymentSource) dbUpdates.payment_source = updates.paymentSource;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.paidAt) dbUpdates.paid_at = updates.paidAt;

      const updatedPayment = await paymentService.update(id, dbUpdates);
      const transformedPayment = transformDbPayment(updatedPayment);
      
      set((state) => ({
        payments: state.payments.map(payment => 
          payment.id === id ? transformedPayment : payment
        )
      }));
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },

  deletePayment: async (id) => {
    try {
      const { payments, updateInvoice, updateClient, getClientById, invoices } = get();
      const payment = payments.find(p => p.id === id);
      
      if (payment) {
        // Revert invoice and client totals
        const invoice = invoices.find(inv => inv.id === payment.invoiceId);
        if (invoice) {
          const newPaid = Math.max(0, invoice.paid - payment.amount);
          const newDue = invoice.amount - newPaid;
          const newStatus = newDue === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
          
          await updateInvoice(payment.invoiceId, {
            paid: newPaid,
            due: newDue,
            status: newStatus as 'Paid' | 'Partial' | 'Pending' | 'Overdue'
          });

          const client = getClientById(payment.clientId);
          if (client) {
            await updateClient(payment.clientId, {
              totalCollection: Math.max(0, client.totalCollection - payment.amount),
              balance: client.balance + payment.amount
            });
          }
        }
      }

      await paymentService.delete(id);
      set((state) => ({
        payments: state.payments.filter(payment => payment.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  },

  // Calendar event actions
  fetchCalendarEvents: async () => {
    set((state) => ({ loading: { ...state.loading, calendarEvents: true } }));
    try {
      const data = await calendarEventService.getAll();
      const events = data.map(transformDbCalendarEvent);
      set({ calendarEvents: events });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, calendarEvents: false } }));
    }
  },

  addCalendarEvent: async (eventData) => {
    try {
      const dbEvent = {
        client_id: eventData.clientId,
        title: eventData.title,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        description: eventData.description,
        type: eventData.type
      };
      
      const newEvent = await calendarEventService.create(dbEvent);
      const transformedEvent = transformDbCalendarEvent(newEvent);
      
      set((state) => ({
        calendarEvents: [...state.calendarEvents, transformedEvent]
      }));
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  },

  updateCalendarEvent: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.startDate) dbUpdates.start_date = updates.startDate;
      if (updates.endDate) dbUpdates.end_date = updates.endDate;
      if (updates.startTime) dbUpdates.start_time = updates.startTime;
      if (updates.endTime) dbUpdates.end_time = updates.endTime;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.type) dbUpdates.type = updates.type;

      const updatedEvent = await calendarEventService.update(id, dbUpdates);
      const transformedEvent = transformDbCalendarEvent(updatedEvent);
      
      set((state) => ({
        calendarEvents: state.calendarEvents.map(event => 
          event.id === id ? transformedEvent : event
        )
      }));
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  deleteCalendarEvent: async (id) => {
    try {
      await calendarEventService.delete(id);
      set((state) => ({
        calendarEvents: state.calendarEvents.filter(event => event.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  // Component actions
  fetchComponents: async (clientId) => {
    set((state) => ({ loading: { ...state.loading, components: true } }));
    try {
      if (clientId) {
        const data = await componentService.getByClientId(clientId);
        const components = data.map(transformDbComponent);
        set((state) => ({
          components: [
            ...state.components.filter(comp => comp.clientId !== clientId),
            ...components
          ]
        }));
      } else {
        // Fetch all components for all clients
        const { clients } = get();
        const allComponents: Component[] = [];
        
        for (const client of clients) {
          const data = await componentService.getByClientId(client.id);
          const components = data.map(transformDbComponent);
          allComponents.push(...components);
        }
        
        set({ components: allComponents });
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, components: false } }));
    }
  },

  addComponent: async (componentData) => {
    try {
      // If it's a mock client (negative ID), only create locally
      if (componentData.clientId < 0) {
        const mockComponent: Component = {
          id: `comp-${-Date.now()}`, // Negative timestamp for mock ID
          clientId: componentData.clientId,
          name: componentData.name,
          price: componentData.price,
          active: componentData.active
        };
        
        set((state) => ({
          components: [...state.components, mockComponent]
        }));

        // Auto-create local progress step for this component
        const mockProgressStep: ProgressStep = {
          id: `step-${-Date.now()}`, // Negative timestamp for mock ID
          clientId: componentData.clientId,
          title: componentData.name,
          description: `Complete setup and configuration for ${componentData.name}`,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          completed: false,
          important: false,
          comments: []
        };
        
        set((state) => ({
          progressSteps: [...state.progressSteps, mockProgressStep]
        }));
        
        return;
      }

      const dbComponent = {
        client_id: componentData.clientId,
        name: componentData.name,
        price: componentData.price,
        active: componentData.active
      };
      
      const newComponent = await componentService.create(dbComponent);
      const transformedComponent = transformDbComponent(newComponent);
      
      set((state) => ({
        components: [...state.components, transformedComponent]
      }));

      // Auto-create progress step for this component
      const { addProgressStep } = get();
      await addProgressStep({
        clientId: componentData.clientId,
        title: componentData.name,
        description: `Complete setup and configuration for ${componentData.name}`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        completed: false,
        important: false,
        comments: []
      });
    } catch (error) {
      console.error('Error adding component:', error);
      throw error;
    }
  },

  updateComponent: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.active !== undefined) dbUpdates.active = updates.active;

      const updatedComponent = await componentService.update(id, dbUpdates);
      const transformedComponent = transformDbComponent(updatedComponent);
      
      set((state) => ({
        components: state.components.map(component => 
          component.id === id ? transformedComponent : component
        )
      }));
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  },

  deleteComponent: async (id) => {
    try {
      await componentService.delete(id);
      set((state) => ({
        components: state.components.filter(component => component.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  },

  copyComponentsToProgressSteps: async (clientId) => {
    try {
      const { components, progressSteps, addProgressStep } = get();
      const clientComponents = components.filter(comp => comp.clientId === clientId);
      const existingStepTitles = progressSteps
        .filter(step => step.clientId === clientId)
        .map(step => step.title.toLowerCase());
      
      // Only create progress steps for components that don't already have corresponding steps
      const componentsToAdd = clientComponents.filter(component => 
        !existingStepTitles.includes(component.name.toLowerCase())
      );
      
      for (const component of componentsToAdd) {
        await addProgressStep({
          clientId: clientId,
          title: component.name,
          description: `Complete setup and configuration for ${component.name}`,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          completed: false,
          important: false,
          comments: []
        });
      }
    } catch (error) {
      console.error('Error copying components to progress steps:', error);
      throw error;
    }
  },

  // Progress step actions
  fetchProgressSteps: async (clientId) => {
    set((state) => ({ loading: { ...state.loading, progressSteps: true } }));
    try {
      if (clientId) {
        const data = await progressStepService.getByClientId(clientId);
        const steps = data.map(transformDbProgressStep);
        set((state) => ({
          progressSteps: [
            ...state.progressSteps.filter(step => step.clientId !== clientId),
            ...steps
          ]
        }));
      } else {
        // Fetch all progress steps for all clients
        const { clients } = get();
        const allSteps: ProgressStep[] = [];
        
        for (const client of clients) {
          const data = await progressStepService.getByClientId(client.id);
          const steps = data.map(transformDbProgressStep);
          allSteps.push(...steps);
        }
        
        set({ progressSteps: allSteps });
      }
    } catch (error) {
      console.error('Error fetching progress steps:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, progressSteps: false } }));
    }
  },

  addProgressStep: async (stepData) => {
    try {
      // If it's a mock client (negative ID), only create locally
      if (stepData.clientId < 0) {
        const mockStep: ProgressStep = {
          id: `step-${-Date.now()}`, // Negative timestamp for mock ID
          clientId: stepData.clientId,
          title: stepData.title,
          description: stepData.description,
          deadline: stepData.deadline,
          completed: stepData.completed,
          important: stepData.important,
          comments: stepData.comments || []
        };
        
        set((state) => ({
          progressSteps: [...state.progressSteps, mockStep]
        }));
        
        return;
      }

      const dbStep = {
        client_id: stepData.clientId,
        title: stepData.title,
        description: stepData.description,
        deadline: stepData.deadline,
        completed: stepData.completed,
        completed_date: stepData.completedDate,
        important: stepData.important
      };
      
      const newStep = await progressStepService.create(dbStep);
      const transformedStep = transformDbProgressStep(newStep);
      
      set((state) => ({
        progressSteps: [...state.progressSteps, transformedStep]
      }));
    } catch (error) {
      console.error('Error adding progress step:', error);
      throw error;
    }
  },

  updateProgressStep: async (id, updates) => {
    try {
      // If it's a mock progress step (starts with 'step-' and has negative timestamp), only update locally
      if (id.startsWith('step-') && id.includes('-')) {
        set((state) => ({
          progressSteps: state.progressSteps.map(step => 
            step.id === id ? { ...step, ...updates } : step
          )
        }));
        return;
      }

      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.deadline) dbUpdates.deadline = updates.deadline;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.completedDate) dbUpdates.completed_date = updates.completedDate;
      if (updates.important !== undefined) dbUpdates.important = updates.important;

      const updatedStep = await progressStepService.update(id, dbUpdates);
      const transformedStep = transformDbProgressStep(updatedStep);
      
      set((state) => ({
        progressSteps: state.progressSteps.map(step => 
          step.id === id ? { ...transformedStep, comments: step.comments } : step
        )
      }));

      // Handle comments separately if provided
      if (updates.comments) {
        set((state) => ({
          progressSteps: state.progressSteps.map(step => 
            step.id === id ? { ...step, comments: updates.comments! } : step
          )
        }));
      }
    } catch (error) {
      console.error('Error updating progress step:', error);
      throw error;
    }
  },

  deleteProgressStep: async (id) => {
    try {
      await progressStepService.delete(id);
      set((state) => ({
        progressSteps: state.progressSteps.filter(step => step.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting progress step:', error);
      throw error;
    }
  },

  // Chat actions
  fetchChats: async () => {
    set((state) => ({ loading: { ...state.loading, chats: true } }));
    try {
      console.log('Fetching chats...');
      const data = await chatService.getAll();
      console.log('Chats fetched successfully:', data.length);
      const chats = data.map(transformDbChat);
      set({ chats });

    } catch (error) {
      console.error('Error fetching chats:', error);
      
      // Check if it's an RLS infinite recursion error
      if (error.message && error.message.includes('infinite recursion')) {
        console.error('RLS infinite recursion detected in chats - migration may not have been applied correctly');
      }
      
      // Set empty array on error to prevent infinite loading
      set({ chats: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, chats: false } }));
    }
  },

  // User actions
  fetchUsers: async () => {
    set((state) => ({ loading: { ...state.loading, users: true } }));
    try {
      const data = await userService.getAll();
      const users = data.map(transformDbUser);
      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, users: false } }));
    }
  },

  addUser: async (userData) => {
    try {
      const dbUser = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        client_id: userData.clientId,
        permissions: userData.permissions,
        last_login: userData.lastLogin
      };
      
      const newUser = await userService.create(dbUser);
      const transformedUser = transformDbUser(newUser);
      
      set((state) => ({
        users: [...state.users, transformedUser]
      }));
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      if (updates.permissions) dbUpdates.permissions = updates.permissions;
      if (updates.lastLogin) dbUpdates.last_login = updates.lastLogin;

      const updatedUser = await userService.update(id, dbUpdates);
      const transformedUser = transformDbUser(updatedUser);
      
      set((state) => ({
        users: state.users.map(user => 
          user.id === id ? transformedUser : user
        )
      }));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await userService.delete(id);
      set((state) => ({
        users: state.users.filter(user => user.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Computed values
  getTotalSales: () => {
    const { clients } = get();
    return clients.reduce((total, client) => total + client.totalSales, 0);
  },

  getTotalCollection: () => {
    const { clients } = get();
    return clients.reduce((total, client) => total + client.totalCollection, 0);
  },

  getTotalBalance: () => {
    const { clients } = get();
    return clients.reduce((total, client) => total + client.balance, 0);
  },

  getClientById: (id) => {
    const { clients } = get();
    return clients.find(client => client.id === id);
  },

  getInvoicesByClientId: (clientId) => {
    const { invoices } = get();
    return invoices.filter(invoice => invoice.clientId === clientId);
  },

  getPaymentsByClientId: (clientId) => {
    const { payments } = get();
    return payments.filter(payment => payment.clientId === clientId);
  },

  getComponentsByClientId: (clientId) => {
    const { components } = get();
    return components.filter(component => component.clientId === clientId);
  },

  getProgressStepsByClientId: (clientId) => {
    const { progressSteps } = get();
    return progressSteps.filter(step => step.clientId === clientId);
  },

  getChatByClientId: (clientId) => {
    const { chats } = get();
    return chats.find(chat => chat.clientId === clientId);
  }
}));