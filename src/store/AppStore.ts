import { create } from 'zustand';
// Removed imports for supabaseService, as it's no longer used
// import { clientService, invoiceService, paymentService, componentService, progressStepService, calendarEventService, chatService, tagService, userService } from '../services/supabaseService';

interface Client {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: string;
  packageName?: string;
  tags?: string[];
  totalSales: number;
  totalCollection: number;
  balance: number;
  lastActivity: string;
  invoiceCount: number;
  registeredAt: string;
  company?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  clientId: number;
  packageName: string;
  amount: number;
  paid: number;
  due: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  clientId: number;
  invoiceId: string;
  amount: number;
  paymentSource: string;
  status: string;
  paidAt: string;
  receiptFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Component {
  id: string;
  clientId: number;
  name: string;
  price: string;
  active: boolean;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressStep {
  id: string;
  clientId: number;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completedDate?: string;
  important: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

interface CalendarEvent {
  id: string;
  clientId: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  id: number;
  clientId: number;
  client: string;
  avatar: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread_count: number;
  online: boolean;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  messageType: string;
  timestamp: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  clientId?: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Data
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  components: Component[];
  progressSteps: ProgressStep[];
  calendarEvents: CalendarEvent[];
  chats: Chat[];
  tags: Tag[];
  users: User[];

  // Loading states
  loading: {
    clients: boolean;
    invoices: boolean;
    payments: boolean;
    components: boolean;
    progressSteps: boolean;
    calendarEvents: boolean;
    chats: boolean;
    tags: boolean;
    users: boolean;
  };

  // Actions
  fetchClients: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchComponents: () => Promise<void>;
  fetchProgressSteps: () => Promise<void>;
  fetchCalendarEvents: () => Promise<void>;
  fetchChats: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchUsers: () => Promise<void>;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: number, updates: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  getClientById: (id: number) => Client | undefined;

  addInvoice: (invoiceData: { clientId: number; packageName: string; amount: number; invoiceDate: string }) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  getInvoicesByClientId: (clientId: number) => Invoice[];

  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByClientId: (clientId: number) => Payment[];

  addComponent: (component: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addComponents: (components: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  getComponentsByClientId: (clientId: number) => Component[];
  getComponentsByInvoiceId: (invoiceId: string) => Component[];

  addProgressStep: (step: Omit<ProgressStep, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProgressStep: (id: string, updates: Partial<ProgressStep>) => void;
  deleteProgressStep: (id: string) => void;
  getProgressStepsByClientId: (clientId: number) => ProgressStep[];

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  copyComponentsToProgressSteps: (clientId: number) => void;

  // Computed values
  getTotalSales: () => number;
  getTotalCollection: () => number;
  getTotalBalance: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  clients: [
    {
      id: 1,
      name: 'Nik Salwani Bt.Nik Ab Rahman',
      businessName: 'Ahmad Tech Solutions',
      email: 'client@sentra.com',
      phone: '+60 12-345 6789',
      status: 'Complete',
      packageName: undefined,
      tags: ['VIP', 'Priority'],
      totalSales: 15000,
      totalCollection: 12000,
      balance: 3000,
      lastActivity: new Date().toISOString().split('T')[0],
      invoiceCount: 2,
      registeredAt: '2024-01-15T00:00:00Z',
      company: 'Ahmad Tech Solutions',
      address: 'Kuala Lumpur, Malaysia',
      notes: 'Demo client for testing',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      businessName: 'Johnson Enterprises',
      email: 'sarah@johnson.com',
      phone: '+60 12-987 6543',
      status: 'Pending',
      packageName: undefined,
      tags: ['New Client'],
      totalSales: 8000,
      totalCollection: 5000,
      balance: 3000,
      lastActivity: new Date().toISOString().split('T')[0],
      invoiceCount: 1,
      registeredAt: '2024-02-01T00:00:00Z',
      company: 'Johnson Enterprises',
      address: 'Petaling Jaya, Malaysia',
      notes: 'New client onboarding',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  invoices: [
    {
      id: 'INV-001',
      clientId: 1,
      packageName: 'Kuasa 360',
      amount: 15000,
      paid: 12000,
      due: 3000,
      status: 'Partial',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'INV-002',
      clientId: 2,
      packageName: 'Basic Package',
      amount: 8000,
      paid: 5000,
      due: 3000,
      status: 'Partial',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  payments: [
    {
      id: 'PAY-001',
      clientId: 1,
      invoiceId: 'INV-001',
      amount: 12000,
      paymentSource: 'Online Transfer',
      status: 'Paid',
      paidAt: '2024-01-20T00:00:00Z',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PAY-002',
      clientId: 2,
      invoiceId: 'INV-002',
      amount: 5000,
      paymentSource: 'Bank Transfer',
      status: 'Paid',
      paidAt: '2024-02-05T00:00:00Z',
      createdAt: '2024-02-05T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  components: [
    {
      id: 'comp-001',
      clientId: 1,
      name: 'Website Development',
      price: 'RM 5,000',
      active: true,
      invoiceId: 'INV-001',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'comp-002',
      clientId: 1,
      name: 'Mobile App Development',
      price: 'RM 8,000',
      active: true,
      invoiceId: 'INV-001',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'comp-003',
      clientId: 1,
      name: 'SEO Optimization',
      price: 'RM 2,000',
      active: true,
      invoiceId: 'INV-001',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  progressSteps: [
    {
      id: 'step-001',
      clientId: 1,
      title: 'Initial Consultation',
      description: 'Meet with client to understand requirements',
      deadline: '2024-01-20T10:00:00Z',
      completed: true,
      completedDate: '2024-01-18',
      important: true,
      comments: [
        {
          id: 'comment-001',
          text: 'Great meeting! Client has clear vision.',
          username: 'Project Manager',
          timestamp: '2024-01-18T14:30:00Z'
        }
      ],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'step-002',
      clientId: 1,
      title: 'Design Phase',
      description: 'Create wireframes and mockups',
      deadline: '2024-02-01T17:00:00Z',
      completed: true,
      completedDate: '2024-01-30',
      important: false,
      comments: [],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'step-003',
      clientId: 1,
      title: 'Development Phase',
      description: 'Build the application according to specifications',
      deadline: '2024-03-15T17:00:00Z',
      completed: false,
      important: true,
      comments: [
        {
          id: 'comment-002',
          text: 'Development is progressing well. 60% complete.',
          username: 'Lead Developer',
          timestamp: '2024-02-15T09:00:00Z'
        }
      ],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  calendarEvents: [
    {
      id: 'event-001',
      clientId: 1,
      title: 'Project Kickoff Meeting',
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      startTime: '10:00',
      endTime: '11:30',
      description: 'Initial project discussion and planning',
      type: 'meeting',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'event-002',
      clientId: 1,
      title: 'Design Review',
      startDate: '2024-02-05',
      endDate: '2024-02-05',
      startTime: '14:00',
      endTime: '15:00',
      description: 'Review and approve design mockups',
      type: 'meeting',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  chats: [
    {
      id: 1,
      clientId: 1,
      client: 'Ahmad Tech Solutions',
      avatar: 'AT',
      lastMessage: 'Thank you for the project update',
      lastMessageAt: '2024-01-20T10:30:00Z',
      unread_count: 2, // Changed from 'unread' to 'unread_count' to match DB schema
      online: true,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Hi! I want to check our project progress.',
          messageType: 'text',
          timestamp: '10:15 AM'
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Hello! The project is going well. We\'ve completed the design phase and are now moving to development.',
          messageType: 'text',
          timestamp: '10:18 AM'
        },
        {
          id: 3,
          sender: 'client',
          content: 'Great! Can you share some screenshots?',
          messageType: 'text',
          timestamp: '10:20 AM'
        },
        {
          id: 4,
          sender: 'admin',
          content: 'Sure! I\'ll send them shortly. The UI looks very clean and modern.',
          messageType: 'text',
          timestamp: '10:22 AM'
        },
        {
          id: 5,
          sender: 'client',
          content: 'Thank you for the project update',
          messageType: 'text',
          timestamp: '10:30 AM'
        }
      ],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      clientId: 2,
      client: 'Johnson Enterprises',
      avatar: 'JE',
      lastMessage: 'Looking forward to getting started!',
      lastMessageAt: '2024-02-01T15:45:00Z',
      unread_count: 0, // Changed from 'unread' to 'unread_count' to match DB schema
      online: false,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Hello! I\'m excited about our new project.',
          messageType: 'text',
          timestamp: '3:30 PM'
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Welcome! We\'re excited to work with you. Let\'s schedule a kickoff meeting.',
          messageType: 'text',
          timestamp: '3:35 PM'
        },
        {
          id: 3,
          sender: 'client',
          content: 'Looking forward to getting started!',
          messageType: 'text',
          timestamp: '3:45 PM'
        }
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  tags: [
    {
      id: 'tag-001',
      name: 'VIP',
      color: '#FFD700',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tag-002',
      name: 'Priority',
      color: '#FF6B6B',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'tag-003',
      name: 'New Client',
      color: '#4ECDC4',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  users: [
    {
      id: 'user-001',
      name: 'Admin User',
      email: 'admin@sentra.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '2024-01-20T08:00:00Z',
      permissions: ['all'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-002',
      name: 'Nik Salwani Bt.Nik Ab Rahman',
      email: 'client@sentra.com',
      role: 'Client Admin',
      status: 'Active',
      lastLogin: '2024-01-19T14:30:00Z',
      clientId: 1,
      permissions: ['client_dashboard', 'client_profile', 'client_messages'],
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'user-003',
      name: 'Team Member',
      email: 'team@sentra.com',
      role: 'Team',
      status: 'Active',
      lastLogin: '2024-01-20T09:15:00Z',
      permissions: ['clients', 'calendar', 'chat', 'reports', 'dashboard'],
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ],

  loading: {
    clients: false,
    invoices: false,
    payments: false,
    components: false,
    progressSteps: false,
    calendarEvents: false,
    chats: false,
    tags: false,
    users: false,
  },

  // Actions
  fetchClients: async () => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, clients: false } }));
  },

  fetchInvoices: async () => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, invoices: false } }));
  },

  fetchPayments: async () => {
    set((state) => ({ loading: { ...state.loading, payments: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, payments: false } }));
  },

  fetchComponents: async () => {
    set((state) => ({ loading: { ...state.loading, components: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, components: false } }));
  },

  fetchProgressSteps: async () => {
    set((state) => ({ loading: { ...state.loading, progressSteps: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, progressSteps: false } }));
  },

  fetchCalendarEvents: async () => {
    set((state) => ({ loading: { ...state.loading, calendarEvents: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, calendarEvents: false } }));
  },

  fetchChats: async () => {
    set((state) => ({ loading: { ...state.loading, chats: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, chats: false } }));
  },

  fetchTags: async () => {
    set((state) => ({ loading: { ...state.loading, tags: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, tags: false } }));
  },

  fetchUsers: async () => {
    set((state) => ({ loading: { ...state.loading, users: true } }));
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    set((state) => ({ loading: { ...state.loading, users: false } }));
  },

  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      clients: [...state.clients, newClient],
    }));
  },

  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((client) =>
        client.id === id
          ? { ...client, ...updates, updatedAt: new Date().toISOString() }
          : client
      ),
    }));
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((client) => client.id !== id),
      invoices: state.invoices.filter((invoice) => invoice.clientId !== id),
      payments: state.payments.filter((payment) => payment.clientId !== id),
      components: state.components.filter((component) => component.clientId !== id),
      progressSteps: state.progressSteps.filter((step) => step.clientId !== id),
      calendarEvents: state.calendarEvents.filter((event) => event.clientId !== id),
      chats: state.chats.filter((chat) => chat.clientId !== id),
    }));
  },

  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  addInvoice: (invoiceData) => {
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      clientId: invoiceData.clientId,
      packageName: invoiceData.packageName,
      amount: invoiceData.amount,
      paid: 0,
      due: invoiceData.amount,
      status: 'Pending',
      createdAt: invoiceData.invoiceDate,
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      invoices: [...state.invoices, newInvoice],
      clients: state.clients.map((client) =>
        client.id === invoiceData.clientId
          ? {
              ...client,
              packageName: invoiceData.packageName, // Update client's package name
              totalSales: client.totalSales + invoiceData.amount,
              balance: client.balance + invoiceData.amount,
              invoiceCount: client.invoiceCount + 1,
              // Auto-assign the package tag to the client
              tags: client.tags && client.tags.includes(invoiceData.packageName) 
                ? client.tags 
                : [...(client.tags || []), invoiceData.packageName],
              updatedAt: new Date().toISOString(),
            }
          : client
      ),
      // Auto-create tag with package name if it doesn't exist
      tags: state.tags.some(tag => tag.name === invoiceData.packageName) 
        ? state.tags 
        : [...state.tags, {
            id: `tag-${Date.now()}`,
            name: invoiceData.packageName,
            color: '#3B82F6', // Default blue color
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }]
    }));
  },

  updateInvoice: (id, updates) => {
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.id === id
          ? { ...invoice, ...updates, updatedAt: new Date().toISOString() }
          : invoice
      ),
    }));
  },

  deleteInvoice: (invoiceId) => {
    const state = get();
    const invoice = state.invoices.find(inv => inv.id === invoiceId);
    
    if (invoice) {
      // Find and delete the main package component that matches the invoice package name
      const packageComponent = state.components.find(comp => 
        comp.clientId === invoice.clientId && comp.name === invoice.packageName
      );
      
      set((state) => ({
        invoices: state.invoices.filter((inv) => inv.id !== invoiceId),
        // Update client totals
        clients: state.clients.map((client) =>
          client.id === payment.clientId
            ? {
                ...client,
                totalCollection: Math.max(0, client.totalCollection - payment.amount),
                balance: client.balance + payment.amount,
                updatedAt: new Date().toISOString(),
              }
            : client
        ),
        // Update invoice totals
        invoices: state.invoices.map((invoice) =>
          invoice.id === payment.invoiceId
            ? {
                ...invoice,
                paid: Math.max(0, invoice.paid - payment.amount),
                due: invoice.due + payment.amount,
                status: invoice.due + payment.amount > 0 ? 'Partial' : 'Paid',
                updatedAt: new Date().toISOString(),
              }
            : invoice
        ),
        // Remove the main package component and all child components for this client
    }
        components: packageComponent 
          ? state.components.filter((comp) => comp.clientId !== invoice.clientId)
          : state.components,
        clients: state.clients.map((client) =>
          client.id === invoice.clientId
            ? {
                ...client,
                totalSales: Math.max(0, client.totalSales - invoice.amount),
                balance: Math.max(0, client.balance - invoice.amount),
                invoiceCount: Math.max(0, client.invoiceCount - 1),
                // Clear package name if this was the package component
                packageName: packageComponent ? undefined : client.packageName,
                updatedAt: new Date().toISOString(),
              }
            : client
        ),
      }));
    }
  },

  getInvoicesByClientId: (clientId) => {
    return get().invoices.filter((invoice) => invoice.clientId === clientId);
  },

  addPayment: (paymentData) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `PAY-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      payments: [...state.payments, newPayment],
      clients: state.clients.map((client) =>
        client.id === paymentData.clientId
          ? {
              ...client,
              totalCollection: client.totalCollection + paymentData.amount,
              balance: Math.max(0, client.balance - paymentData.amount),
              updatedAt: new Date().toISOString(),
            }
          : client
      ),
      invoices: state.invoices.map((invoice) =>
        invoice.id === paymentData.invoiceId
          ? {
              ...invoice,
              paid: invoice.paid + paymentData.amount,
              due: Math.max(0, invoice.due - paymentData.amount),
              status: invoice.due - paymentData.amount <= 0 ? 'Paid' : 'Partial',
              updatedAt: new Date().toISOString(),
            }
          : invoice
      ),
    }));
  },

  updatePayment: (id, updates) => {
    const state = get();
    const payment = state.payments.find(p => p.id === id);
    const oldAmount = payment ? payment.amount : 0;
    const newAmount = updates.amount || oldAmount;
    const amountDifference = newAmount - oldAmount;
    
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id
          ? { ...payment, ...updates, updatedAt: new Date().toISOString() }
          : payment
      ),
      // Update client totals
      clients: payment ? state.clients.map((client) =>
        client.id === payment.clientId
          ? {
              ...client,
              totalCollection: client.totalCollection + amountDifference,
              balance: Math.max(0, client.balance - amountDifference),
              updatedAt: new Date().toISOString(),
            }
          : client
      ) : state.clients,
      // Update invoice totals
      invoices: payment ? state.invoices.map((invoice) =>
        invoice.id === payment.invoiceId
          ? {
              ...invoice,
              paid: invoice.paid + amountDifference,
              due: Math.max(0, invoice.due - amountDifference),
              status: (invoice.due - amountDifference) <= 0 ? 'Paid' : 'Partial',
              updatedAt: new Date().toISOString(),
            }
          : invoice
      ) : state.invoices,
    }));
  },

  deletePayment: (id) => {
    const state = get();
    const payment = state.payments.find(p => p.id === id);
    
    if (payment) {
    set((state) => ({
      payments: state.payments.filter((payment) => payment.id !== id),
    }));
  },

  getPaymentsByClientId: (clientId) => {
    return get().payments.filter((payment) => payment.clientId === clientId);
  },

  addComponent: (componentData) => {
    const newComponent: Component = {
      ...componentData,
      id: `comp-${Date.now()}`,
      price: componentData.price || 'RM 0',
      active: componentData.active !== undefined ? componentData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      components: [...state.components, newComponent],
    }));
  },

  addComponents: (componentsData) => {
    const newComponents: Component[] = componentsData.map((componentData, index) => ({
      ...componentData,
      id: `comp-${Date.now()}-${index}`,
      price: componentData.price || 'RM 0',
      active: componentData.active !== undefined ? componentData.active : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    set((state) => ({
      components: [...state.components, ...newComponents],
    }));
  },
  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((component) =>
        component.id === id
          ? { ...component, ...updates, updatedAt: new Date().toISOString() }
          : component
      ),
    }));
  },

  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((component) => component.id !== id),
    }));
  },

  getComponentsByClientId: (clientId) => {
    return get().components.filter((component) => component.clientId === clientId);
  },

  getComponentsByInvoiceId: (invoiceId) => {
    return get().components.filter((component) => component.invoiceId === invoiceId);
  },

  addProgressStep: (stepData) => {
    const newStep: ProgressStep = {
      ...stepData,
      id: `step-${Date.now()}`,
      comments: stepData.comments || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      progressSteps: [...state.progressSteps, newStep],
    }));
  },

  updateProgressStep: (id, updates) => {
    set((state) => ({
      progressSteps: state.progressSteps.map((step) =>
        step.id === id
          ? { ...step, ...updates, updatedAt: new Date().toISOString() }
          : step
      ),
    }));
  },

  deleteProgressStep: (id) => {
    set((state) => ({
      progressSteps: state.progressSteps.filter((step) => step.id !== id),
    }));
  },

  getProgressStepsByClientId: (clientId) => {
    return get().progressSteps.filter((step) => step.clientId === clientId);
  },

  addCalendarEvent: (eventData) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      calendarEvents: [...state.calendarEvents, newEvent],
    }));
  },

  updateCalendarEvent: (id, updates) => {
    set((state) => ({
      calendarEvents: state.calendarEvents.map((event) =>
        event.id === id
          ? { ...event, ...updates, updatedAt: new Date().toISOString() }
          : event
      ),
    }));
  },

  deleteCalendarEvent: (id) => {
    set((state) => ({
      calendarEvents: state.calendarEvents.filter((event) => event.id !== id),
    }));
  },

  addTag: async (tagData) => {
    set((state) => {
      const newTag = {
        ...tagData,
        id: `tag-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { tags: [...state.tags, newTag] };
    });
  },

  updateTag: async (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id
          ? { ...tag, ...updates, updatedAt: new Date().toISOString() }
          : tag
      ),
    }));
  },

  deleteTag: async (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
    }));
  },

  addUser: (userData) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      users: [...state.users, newUser],
    }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id
          ? { ...user, ...updates, updatedAt: new Date().toISOString() }
          : user
      ),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    }));
  },

  copyComponentsToProgressSteps: (clientId) => {
    const state = get();
    const clientComponents = state.components.filter(comp => comp.clientId === clientId);
    
    clientComponents.forEach(component => {
      const existingStep = state.progressSteps.find(step => 
        step.clientId === clientId && step.title === component.name
      );
      
      if (!existingStep) {
        const newStep: ProgressStep = {
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          clientId: clientId,
          title: component.name,
          description: `Complete the ${component.name} component`,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          completed: false,
          important: false,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          progressSteps: [...state.progressSteps, newStep],
        }));
      }
    });
  },

  getTotalSales: () => {
    return get().clients.reduce((total, client) => total + client.totalSales, 0);
  },

  getTotalCollection: () => {
    return get().clients.reduce((total, client) => total + client.totalCollection, 0);
  },

  getTotalBalance: () => {
    return get().clients.reduce((total, client) => total + client.balance, 0);
  },
}));
