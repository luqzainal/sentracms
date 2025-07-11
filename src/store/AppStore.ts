import { create } from 'zustand'

export interface Client {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: 'Complete' | 'Pending' | 'Inactive';
  pic: string;
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
  
  // Actions
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: number, client: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  addPayment: (payment: Omit<Payment, 'id'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  
  addComponent: (component: Omit<Component, 'id'>) => void;
  updateComponent: (id: string, component: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  copyComponentsToProgressSteps: (clientId: number) => void;
  
  addProgressStep: (step: Omit<ProgressStep, 'id'>) => void;
  updateProgressStep: (id: string, step: Partial<ProgressStep>) => void;
  deleteProgressStep: (id: string) => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
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

export const useAppStore = create<AppState>((set, get) => ({
  // Initial data with Malaysian context
  clients: [
    {
      id: 1,
      name: 'Ahmad Bin Abdullah',
      businessName: 'Ahmad Tech Solutions Sdn Bhd',
      email: 'ahmad.abdullah@gmail.com',
      phone: '+60 12-345 6789',
      status: 'Complete',
      pic: 'Nisha KB',
      totalSales: 25000,
      totalCollection: 20000,
      balance: 5000,
      lastActivity: '2025-01-15',
      invoiceCount: 3,
      registeredAt: '2025-07-09 10:44:34',
      company: 'Ahmad Tech Solutions Sdn Bhd',
      address: 'Jalan Bukit Bintang, Kuala Lumpur',
      notes: 'VIP client with multiple ongoing projects',
      username: 'ahmad.abdullah@gmail.com',
      password: 'password123'
    },
    {
      id: 2,
      name: 'Siti Nurhaliza Binti Mohd',
      businessName: 'Siti Digital Marketing Sdn Bhd',
      email: 'siti.nurhaliza@gmail.com',
      phone: '+60 13-456 7890',
      status: 'Complete',
      pic: 'Ahmad Razak',
      totalSales: 18500,
      totalCollection: 15000,
      balance: 3500,
      lastActivity: '2025-01-14',
      invoiceCount: 2,
      registeredAt: '2025-06-15 14:20:15',
      company: 'Siti Digital Marketing Sdn Bhd',
      address: 'Jalan Ampang, Kuala Lumpur',
      notes: 'Regular client with good payment history',
      username: 'siti.nurhaliza@gmail.com',
      password: 'password123'
    },
    {
      id: 3,
      name: 'Lim Wei Ming',
      businessName: 'Wei Ming Enterprise Sdn Bhd',
      email: 'weiming.lim@gmail.com',
      phone: '+60 14-567 8901',
      status: 'Pending',
      pic: 'Siti Nurhaliza',
      totalSales: 12000,
      totalCollection: 8000,
      balance: 4000,
      lastActivity: '2025-01-13',
      invoiceCount: 1,
      registeredAt: '2025-08-20 09:30:45',
      company: 'Wei Ming Enterprise Sdn Bhd',
      address: 'Jalan Petaling, Kuala Lumpur',
      notes: 'New client, monitoring progress',
      username: 'weiming.lim@gmail.com',
      password: 'password123'
    },
    {
      id: 4,
      name: 'Raj Kumar A/L Suresh',
      businessName: 'Kumar Digital Agency Sdn Bhd',
      email: 'raj.kumar@gmail.com',
      phone: '+60 15-678 9012',
      status: 'Complete',
      pic: 'Muhammad Hakim',
      totalSales: 35000,
      totalCollection: 30000,
      balance: 5000,
      lastActivity: '2025-01-15',
      invoiceCount: 4,
      registeredAt: '2025-05-10 11:15:30',
      company: 'Kumar Digital Agency Sdn Bhd',
      address: 'Jalan Klang Lama, Kuala Lumpur',
      notes: 'Long-term client with excellent relationship',
      username: 'raj.kumar@gmail.com',
      password: 'password123'
    },
    {
      id: 5,
      name: 'Fatimah Zahra Binti Hassan',
      businessName: 'Zahra Startup Ventures Sdn Bhd',
      email: 'fatimah.zahra@gmail.com',
      phone: '+60 16-789 0123',
      status: 'Inactive',
      pic: 'Fatimah Zahra',
      totalSales: 8000,
      totalCollection: 6000,
      balance: 2000,
      lastActivity: '2025-01-10',
      invoiceCount: 1,
      registeredAt: '2025-09-05 16:45:20',
      company: 'Zahra Startup Ventures Sdn Bhd',
      address: 'Jalan Tun Razak, Kuala Lumpur',
      notes: 'Startup client, payment delays',
      username: 'fatimah.zahra@gmail.com',
      password: 'password123'
    },
    {
      id: 6,
      name: 'Syazwani Binti Jamali',
      businessName: 'Syazwani Tech Solutions Sdn Bhd',
      email: 'syazwani@gmail.com',
      phone: '0193721960',
      status: 'Complete',
      pic: 'Ahmad Razak',
      totalSales: 22000,
      totalCollection: 18000,
      balance: 4000,
      lastActivity: '2025-01-12',
      invoiceCount: 3,
      registeredAt: '2025-07-09 10:44:34',
      company: 'Syazwani Tech Solutions Sdn Bhd',
      address: 'Jalan Sultanah Zainab, Kota Bharu, Kelantan',
      notes: 'VIP client with multiple ongoing projects',
      username: 'syazwani@gmail.com',
      password: 'password123'
    },
    {
      id: 7,
      name: 'Chen Li Hua',
      businessName: 'Li Hua Creative Studio Sdn Bhd',
      email: 'chen.lihua@gmail.com',
      phone: '+60 17-890 1234',
      status: 'Inactive',
      pic: 'Nurul Aina',
      totalSales: 15000,
      totalCollection: 10000,
      balance: 5000,
      lastActivity: '2025-01-08',
      invoiceCount: 2,
      registeredAt: '2025-04-25 13:20:10',
      company: 'Li Hua Creative Studio Sdn Bhd',
      address: 'Jalan Imbi, Kuala Lumpur',
      notes: 'Creative agency, project on hold',
      username: 'chen.lihua@gmail.com',
      password: 'password123'
    }
  ],

  invoices: [
    {
      id: 'INV-001',
      clientId: 1,
      packageName: 'Kuasa 360 Package',
      amount: 9997,
      paid: 3000,
      due: 6997,
      status: 'Partial',
      createdAt: '2025-01-10T10:00:00'
    },
    {
      id: 'INV-002',
      clientId: 2,
      packageName: 'Digital Marketing Suite',
      amount: 18500,
      paid: 15000,
      due: 3500,
      status: 'Partial',
      createdAt: '2025-01-08T14:30:00'
    },
    {
      id: 'INV-003',
      clientId: 3,
      packageName: 'Basic Web Package',
      amount: 12000,
      paid: 8000,
      due: 4000,
      status: 'Partial',
      createdAt: '2025-01-12T09:15:00'
    },
    {
      id: 'INV-004',
      clientId: 4,
      packageName: 'Premium Agency Package',
      amount: 35000,
      paid: 30000,
      due: 5000,
      status: 'Partial',
      createdAt: '2025-01-05T11:45:00'
    },
    {
      id: 'INV-005',
      clientId: 5,
      packageName: 'Startup Package',
      amount: 8000,
      paid: 6000,
      due: 2000,
      status: 'Partial',
      createdAt: '2025-01-15T16:20:00'
    }
  ],

  payments: [
    {
      id: 'PAY-001',
      clientId: 1,
      invoiceId: 'INV-001',
      amount: 3000,
      paymentSource: 'Online Transfer',
      status: 'Paid',
      paidAt: '2025-01-11T10:30:00'
    },
    {
      id: 'PAY-002',
      clientId: 2,
      invoiceId: 'INV-002',
      amount: 15000,
      paymentSource: 'Online Transfer',
      status: 'Paid',
      paidAt: '2025-01-09T14:45:00'
    },
    {
      id: 'PAY-003',
      clientId: 3,
      invoiceId: 'INV-003',
      amount: 8000,
      paymentSource: 'Stripe/Razorpay (Payment Gateway)',
      status: 'Paid',
      paidAt: '2025-01-13T11:20:00'
    },
    {
      id: 'PAY-004',
      clientId: 4,
      invoiceId: 'INV-004',
      amount: 30000,
      paymentSource: 'Online Transfer',
      status: 'Paid',
      paidAt: '2025-01-06T15:10:00'
    },
    {
      id: 'PAY-005',
      clientId: 5,
      invoiceId: 'INV-005',
      amount: 6000,
      paymentSource: 'Cash',
      status: 'Paid',
      paidAt: '2025-01-16T09:30:00'
    }
  ],

  calendarEvents: [
    {
      id: '1',
      clientId: 1,
      title: 'Client Meeting - Ahmad Tech Solutions',
      startDate: '2025-01-20',
      endDate: '2025-01-20',
      startTime: '10:00',
      endTime: '11:00',
      description: 'Project kickoff meeting',
      type: 'meeting'
    },
    {
      id: '2',
      clientId: 2,
      title: 'Payment Due - Siti Digital Marketing',
      startDate: '2025-01-22',
      endDate: '2025-01-22',
      startTime: '11:30',
      endTime: '12:00',
      description: 'Final payment for digital marketing package',
      type: 'payment'
    },
    {
      id: '3',
      clientId: 3,
      title: 'Project Deadline - Wei Ming Enterprise',
      startDate: '2025-01-25',
      endDate: '2025-01-25',
      startTime: '17:00',
      endTime: '17:30',
      description: 'Website development deliverables',
      type: 'deadline'
    },
    {
      id: '4',
      clientId: 4,
      title: 'Follow-up Call - Kumar Digital Agency',
      startDate: '2025-01-28',
      endDate: '2025-01-28',
      startTime: '14:00',
      endTime: '14:30',
      description: 'Progress review call',
      type: 'call'
    }
  ],

  components: [
    // Ahmad Tech Solutions components
    { id: 'comp-1', clientId: 1, name: 'Akses 12 Month Sistem Kuasa', price: 'RM 299.00', active: true },
    { id: 'comp-2', clientId: 1, name: 'Akses 12 Month Sistem Telah AI', price: 'RM 199.00', active: true },
    { id: 'comp-3', clientId: 1, name: 'Executive Kuasa Workshop', price: 'RM 499.00', active: false },
    
    // Siti Digital Marketing components
    { id: 'comp-4', clientId: 2, name: 'Digital Marketing Suite Pro', price: 'RM 599.00', active: true },
    { id: 'comp-5', clientId: 2, name: 'Social Media Management', price: 'RM 299.00', active: true },
    
    // Wei Ming Enterprise components
    { id: 'comp-6', clientId: 3, name: 'Basic Website Package', price: 'RM 399.00', active: true },
    { id: 'comp-7', clientId: 3, name: 'SEO Optimization', price: 'RM 199.00', active: false },
    
    // Kumar Digital Agency components
    { id: 'comp-8', clientId: 4, name: 'Premium Agency Package', price: 'RM 999.00', active: true },
    { id: 'comp-9', clientId: 4, name: 'Brand Development', price: 'RM 699.00', active: true },
    { id: 'comp-10', clientId: 4, name: 'Content Creation Suite', price: 'RM 399.00', active: true }
  ],

  progressSteps: [
    // Ahmad Tech Solutions progress
    {
      id: 'step-1',
      clientId: 1,
      title: 'Akses 12 Month Sistem Kuasa',
      description: 'Complete setup and configuration for Akses 12 Month Sistem Kuasa',
      deadline: '2025-01-25T10:00:00',
      completed: true,
      completedDate: '2025-01-20',
      important: true,
      comments: [
        {
          id: 'comment-1',
          text: 'Component has been successfully configured and activated',
          username: 'Ahmad Razak',
          timestamp: '2025-01-20T09:30:00'
        }
      ]
    },
    {
      id: 'step-2',
      clientId: 1,
      title: 'Akses 12 Month Sistem Telah AI',
      description: 'Complete setup and configuration for Akses 12 Month Sistem Telah AI',
      deadline: '2025-01-30T10:00:00',
      completed: false,
      important: false,
      comments: [
        {
          id: 'comment-2',
          text: 'Waiting for client to provide AI system requirements',
          username: 'Nisha KB',
          timestamp: '2025-01-22T14:20:00'
        }
      ]
    },
    {
      id: 'step-2a',
      clientId: 1,
      title: 'Executive Kuasa Workshop',
      description: 'Complete setup and configuration for Executive Kuasa Workshop',
      deadline: '2025-02-05T10:00:00',
      completed: false,
      important: false,
      comments: []
    },
    
    // Siti Digital Marketing progress
    {
      id: 'step-3',
      clientId: 2,
      title: 'Digital Marketing Suite Pro',
      description: 'Complete setup and configuration for Digital Marketing Suite Pro',
      deadline: '2025-01-28T15:00:00',
      completed: true,
      completedDate: '2025-01-25',
      important: true,
      comments: []
    },
    {
      id: 'step-4',
      clientId: 2,
      title: 'Social Media Management',
      description: 'Complete setup and configuration for Social Media Management',
      deadline: '2025-02-05T12:00:00',
      completed: false,
      important: false,
      comments: []
    },
    
    // Wei Ming Enterprise progress
    {
      id: 'step-5',
      clientId: 3,
      title: 'Basic Website Package',
      description: 'Complete setup and configuration for Basic Website Package',
      deadline: '2025-02-10T14:00:00',
      completed: false,
      important: true,
      comments: []
    },
    {
      id: 'step-6',
      clientId: 3,
      title: 'SEO Optimization',
      description: 'Complete setup and configuration for SEO Optimization',
      deadline: '2025-02-15T16:00:00',
      completed: false,
      important: false,
      comments: []
    },
    
    // Kumar Digital Agency progress
    {
      id: 'step-7',
      clientId: 4,
      title: 'Premium Agency Package',
      description: 'Complete setup and configuration for Premium Agency Package',
      deadline: '2025-02-01T10:00:00',
      completed: true,
      completedDate: '2025-01-28',
      important: true,
      comments: []
    },
    {
      id: 'step-8',
      clientId: 4,
      title: 'Brand Development',
      description: 'Complete setup and configuration for Brand Development',
      deadline: '2025-02-08T12:00:00',
      completed: false,
      important: false,
      comments: []
    },
    {
      id: 'step-9',
      clientId: 4,
      title: 'Content Creation Suite',
      description: 'Complete setup and configuration for Content Creation Suite',
      deadline: '2025-02-12T15:00:00',
      completed: false,
      important: false,
      comments: []
    }
  ],

  chats: [
    {
      id: 1,
      clientId: 1,
      client: 'Ahmad Tech Solutions',
      avatar: 'AT',
      lastMessage: 'Terima kasih untuk update projek ini',
      timestamp: '10:30 AM',
      unread: 2,
      online: true,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Hi! Saya nak check progress projek kami.',
          timestamp: '10:15 AM',
          type: 'text'
        },
        {
          id: 2,
          sender: 'admin',
          content: 'Hello! Projek berjalan dengan baik. Kami sudah complete design phase dan sekarang moving ke development.',
          timestamp: '10:18 AM',
          type: 'text'
        },
        {
          id: 3,
          sender: 'client',
          content: 'Bagus! Boleh share beberapa screenshots?',
          timestamp: '10:20 AM',
          type: 'text'
        },
        {
          id: 4,
          sender: 'admin',
          content: 'Tentu! Saya akan hantar sebentar lagi. UI nampak sangat clean dan modern.',
          timestamp: '10:22 AM',
          type: 'text'
        },
        {
          id: 5,
          sender: 'client',
          content: 'Terima kasih untuk update projek ini',
          timestamp: '10:30 AM',
          type: 'text'
        }
      ]
    },
    {
      id: 2,
      clientId: 2,
      client: 'Siti Digital Marketing',
      avatar: 'SD',
      lastMessage: 'Bila boleh schedule meeting seterusnya?',
      timestamp: '9:15 AM',
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Bila boleh schedule meeting seterusnya?',
          timestamp: '9:15 AM',
          type: 'text'
        }
      ]
    },
    {
      id: 3,
      clientId: 3,
      client: 'Wei Ming Enterprise',
      avatar: 'WM',
      lastMessage: 'Design nampak bagus!',
      timestamp: 'Yesterday',
      unread: 1,
      online: true,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Design nampak bagus!',
          timestamp: 'Yesterday',
          type: 'text'
        }
      ]
    },
    {
      id: 4,
      clientId: 4,
      client: 'Kumar Digital Agency',
      avatar: 'KD',
      lastMessage: 'Payment sudah diproses',
      timestamp: '2 days ago',
      unread: 0,
      online: false,
      messages: [
        {
          id: 1,
          sender: 'client',
          content: 'Payment sudah diproses',
          timestamp: '2 days ago',
          type: 'text'
        }
      ]
    }
  ],

  users: [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@sentra.com',
      role: 'Super Admin',
      status: 'Active',
      lastLogin: '2025-01-15 10:30:00',
      createdAt: '2025-01-01 09:00:00',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Nisha KB',
      email: 'nisha@sentra.com',
      role: 'Team',
      status: 'Active',
      lastLogin: '2025-01-15 09:15:00',
      createdAt: '2025-01-02 10:00:00',
      permissions: ['clients', 'calendar', 'chat', 'reports', 'dashboard']
    },
    {
      id: '3',
      name: 'Ahmad Razak',
      email: 'ahmad@sentra.com',
      role: 'Team',
      status: 'Active',
      lastLogin: '2025-01-14 16:45:00',
      createdAt: '2025-01-03 11:00:00',
      permissions: ['clients', 'calendar', 'chat', 'reports', 'dashboard']
    },
    {
      id: '4',
      name: 'Ahmad Bin Abdullah',
      email: 'ahmad.abdullah@gmail.com',
      role: 'Client Admin',
      status: 'Active',
      lastLogin: '2025-01-15 08:20:00',
      createdAt: '2025-01-10 14:30:00',
      permissions: ['client_dashboard', 'client_profile', 'client_messages']
    },
    {
      id: '5',
      name: 'Siti Nurhaliza Binti Mohd',
      email: 'siti.nurhaliza@gmail.com',
      role: 'Client Team',
      status: 'Active',
      lastLogin: '2025-01-14 12:10:00',
      createdAt: '2025-01-12 16:00:00',
      permissions: ['client_dashboard', 'client_profile', 'client_messages']
    }
  ],

  // Actions
  addClient: (client) => set((state) => {
    const newClient = { ...client, id: Math.max(...state.clients.map(c => c.id)) + 1 };
    return { clients: [...state.clients, newClient] };
  }),

  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    )
  })),

  deleteClient: (id) => set((state) => ({
    clients: state.clients.filter(client => client.id !== id),
    invoices: state.invoices.filter(invoice => invoice.clientId !== id),
    payments: state.payments.filter(payment => payment.clientId !== id),
    calendarEvents: state.calendarEvents.filter(event => event.clientId !== id),
    components: state.components.filter(component => component.clientId !== id),
    progressSteps: state.progressSteps.filter(step => step.clientId !== id),
    chats: state.chats.filter(chat => chat.clientId !== id)
  })),

  addInvoice: (invoice) => set((state) => {
    const newInvoice = { ...invoice, id: `INV-${Date.now()}` };
    // Update client's invoice count and totals
    const updatedClients = state.clients.map(client => {
      if (client.id === invoice.clientId) {
        return {
          ...client,
          invoiceCount: client.invoiceCount + 1,
          totalSales: client.totalSales + invoice.amount,
          balance: client.balance + invoice.amount
        };
      }
      return client;
    });
    return { 
      invoices: [...state.invoices, newInvoice],
      clients: updatedClients
    };
  }),

  updateInvoice: (id, updates) => set((state) => ({
    invoices: state.invoices.map(invoice => 
      invoice.id === id ? { ...invoice, ...updates } : invoice
    )
  })),

  deleteInvoice: (id) => set((state) => {
    const invoice = state.invoices.find(inv => inv.id === id);
    if (!invoice) return state;
    
    // Update client totals
    const updatedClients = state.clients.map(client => {
      if (client.id === invoice.clientId) {
        return {
          ...client,
          invoiceCount: Math.max(0, client.invoiceCount - 1),
          totalSales: Math.max(0, client.totalSales - invoice.amount),
          balance: Math.max(0, client.balance - invoice.due)
        };
      }
      return client;
    });
    
    return {
      invoices: state.invoices.filter(invoice => invoice.id !== id),
      payments: state.payments.filter(payment => payment.invoiceId !== id),
      clients: updatedClients
    };
  }),

  addPayment: (payment) => set((state) => {
    const newPayment = { ...payment, id: `PAY-${Date.now()}` };
    
    // Update invoice and client totals
    const updatedInvoices = state.invoices.map(invoice => {
      if (invoice.id === payment.invoiceId) {
        const newPaid = invoice.paid + payment.amount;
        const newDue = Math.max(0, invoice.amount - newPaid);
        const newStatus = newDue === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
        return {
          ...invoice,
          paid: newPaid,
          due: newDue,
          status: newStatus as 'Paid' | 'Partial' | 'Pending' | 'Overdue'
        };
      }
      return invoice;
    });
    
    const updatedClients = state.clients.map(client => {
      if (client.id === payment.clientId) {
        return {
          ...client,
          totalCollection: client.totalCollection + payment.amount,
          balance: Math.max(0, client.balance - payment.amount)
        };
      }
      return client;
    });
    
    return { 
      payments: [...state.payments, newPayment],
      invoices: updatedInvoices,
      clients: updatedClients
    };
  }),

  updatePayment: (id, updates) => set((state) => ({
    payments: state.payments.map(payment => 
      payment.id === id ? { ...payment, ...updates } : payment
    )
  })),

  deletePayment: (id) => set((state) => {
    const payment = state.payments.find(p => p.id === id);
    if (!payment) return state;
    
    // Revert invoice and client totals
    const updatedInvoices = state.invoices.map(invoice => {
      if (invoice.id === payment.invoiceId) {
        const newPaid = Math.max(0, invoice.paid - payment.amount);
        const newDue = invoice.amount - newPaid;
        const newStatus = newDue === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';
        return {
          ...invoice,
          paid: newPaid,
          due: newDue,
          status: newStatus as 'Paid' | 'Partial' | 'Pending' | 'Overdue'
        };
      }
      return invoice;
    });
    
    const updatedClients = state.clients.map(client => {
      if (client.id === payment.clientId) {
        return {
          ...client,
          totalCollection: Math.max(0, client.totalCollection - payment.amount),
          balance: client.balance + payment.amount
        };
      }
      return client;
    });
    
    return {
      payments: state.payments.filter(payment => payment.id !== id),
      invoices: updatedInvoices,
      clients: updatedClients
    };
  }),

  addCalendarEvent: (event) => set((state) => {
    const newEvent = { ...event, id: `event-${Date.now()}` };
    return { calendarEvents: [...state.calendarEvents, newEvent] };
  }),

  updateCalendarEvent: (id, updates) => set((state) => ({
    calendarEvents: state.calendarEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    )
  })),

  deleteCalendarEvent: (id) => set((state) => ({
    calendarEvents: state.calendarEvents.filter(event => event.id !== id)
  })),

  addComponent: (component) => set((state) => {
    const newComponent = { ...component, id: `comp-${Date.now()}` };
    
    // Auto-create progress step for this component
    const newProgressStep = {
      id: `step-${Date.now()}`,
      clientId: component.clientId,
      title: component.name,
      description: `Complete setup and configuration for ${component.name}`,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      completed: false,
      important: false,
      comments: []
    };
    
    return { 
      components: [...state.components, newComponent],
      progressSteps: [...state.progressSteps, newProgressStep]
    };
  }),

  updateComponent: (id, updates) => set((state) => ({
    components: state.components.map(component => 
      component.id === id ? { ...component, ...updates } : component
    )
  })),

  deleteComponent: (id) => set((state) => ({
    components: state.components.filter(component => component.id !== id)
  })),

  copyComponentsToProgressSteps: (clientId) => set((state) => {
    const clientComponents = state.components.filter(comp => comp.clientId === clientId);
    const existingStepTitles = state.progressSteps
      .filter(step => step.clientId === clientId)
      .map(step => step.title.toLowerCase());
    
    // Only create progress steps for components that don't already have corresponding steps
    const newProgressSteps = clientComponents
      .filter(component => !existingStepTitles.includes(component.name.toLowerCase()))
      .map(component => ({
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientId: clientId,
        title: component.name,
        description: `Complete setup and configuration for ${component.name}`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        completed: false,
        important: false,
        comments: []
      }));
    
    return {
      progressSteps: [...state.progressSteps, ...newProgressSteps]
    };
  }),
  addProgressStep: (step) => set((state) => {
    const newStep = { ...step, id: `step-${Date.now()}` };
    return { progressSteps: [...state.progressSteps, newStep] };
  }),

  updateProgressStep: (id, updates) => set((state) => ({
    progressSteps: state.progressSteps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    )
  })),

  deleteProgressStep: (id) => set((state) => ({
    progressSteps: state.progressSteps.filter(step => step.id !== id)
  })),

  addUser: (user) => set((state) => {
    const newUser = { ...user, id: `user-${Date.now()}` };
    return { users: [...state.users, newUser] };
  }),

  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(user => 
      user.id === id ? { ...user, ...updates } : user
    )
  })),

  deleteUser: (id) => set((state) => ({
    users: state.users.filter(user => user.id !== id)
  })),

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