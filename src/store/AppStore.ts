import { create } from 'zustand';
import { 
  chatService, 
  clientsService, 
  usersService, 
  invoicesService, 
  paymentsService, 
  clientLinksService, 
  progressService,
  componentsService, // Add this import
  calendarService,
  clientFilesService,
  tagsService,
  addOnServicesService,
  clientServiceRequestsService,
  clientPicsService
} from '../services/database';
import { generateAvatarUrl } from '../utils/avatarUtils';
import type { Client as DatabaseClient, ClientLink as TClientLink, DatabaseProgressStepComment, AddOnService, ClientServiceRequest } from '../types/database';
import { 
  DatabaseInvoice, 
  DatabasePayment, 
  DatabaseComponent, 
  DatabaseProgressStep, 
  DatabaseCalendarEvent,
  DatabaseChat,
  DatabaseChatMessage,
  DatabaseClientLink,
  DatabaseAddOnService,
  DatabaseClientServiceRequest,
  Chat as DatabaseChatType,
  ChatMessage as DatabaseChatMessageType,
  ClientServiceRequest as DatabaseClientServiceRequestType,
  AddOnService as DatabaseAddOnServiceType
} from '../types/database';

export interface Client {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  status: string;
  packageName?: string;
  pic?: string;
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

export interface Invoice {
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

export interface Payment {
  id: string;
  clientId: number;
  invoiceId: string;
  amount: number;
  paymentSource: string;
  status: string;
  paidAt: string;
  receiptFileUrl?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  id: string;
  clientId: number;
  name: string;
  price: string;
  active: boolean;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStep {
  id: string;
  clientId: number;
  title: string;
  description?: string;
  deadline: string;
  completed: boolean;
  completedDate?: string;
  important: boolean;
  // New deadline fields for parent items
  onboardingDeadline?: string;
  firstDraftDeadline?: string;
  secondDraftDeadline?: string;
  onboardingCompleted?: boolean;
  firstDraftCompleted?: boolean;
  secondDraftCompleted?: boolean;
  onboardingCompletedDate?: string;
  firstDraftCompletedDate?: string;
  secondDraftCompletedDate?: string;
  comments: DatabaseProgressStepComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
}

export interface CalendarEvent {
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

export interface Chat {
  id: number;
  clientId: number;
  client: string;
  avatar: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unread_count: number;
  client_unread_count: number;
  admin_unread_count: number;
  online: boolean;
  messages: DatabaseChatMessageType[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  chatId: number;
  sender: 'client' | 'admin';
  content: string;
  messageType: 'text' | 'file' | 'image';
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
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

export interface ClientFile {
  id: number;
  clientId: number;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  fileType?: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPic {
  id: number;
  clientId: number;
  picId: string;
  position: number;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ClientLink = TClientLink;

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
  clientLinks: ClientLink[];
  clientFiles: ClientFile[];
  addOnServices: AddOnService[];
  clientServiceRequests: ClientServiceRequest[];
  clientPics: ClientPic[];

  // Navigation & User state
  user: User | null;
  activeTab: string;
  selectedClient: Client | null;

  // Real-time polling
  isPolling: boolean;
  pollingInterval: NodeJS.Timeout | null;
  lastNonChatPoll: number;

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
    clientLinks: boolean;
    clientFiles: boolean;
    addOnServices: boolean;
    clientServiceRequests: boolean;
    clientPics: boolean;
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
  fetchClientLinks: (clientId: number) => Promise<void>;
  fetchAddOnServices: () => Promise<void>;
  fetchClientServiceRequests: () => Promise<void>;

  // User & Navigation actions
  setUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedClient: (client: Client | null) => void;

  // Real-time polling actions
  startPolling: () => void;
  stopPolling: () => void;
  pollForUpdates: () => Promise<void>;

  // Chat actions
  sendMessage: (chatId: number, content: string, sender: 'client' | 'admin', attachmentData?: {
    messageType: 'text' | 'file' | 'image';
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    attachmentSize?: number;
  }) => Promise<void>;
  loadChatMessages: (chatId: number) => Promise<void>;
  markChatAsRead: (chatId: number, userType: 'client' | 'admin') => Promise<void>;
  createChatForClient: (clientId: number) => Promise<void>;
  updateChatOnlineStatus: (chatId: number, online: boolean) => Promise<void>;
  getUnreadMessagesCount: (userType?: 'client' | 'admin') => number;
  getChatById: (chatId: number) => Chat | undefined;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: number, updates: Partial<Client>) => void;
  deleteClient: (id: number) => Promise<void>;
  getClientById: (id: number) => Client | undefined;

  addInvoice: (invoiceData: { clientId: number; packageName: string; amount: number; invoiceDate: string }) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  getInvoicesByClientId: (clientId: number) => Invoice[];

  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByClientId: (clientId: number) => Payment[];

  addComponent: (component: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  addComponents: (components: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;
  updateComponent: (id: string, updates: Partial<Component>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;
  getComponentsByClientId: (clientId: number) => Component[];
  getComponentsByInvoiceId: (invoiceId: string) => Component[];

  addProgressStep: (step: Omit<ProgressStep, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProgressStep: (id: string, updates: Partial<ProgressStep>) => Promise<void>;
  deleteProgressStep: (id: string) => void;
  getProgressStepsByClientId: (clientId: number) => ProgressStep[];
  calculateClientProgressStatus: (clientId: number) => {
    hasOverdue: boolean;
    percentage: number;
    overdueCount: number;
    completedSteps: number;
    totalSteps: number;
  };

  addCommentToStep: (stepId: string, comment: { text: string; username: string; attachment_url?: string; attachment_type?: string; }) => Promise<void>;
  deleteCommentFromStep: (stepId: string, commentId: string) => Promise<void>;

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<{ success: boolean; passwordUpdated: boolean }>;
  deleteUser: (id: string) => Promise<void>;
  getAdminTeam: () => Promise<User[]>;
  assignUserToClient: (userId: string, clientId: number) => Promise<void>;

  autoCreateProgressStepsForInvoice: (clientId: number) => Promise<void>;

  addClientLink: (link: Omit<ClientLink, 'id' | 'createdAt' | 'created_at'> & { client_id: number }) => Promise<void>;
  deleteClientLink: (id: string) => Promise<void>;
  getClientLinksByClientId: (clientId: number) => ClientLink[];

  // Client Files actions
  fetchClientFiles: (clientId: number) => Promise<void>;
  addClientFile: (file: Omit<ClientFile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteClientFile: (id: number) => Promise<void>;
  getClientFilesByClientId: (clientId: number) => ClientFile[];

  // Add-On Services actions
  addAddOnService: (service: Partial<AddOnService>) => Promise<void>;
  updateAddOnService: (id: number, updates: Partial<AddOnService>) => Promise<void>;
  deleteAddOnService: (id: number) => Promise<void>;
  getAddOnServiceById: (id: number) => AddOnService | undefined;

  // Client Service Requests actions
  addClientServiceRequest: (request: Partial<ClientServiceRequest>) => Promise<void>;
  updateClientServiceRequest: (id: number, updates: Partial<ClientServiceRequest>) => Promise<void>;
  deleteClientServiceRequest: (id: number) => Promise<void>;
  getClientServiceRequestsByClientId: (clientId: number) => ClientServiceRequest[];

  // Computed values
  getTotalSales: () => number;
  getTotalCollection: () => number;
  getTotalBalance: () => number;
  getSalesByPaymentDate: () => { [key: string]: number };
  getMonthlySalesData: () => { month: string; sales: number; displayValue: string }[];
  
  // Utility functions
  recalculateAllClientTotals: () => Promise<void>;
  createTestUsers: () => Promise<void>;
  cleanOrphanedChats: () => Promise<number>;
  mergeDuplicateChats: () => Promise<number>;
  refreshDashboardData: () => Promise<void>;
  listAllInvoices: () => Promise<void>;
  cleanOrphanedInvoices: () => Promise<number>;

  getClientRole: (clientId: number) => string;
  
  // Helper function to clean up PIC references
  cleanupPicReferences: (userName: string, reason: string) => Promise<void>;

  // Client PICs actions
  fetchClientPics: (clientId: number) => Promise<void>;
  addClientPic: (pic: Partial<ClientPic>) => Promise<void>;
  updateClientPic: (id: number, updates: Partial<ClientPic>) => Promise<void>;
  deleteClientPic: (id: number) => Promise<void>;
  getClientPicsByClientId: (clientId: number) => ClientPic[];
  reorderClientPics: (clientId: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state - all empty arrays for production
  clients: [],
  invoices: [],
  payments: [],
  components: [],
  progressSteps: (() => {
    if (typeof window !== 'undefined') {
      const savedProgressSteps = localStorage.getItem('progressStepsCache');
      if (savedProgressSteps) {
        try {
          return JSON.parse(savedProgressSteps);
        } catch (error) {
          console.error('Error parsing progress steps from localStorage:', error);
          localStorage.removeItem('progressStepsCache');
        }
      }
    }
    return [];
  })(),
  calendarEvents: [],
  chats: [],
  tags: [],
  users: [],
  clientLinks: [],
  clientFiles: [],
  addOnServices: [],
  clientServiceRequests: [],
  clientPics: [],

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
    clientLinks: false,
    clientFiles: false,
    addOnServices: false,
    clientServiceRequests: false,
    clientPics: false,
  },

  // Navigation & User state - Initialize user from localStorage
  user: (() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('demoUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          // Convert from SupabaseContext format to AppStore format
          return {
            id: parsedUser.id,
            name: parsedUser.name,
            email: parsedUser.email,
            role: parsedUser.role,
            status: 'Active',
            lastLogin: new Date().toISOString(),
            clientId: parsedUser.clientId,
            permissions: parsedUser.permissions || ['all'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
          localStorage.removeItem('demoUser');
        }
      }
    }
    return null;
  })(),
  activeTab: 'dashboard',
  selectedClient: null,

  // Real-time polling
  isPolling: false,
  pollingInterval: null,
  lastNonChatPoll: 0,

  // Actions
  fetchClients: async () => {
    set((state) => ({ loading: { ...state.loading, clients: true } }));
    try {
      const user = useAppStore.getState().user;

      let dbClients: DatabaseClient[] = [];

      if (user && (user.role === 'Client Admin' || user.role === 'Client Team') && user.clientId) {
        // For clients, fetch only their specific data
        const client = await clientsService.getById(user.clientId);
        if (client) {
          dbClients = [client];
        } else {
          // If demo client and no data found, create demo client data
          const demoClientEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
          const demoClientName = import.meta.env.VITE_DEMO_CLIENT_NAME || 'Demo Client';
          
          if (user.email === demoClientEmail || user.email === 'test12@test.com') {
            console.log('Creating demo client data for demo user');
            // Create demo client data
            const demoClient: DatabaseClient = {
              id: 1,
              name: demoClientName,
              business_name: 'Demo Business',
              email: user.email, // Use actual user email
              phone: '+60123456789',
              status: 'Complete',
              pic: 'Project Management',
              total_sales: 15000,
              total_collection: 10000,
              balance: 5000,
              last_activity: new Date().toISOString(),
              invoice_count: 2,
              registered_at: new Date().toISOString(),
              company: 'Demo Company Sdn Bhd',
              address: 'Kuala Lumpur, Malaysia',
              notes: 'Demo client for testing purposes',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            dbClients = [demoClient];
          }
        }
        console.log(`Fetching specific client data for clientId: ${user.clientId}`, dbClients);
      } else {
        // For admins, fetch all clients
        dbClients = await clientsService.getAll();
        console.log('Raw clients from database (admin):', dbClients);
      }
      
      // Convert database Client type to store Client type
      const clients: Client[] = dbClients.map((dbClient) => {
        const convertedClient = {
          id: dbClient.id,
          name: dbClient.name,
          businessName: dbClient.business_name || dbClient.name,
          email: dbClient.email,
          phone: dbClient.phone || '',
          status: dbClient.status,
          packageName: undefined,
          pic: dbClient.pic,
          tags: dbClient.tags || [], // Load tags from database
          totalSales: Number(dbClient.total_sales) || 0,
          totalCollection: Number(dbClient.total_collection) || 0,
          balance: Number(dbClient.balance) || 0,
          lastActivity: dbClient.last_activity || new Date().toISOString(),
          invoiceCount: Number(dbClient.invoice_count) || 0,
          registeredAt: dbClient.registered_at || dbClient.created_at,
          company: dbClient.company,
          address: dbClient.address,
          notes: dbClient.notes,
          createdAt: dbClient.created_at,
          updatedAt: dbClient.updated_at
        };
        
        console.log(`Client ${dbClient.id} conversion:`, {
          raw: {
            total_sales: dbClient.total_sales,
            total_collection: dbClient.total_collection,
            balance: dbClient.balance
          },
          converted: {
            totalSales: convertedClient.totalSales,
            totalCollection: convertedClient.totalCollection,
            balance: convertedClient.balance
          }
        });
        
        return convertedClient;
      });
      
      // Debug log to check client data
      console.log('Converted clients:', clients);
      console.log('Sample client financial data:', clients.length > 0 ? {
        totalSales: clients[0].totalSales,
        totalCollection: clients[0].totalCollection,
        balance: clients[0].balance
      } : 'No clients found');
    
      set({ clients });
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Keep empty array for production
      set({ clients: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, clients: false } }));
    }
  },

  fetchInvoices: async () => {
    set((state) => ({ loading: { ...state.loading, invoices: true } }));
    try {
      const user = useAppStore.getState().user;
      const demoClientEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
      
      let dbInvoices = await invoicesService.getAll();
      
      // Add demo invoices for demo client
      if (user && user.email === demoClientEmail) {
        const demoInvoices = [
          {
            id: 'INV-DEMO-001',
            client_id: 1,
            package_name: 'Digital Marketing Package',
            amount: 8000,
            paid: 5000,
            due: 3000,
            status: 'Partial' as const,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'INV-DEMO-002',
            client_id: 1,
            package_name: 'Website Development',
            amount: 7000,
            paid: 5000,
            due: 2000,
            status: 'Partial' as const,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        dbInvoices = [...dbInvoices, ...demoInvoices];
      }
      
      // Convert database Invoice type to store Invoice type
      const invoices: Invoice[] = dbInvoices.map((dbInvoice) => ({
        id: dbInvoice.id,
        clientId: dbInvoice.client_id,
        packageName: dbInvoice.package_name,
        amount: dbInvoice.amount,
        paid: dbInvoice.paid,
        due: dbInvoice.due,
        status: dbInvoice.status,
        createdAt: dbInvoice.created_at,
        updatedAt: dbInvoice.updated_at
      }));
      set({ invoices });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Keep empty array for production
      set({ invoices: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, invoices: false } }));
    }
  },

  fetchPayments: async () => {
    set((state) => ({ loading: { ...state.loading, payments: true } }));
    try {
      const dbPayments = await paymentsService.getAll();
      // Convert database Payment type to store Payment type
      const payments: Payment[] = dbPayments.map((dbPayment) => ({
        id: dbPayment.id,
        clientId: dbPayment.client_id,
        invoiceId: dbPayment.invoice_id,
        amount: dbPayment.amount,
        paymentSource: dbPayment.payment_source,
        status: dbPayment.status,
        paidAt: dbPayment.paid_at,
        receiptFileUrl: dbPayment.receipt_file_url,
        createdAt: dbPayment.created_at,
        updatedAt: dbPayment.updated_at
      }));
      set({ payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Keep empty array for production
      set({ payments: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, payments: false } }));
    }
  },

  fetchComponents: async () => {
    set((state) => ({ loading: { ...state.loading, components: true } }));
    try {
      const user = useAppStore.getState().user;
      const demoClientEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
      
      let dbComponents = await componentsService.getAll();
      console.log('Raw components from database:', dbComponents);
      
      // Add demo components for demo client
      if (user && user.email === demoClientEmail) {
        const demoComponents = [
          {
            id: 'COMP-DEMO-001',
            client_id: 1,
            name: 'Social Media Management',
            price: 'RM 3,000',
            active: true,
            invoice_id: 'INV-DEMO-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'COMP-DEMO-002',
            client_id: 1,
            name: 'Google Ads Campaign',
            price: 'RM 2,500',
            active: true,
            invoice_id: 'INV-DEMO-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'COMP-DEMO-003',
            client_id: 1,
            name: 'SEO Optimization',
            price: 'RM 2,500',
            active: true,
            invoice_id: 'INV-DEMO-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'COMP-DEMO-004',
            client_id: 1,
            name: 'Website Design',
            price: 'RM 4,000',
            active: true,
            invoice_id: 'INV-DEMO-002',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'COMP-DEMO-005',
            client_id: 1,
            name: 'Website Development',
            price: 'RM 3,000',
            active: false,
            invoice_id: 'INV-DEMO-002',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        dbComponents = [...dbComponents, ...demoComponents];
      }
      
      const components: Component[] = dbComponents.map((dbComponent) => ({
        id: dbComponent.id,
        clientId: dbComponent.client_id,
        name: dbComponent.name,
        price: dbComponent.price,
        active: dbComponent.active,
        invoiceId: dbComponent.invoice_id,
        createdAt: dbComponent.created_at,
        updatedAt: dbComponent.updated_at
      }));
      console.log('Mapped components for store:', components);
      set({ components });
    } catch (error) {
      console.error('Error fetching components:', error);
      set({ components: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, components: false } }));
    }
  },

  fetchProgressSteps: async () => {
    set((state) => ({ loading: { ...state.loading, progressSteps: true } }));
    try {
      const user = useAppStore.getState().user;
      const demoClientEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
      
      let dbSteps = await progressService.getAll();
      
      // Add demo progress steps for demo client
      if (user && user.email === demoClientEmail) {
        const demoSteps = [
          {
            id: 'STEP-DEMO-001',
            client_id: 1,
            title: 'Initial Consultation',
            description: 'Understanding client requirements and goals',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completed_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            important: true,
            comments: [],
            created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'STEP-DEMO-002',
            client_id: 1,
            title: 'Digital Marketing Strategy',
            description: 'Develop comprehensive digital marketing strategy',
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completed_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            important: true,
            comments: [],
            created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'STEP-DEMO-003',
            client_id: 1,
            title: 'Website Development',
            description: 'Design and develop responsive website',
            deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            completed_date: undefined,
            important: true,
            comments: [],
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'STEP-DEMO-004',
            client_id: 1,
            title: 'Content Creation',
            description: 'Create engaging content for social media and website',
            deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            completed_date: undefined,
            important: false,
            comments: [],
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        dbSteps = [...dbSteps, ...demoSteps];
      }
      
      const steps: ProgressStep[] = dbSteps.map((dbStep: any) => ({
        ...dbStep,
        clientId: dbStep.client_id,
        completedDate: dbStep.completed_date,
        // Map new deadline fields
        onboardingDeadline: dbStep.onboarding_deadline,
        firstDraftDeadline: dbStep.first_draft_deadline,
        secondDraftDeadline: dbStep.second_draft_deadline,
        onboardingCompleted: dbStep.onboarding_completed,
        firstDraftCompleted: dbStep.first_draft_completed,
        secondDraftCompleted: dbStep.second_draft_completed,
        onboardingCompletedDate: dbStep.onboarding_completed_date,
        firstDraftCompletedDate: dbStep.first_draft_completed_date,
        secondDraftCompletedDate: dbStep.second_draft_completed_date,
        comments: dbStep.comments || [],
        createdAt: dbStep.created_at,
        updatedAt: dbStep.updated_at,
      }));
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('progressStepsCache', JSON.stringify(steps));
      }
      
      set({ progressSteps: steps });
    } catch (error) {
      console.error('Error fetching progress steps:', error);
      set({ progressSteps: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, progressSteps: false } }));
    }
  },

  fetchCalendarEvents: async () => {
    set((state) => ({ loading: { ...state.loading, calendarEvents: true } }));
    try {
      console.log('🔄 fetchCalendarEvents: Fetching from database...');
      const dbEvents = await calendarService.getAll();
      console.log('🔄 fetchCalendarEvents: Raw DB events:', dbEvents);
      
      // Map DatabaseCalendarEvent to store CalendarEvent format
      const events: CalendarEvent[] = dbEvents.map((dbEvent: any) => ({
        id: dbEvent.id,
        clientId: dbEvent.client_id,
        title: dbEvent.title,
        startDate: dbEvent.start_date,
        endDate: dbEvent.end_date,
        startTime: dbEvent.start_time,
        endTime: dbEvent.end_time,
        description: dbEvent.description,
        type: dbEvent.type,
        createdAt: dbEvent.created_at,
        updatedAt: dbEvent.updated_at
      }));
      
      console.log('🔄 fetchCalendarEvents: Mapped events for store:', events);
      set({ calendarEvents: events });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      set({ calendarEvents: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, calendarEvents: false } }));
    }
  },

  fetchChats: async () => {
    set((state) => ({ loading: { ...state.loading, chats: true } }));
    try {
      // Clean orphaned chats first (one-time cleanup)
      try {
        const deletedCount = await chatService.cleanOrphanedChats();
        if (deletedCount > 0) {
          console.log(`Auto-cleaned ${deletedCount} orphaned chat rooms`);
        }
      } catch (error) {
        console.error('Error auto-cleaning orphaned chats:', error);
        // Continue with normal fetch even if cleanup fails
      }
      
      // Merge duplicate chats (one-time cleanup)
      try {
        const mergedCount = await chatService.mergeDuplicateChats();
        if (mergedCount > 0) {
          console.log(`Auto-merged ${mergedCount} duplicate chat rooms`);
        }
      } catch (error) {
        console.error('Error auto-merging duplicate chats:', error);
        // Continue with normal fetch even if merge fails
      }
      
      const dbChats = await chatService.getAll();
      const chats: Chat[] = dbChats.map((dbChat: any) => {
        // Find existing chat to preserve messages
        const existingChat = get().chats.find(chat => chat.id === dbChat.id);
        // Use business_name (company name) instead of client_name (user name)
        const clientName = dbChat.client_business_name || dbChat.client_name || 'Unknown Client';
        return {
          id: dbChat.id,
          clientId: dbChat.client_id,
          client: clientName,
          avatar: generateAvatarUrl(clientName),
          lastMessage: dbChat.last_message, // Use database value
          lastMessageAt: dbChat.last_message_at, // Use database value
          unread_count: dbChat.unread_count || 0, // Use database value
          client_unread_count: dbChat.client_unread_count || 0, // Use database value
          admin_unread_count: dbChat.admin_unread_count || 0, // Use database value
          online: dbChat.online || false,
          messages: existingChat ? existingChat.messages : [], // Preserve existing messages
          createdAt: dbChat.created_at,
          updatedAt: dbChat.updated_at
        };
      });
      
      // Update chats state - this will trigger re-render of chat list
      set({ chats });
      
      // Load messages for all chats
      for (const chat of chats) {
        try {
          const messages = await chatService.getMessages(chat.id);
          set((state) => ({
            chats: state.chats.map((c) => {
              if (c.id !== chat.id) return c;
              // Only update messages if there is a change (by id or count)
              const oldMsgs = c.messages || [];
              if (oldMsgs.length === messages.length && oldMsgs.every((m, i) => m.id === messages[i]?.id)) {
                return c; // No change, skip update
              }
              return {
                ...c,
                messages: messages,
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
        } catch (error) {
          console.error(`Error loading messages for chat ${chat.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      set({ chats: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, chats: false } }));
    }
  },

  fetchTags: async () => {
    set((state) => ({ loading: { ...state.loading, tags: true } }));
    try {
      const dbTags = await tagsService.getAll();
      const tags: Tag[] = dbTags.map((dbTag) => ({
        id: dbTag.id,
        name: dbTag.name,
        color: dbTag.color,
        createdAt: dbTag.created_at,
        updatedAt: dbTag.updated_at
      }));
      set({ tags });
    } catch (error) {
      console.error('Error fetching tags:', error);
      set({ tags: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, tags: false } }));
    }
  },

  fetchUsers: async () => {
    set((state) => ({ loading: { ...state.loading, users: true } }));
    try {
      const dbUsers = await usersService.getAll();
      // Map DatabaseUser to store User format
      const users: User[] = dbUsers.map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        lastLogin: dbUser.last_login || '',
        clientId: dbUser.client_id,
        permissions: dbUser.permissions,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at
      }));
      set({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, users: false } }));
    }
  },

  fetchClientLinks: async (clientId: number) => {
    set(state => ({ loading: { ...state.loading, clientLinks: true } }));
    try {
      const links = await clientLinksService.getByClientId(clientId);
      set({ clientLinks: links });
    } catch (error) {
      console.error('Failed to fetch client links:', error);
      set({ clientLinks: [] });
    } finally {
      set(state => ({ loading: { ...state.loading, clientLinks: false } }));
    }
  },

  // User & Navigation actions
  setUser: (user) => {
    set({ user });
    // Sync with localStorage
    if (typeof window !== 'undefined') {
      if (user) {
        // Convert AppStore format to SupabaseContext format for localStorage
        const supabaseUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          clientId: user.clientId,
          permissions: user.permissions
        };
        localStorage.setItem('demoUser', JSON.stringify(supabaseUser));
      } else {
        localStorage.removeItem('demoUser');
      }
    }
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  setSelectedClient: (client) => {
    set({ selectedClient: client });
  },

  // Real-time polling actions
  startPolling: () => {
    const currentState = get();
    if (!currentState.isPolling) {
      const intervalId = setInterval(() => {
        get().pollForUpdates();
      }, 5000); // Poll every 5 seconds for better performance
      set({ isPolling: true, pollingInterval: intervalId });
    }
  },
  
  stopPolling: () => {
    const currentState = get();
    if (currentState.pollingInterval) {
      clearInterval(currentState.pollingInterval);
      set({ isPolling: false, pollingInterval: null });
    }
  },
  
  pollForUpdates: async () => {
    try {
      // Store previous state for comparison
      const previousChats = get().chats;
      
      // Check for optimistic messages that need to be retried
      const optimisticMessages = previousChats.flatMap(chat => 
        chat.messages
          .filter(msg => msg.id > 999999999)
          .map(msg => ({ chatId: chat.id, message: msg }))
      );
      
      // Retry failed optimistic messages (max 3 retries)
      if (optimisticMessages.length > 0) {
        optimisticMessages.forEach(({ chatId, message }) => {
          // Only retry if message is older than 5 seconds
          const messageAge = Date.now() - message.id;
          if (messageAge > 5000) {
            chatService.sendMessage({
              chat_id: chatId,
              sender: message.sender,
              content: message.content,
              message_type: message.message_type
            }).then((newMessage: any) => {
              // Update optimistic message with real ID
              set((state) => ({
                chats: state.chats.map((chat) =>
                  chat.id === chatId
                    ? {
                        ...chat,
                        messages: chat.messages.map(msg => 
                          msg.id === message.id ? { ...msg, id: newMessage.id } : msg
                        ),
                        updatedAt: new Date().toISOString(),
                      }
                    : chat
                ),
              }));
            }).catch(() => {
              // If retry fails, remove the message after 30 seconds
              if (messageAge > 30000) {
                set((state) => ({
                  chats: state.chats.map((chat) =>
                    chat.id === chatId
                      ? {
                          ...chat,
                          messages: chat.messages.filter(msg => msg.id !== message.id),
                          updatedAt: new Date().toISOString(),
                        }
                      : chat
                  ),
                }));
              }
            });
          }
        });
      }
      
      // Check if there are any optimistic messages (ID > 999999999)
      const hasOptimisticMessages = previousChats.some(chat => 
        chat.messages.some(msg => msg.id > 999999999)
      );
      
      // If there are optimistic messages, reduce polling frequency
      if (hasOptimisticMessages) {
        const now = Date.now();
        const lastPoll = get().lastNonChatPoll || 0;
        if (now - lastPoll < 2000) { // Only poll every 2 seconds if optimistic messages exist
          return;
        }
      }
      
      // Refresh chat data to get latest messages and unread counts
      await get().fetchChats();
      
      // Get updated chats
      const currentChats = get().chats;
      
      // Only reload messages if there are actual changes
      const chatsWithMessages = currentChats.filter(chat => {
        const prevChat = previousChats.find(pc => pc.id === chat.id);
        return chat.messages && chat.messages.length > 0 && 
               (!prevChat || prevChat.lastMessageAt !== chat.lastMessageAt);
      });
      
      // Reload messages for active chats to ensure real-time sync
      // Use Promise.all for parallel loading to reduce delay
      if (chatsWithMessages.length > 0) {
        const messagePromises = chatsWithMessages.map(async (chat) => {
          try {
            await get().loadChatMessages(chat.id);
          } catch (error) {
            console.error(`Error reloading messages for chat ${chat.id}:`, error);
          }
        });
        
        await Promise.all(messagePromises);
      }
      
      // Only reload messages for chats that are currently being viewed (active tab)
      const currentState = get();
      const activeTab = currentState.activeTab;
      
      if (activeTab === 'chat') {
        const allChats = get().chats;
        const emptyChatPromises = allChats
          .filter(chat => chat.messages && chat.messages.length === 0)
          .map(async (chat) => {
            try {
              await get().loadChatMessages(chat.id);
            } catch (error) {
              console.error(`Error loading initial messages for chat ${chat.id}:`, error);
            }
          });
        
        if (emptyChatPromises.length > 0) {
          await Promise.all(emptyChatPromises);
        }
      }
      
      // Reduce polling frequency for non-chat operations to improve performance
      const now = Date.now();
      const lastNonChatPoll = get().lastNonChatPoll || 0;
      const shouldPollNonChat = now - lastNonChatPoll > 10000; // Poll every 10 seconds for non-chat data
      
      if (shouldPollNonChat) {
        // You can add other polling operations here
        // For example: check for new notifications, updates, etc.
        await get().fetchClients();
        await get().fetchUsers();
        const { selectedClient, fetchClientLinks } = get();
        if (selectedClient) {
          await fetchClientLinks(selectedClient.id);
        }
        set({ lastNonChatPoll: now });
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  },

  // Chat actions
  sendMessage: async (chatId, content, sender, attachmentData) => {
    const messageType = attachmentData?.messageType || 'text';
    
    // Create optimistic message immediately for instant UI response
    const optimisticMessage: DatabaseChatMessageType = {
      id: Date.now(),
      chat_id: chatId,
      sender: sender,
      content: content,
      message_type: messageType,
      attachment_url: attachmentData?.attachmentUrl,
      attachment_name: attachmentData?.attachmentName,
      attachment_type: attachmentData?.attachmentType,
      attachment_size: attachmentData?.attachmentSize,
      created_at: new Date().toISOString(),
    };
    
    // Update local state immediately for responsive UI
    set((state) => {
      return {
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, optimisticMessage],
                lastMessage: optimisticMessage.content,
                lastMessageAt: optimisticMessage.created_at,
                // Increment appropriate unread count based on sender
                unread_count: chat.unread_count + 1,
                client_unread_count: sender === 'admin' ? chat.client_unread_count + 1 : chat.client_unread_count,
                admin_unread_count: sender === 'client' ? chat.admin_unread_count + 1 : chat.admin_unread_count,
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      };
    });
    
    // Send message to server in background
    chatService.sendMessage({
      chat_id: chatId,
      sender: sender,
      content: content,
      message_type: messageType,
      attachment_url: attachmentData?.attachmentUrl,
      attachment_name: attachmentData?.attachmentName,
      attachment_type: attachmentData?.attachmentType,
      attachment_size: attachmentData?.attachmentSize
    }).then((newMessage: any) => {
      // Only update ID if server responds successfully
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.map(msg => 
                  msg.id === optimisticMessage.id ? { ...msg, id: newMessage.id } : msg
                ),
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
    }).catch((error) => {
      // Show error to user and remove optimistic message
      console.error('Message send failed:', error);
      
      // Remove the optimistic message from UI
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.filter(msg => msg.id !== optimisticMessage.id),
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
      
      // Show error alert to user
      alert(`Failed to send message: ${error.message || 'Unknown error'}`);
    });
  },
  
  loadChatMessages: async (chatId) => {
    try {
      console.log(`Loading messages for chat ${chatId}...`);
      const messages = await chatService.getMessages(chatId);
      console.log(`Loaded ${messages.length} messages for chat ${chatId}:`, messages);
      
      // Only update if messages have actually changed
      const currentChat = get().chats.find(c => c.id === chatId);
      const currentMessageCount = currentChat?.messages?.length || 0;
      const newMessageCount = messages.length;
      
      if (currentMessageCount !== newMessageCount || 
          JSON.stringify(currentChat?.messages) !== JSON.stringify(messages)) {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: messages,
                  updatedAt: new Date().toISOString(),
                }
              : chat
          ),
        }));
        
        // Log the updated state
        const updatedChat = get().chats.find(c => c.id === chatId);
        console.log(`Updated chat ${chatId} messages:`, updatedChat?.messages);
      } else {
        console.log(`No changes detected for chat ${chatId}, skipping update`);
      }
      
    } catch (error) {
      console.error('Error loading chat messages:', error);
      throw error;
    }
  },
  
  markChatAsRead: async (chatId, userType: 'client' | 'admin') => {
    try {
      await chatService.markAsRead(chatId, userType);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                unread_count: 0,
                client_unread_count: userType === 'client' ? 0 : chat.client_unread_count,
                admin_unread_count: userType === 'admin' ? 0 : chat.admin_unread_count,
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
    } catch (error) {
      console.error('Error marking chat as read:', error);
      // Fallback to local state update
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                unread_count: 0,
                client_unread_count: userType === 'client' ? 0 : chat.client_unread_count,
                admin_unread_count: userType === 'admin' ? 0 : chat.admin_unread_count,
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
    }
  },
  
  createChatForClient: async (clientId) => {
    try {
      const newChat = await chatService.createChat(clientId);
      
      // Convert database chat to local chat format
      const localChat: Chat = {
        id: newChat.id,
        clientId: newChat.client_id,
        client: newChat.client_name,
        avatar: newChat.avatar,
        lastMessage: newChat.last_message,
        lastMessageAt: newChat.last_message_at,
        unread_count: newChat.unread_count,
        client_unread_count: newChat.client_unread_count || 0,
        admin_unread_count: newChat.admin_unread_count || 0,
        online: newChat.online,
        messages: [],
        createdAt: newChat.created_at,
        updatedAt: newChat.updated_at,
      };
      
      set((state) => ({
        chats: [...state.chats, localChat],
      }));
    } catch (error) {
      console.error('Error creating chat for client:', error);
      // Fallback to mock chat creation
      const client = get().clients.find(c => c.id === clientId);
      const mockChat: Chat = {
        id: Date.now(),
        clientId: clientId,
        client: client?.businessName || client?.name || 'Unknown Client',
        avatar: generateAvatarUrl(client?.businessName || client?.name || 'Unknown Client'),
        lastMessage: undefined,
        lastMessageAt: undefined,
        unread_count: 0,
        client_unread_count: 0,
        admin_unread_count: 0,
        online: false,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        chats: [...state.chats, mockChat],
      }));
    }
  },
  
  updateChatOnlineStatus: async (chatId, online) => {
    try {
      await chatService.updateChatOnlineStatus(chatId, online);
      // Optimistically update the store
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, online } : chat
        ),
      }));
    } catch (error) {
      console.error('Error updating chat online status in store:', error);
    }
  },
  
  getUnreadMessagesCount: (userType: 'client' | 'admin' = 'admin') => {
    return get().chats.reduce((total: number, chat: Chat) => {
      if (userType === 'client') {
        return total + (chat.client_unread_count || 0);
      } else {
        return total + (chat.admin_unread_count || 0);
      }
    }, 0);
  },
  
  getChatById: (chatId: number) => {
    return get().chats.find((chat) => chat.id === chatId);
  },

  addClient: async (clientData) => {
    try {
      // First save to database
      const dbClient = await clientsService.create({
        name: clientData.name,
        business_name: clientData.businessName,
        email: clientData.email,
        phone: clientData.phone,
        status: clientData.status as 'Complete' | 'Pending' | 'Inactive',
        pic: clientData.pic,
        tags: clientData.tags || [],
        total_sales: clientData.totalSales || 0,
        total_collection: clientData.totalCollection || 0,
        balance: clientData.balance || 0,
        company: clientData.company,
        address: clientData.address,
        notes: clientData.notes
      });
      
      // Then update local state with database response
      const newClient: Client = {
        id: dbClient.id,
        name: dbClient.name,
        businessName: dbClient.business_name,
        email: dbClient.email,
        phone: dbClient.phone || '',
        status: dbClient.status,
        packageName: clientData.packageName,
        pic: clientData.pic,
        tags: dbClient.tags || [], // Use tags from database response
        totalSales: Number(dbClient.total_sales) || 0,
        totalCollection: Number(dbClient.total_collection) || 0,
        balance: Number(dbClient.balance) || 0,
        lastActivity: dbClient.last_activity || new Date().toISOString(),
        invoiceCount: Number(dbClient.invoice_count) || 0,
        registeredAt: dbClient.registered_at || dbClient.created_at,
        company: dbClient.company,
        address: dbClient.address,
        notes: dbClient.notes,
        createdAt: dbClient.created_at,
        updatedAt: dbClient.updated_at
      };
      
      set((state) => ({
        clients: [...state.clients, newClient],
      }));
      
      // Auto create chat room for new client
      try {
        await get().createChatForClient(newClient.id);
        console.log(`Auto-created chat room for client: ${newClient.name}`);
      } catch (error) {
        console.error('Error auto-creating chat room for new client:', error);
      }
      
      return newClient;
    } catch (error) {
      console.error('Error adding client to database:', error);
      // Re-throw the error to be caught by the component
      throw error;
    }
  },

  updateClient: async (id, updates) => {
    try {
      // Update client in database first (only database fields)
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.businessName) dbUpdates.business_name = updates.businessName;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.status) dbUpdates.status = updates.status as 'Complete' | 'Pending' | 'Inactive';
      if (updates.pic) dbUpdates.pic = updates.pic;
      if (updates.tags) dbUpdates.tags = updates.tags;
      
      // Only update database if there are database fields to update
      if (Object.keys(dbUpdates).length > 0) {
        const updatedDbClient = await clientsService.update(id, dbUpdates);
        
        // Then update local state with database response
        set((state) => {
          const updatedClients = state.clients.map((client) =>
            client.id === id
              ? { 
                  ...client, 
                  ...updates, 
                  tags: updatedDbClient.tags || client.tags, // Use tags from database response
                  updatedAt: new Date().toISOString() 
                }
              : client
          );
          
          return { clients: updatedClients };
        });
      } else {
        // If no database fields to update, just update local state
        set((state) => {
          const updatedClients = state.clients.map((client) =>
            client.id === id
              ? { ...client, ...updates, updatedAt: new Date().toISOString() }
              : client
          );
          
          return { clients: updatedClients };
        });
      }
    } catch (error) {
      console.error('Error updating client:', error);
      // Still update local state even if database fails
      set((state) => {
        const updatedClients = state.clients.map((client) =>
          client.id === id
            ? { ...client, ...updates, updatedAt: new Date().toISOString() }
            : client
        );
        
        return { clients: updatedClients };
      });
    }
  },

  deleteClient: async (id: number) => {
    try {
      // Delete client from database
      await clientsService.delete(id);
      
      // Delete chat room and messages from database
      try {
        await chatService.deleteByClientId(id);
        console.log(`Chat room for client ${id} deleted successfully`);
      } catch (error) {
        console.error('Error deleting chat room:', error);
        // Don't throw error here, continue with client deletion
      }
      
      // Update local state
      set((state) => ({
        clients: state.clients.filter((client) => client.id !== id),
        invoices: state.invoices.filter((invoice) => invoice.clientId !== id),
        payments: state.payments.filter((payment) => payment.clientId !== id),
        components: state.components.filter((component) => component.clientId !== id),
        progressSteps: state.progressSteps.filter((step) => step.clientId !== id),
        calendarEvents: state.calendarEvents.filter((event) => event.clientId !== id),
        chats: state.chats.filter((chat) => chat.clientId !== id),
        clientLinks: state.clientLinks.filter((link) => link.client_id !== id),
      }));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error; // Re-throw to be caught by the component
    }
  },

  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  addInvoice: async (invoiceData) => {
    try {
      // Create invoice in database
      const newDbInvoice = await invoicesService.create({
        client_id: invoiceData.clientId,
        package_name: invoiceData.packageName,
        amount: invoiceData.amount,
        paid: 0,
        due: invoiceData.amount,
        status: 'Pending'
      });
      
      // Convert to store format
      const newInvoice: Invoice = {
        id: newDbInvoice.id,
        clientId: newDbInvoice.client_id,
        packageName: newDbInvoice.package_name,
        amount: newDbInvoice.amount,
        paid: newDbInvoice.paid,
        due: newDbInvoice.due,
        status: newDbInvoice.status,
        createdAt: newDbInvoice.created_at,
        updatedAt: newDbInvoice.updated_at,
      };
      
      // Update client totals in the database
      const client = get().clients.find(c => c.id === invoiceData.clientId);
      if (client) {
        const newTotalSales = client.totalSales + invoiceData.amount;
        const newBalance = client.balance + invoiceData.amount;
        await clientsService.update(client.id, {
          total_sales: newTotalSales,
          balance: newBalance,
          invoice_count: client.invoiceCount + 1,
        });
      }

      // Update local state
      set((state) => ({
        invoices: [...state.invoices, newInvoice],
        clients: state.clients.map((client) =>
          client.id === invoiceData.clientId
            ? {
                ...client,
                totalSales: client.totalSales + invoiceData.amount,
                balance: client.balance + invoiceData.amount,
                invoiceCount: client.invoiceCount + 1,
                updatedAt: new Date().toISOString(),
              }
            : client
        ),
      }));
      
      // Auto create progress step for this invoice
      await get().autoCreateProgressStepsForInvoice(invoiceData.clientId);
      
    } catch (error) {
      console.error('Error adding invoice:', error);
      throw error; // Re-throw error so modal knows creation failed
    }
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

  deleteInvoice: async (invoiceId) => {
    const state = get();
    const invoice = state.invoices.find(inv => inv.id === invoiceId);
    
    if (invoice) {
      try {
        // Delete invoice from database first
        await invoicesService.delete(invoiceId);
        console.log(`Invoice ${invoiceId} deleted from database successfully`);
        
        // Update client totals in the database
        const client = state.clients.find(c => c.id === invoice.clientId);
        if (client) {
          const newTotalSales = Math.max(0, client.totalSales - invoice.amount);
          const newBalance = Math.max(0, client.balance - invoice.amount);
          const newInvoiceCount = Math.max(0, client.invoiceCount - 1);
          
          await clientsService.update(client.id, {
            total_sales: newTotalSales,
            balance: newBalance,
            invoice_count: newInvoiceCount,
          });
          console.log(`Client ${client.id} totals updated in database after invoice deletion`);
        }
        
        // Then update local state
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== invoiceId),
          // Keep components - only delete components tied to this specific invoice
          components: state.components.filter((comp) => comp.invoiceId !== invoiceId),
          clients: state.clients.map((client) =>
            client.id === invoice.clientId
              ? {
                  ...client,
                  totalSales: Math.max(0, client.totalSales - invoice.amount),
                  balance: Math.max(0, client.balance - invoice.amount),
                  invoiceCount: Math.max(0, client.invoiceCount - 1),
                  // Keep package name - don't clear it when deleting invoice
                  updatedAt: new Date().toISOString(),
                }
              : client
          ),
          // Keep progress steps - don't delete them when invoice is deleted
        }));
        
        // Refresh clients data to ensure dashboard and reports are updated
        await get().fetchClients();
        
        // Auto-recalculate totals to fix any inconsistencies
        console.log('🔄 Auto-recalculating totals after invoice deletion...');
        await get().recalculateAllClientTotals();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }
    }
  },

  getInvoicesByClientId: (clientId) => {
    const filteredInvoices = get().invoices.filter((invoice) => invoice.clientId === clientId);
    // Sort by creation date (newest first) to ensure consistent ordering
    return filteredInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addPayment: async (paymentData) => {
    try {
      console.log('🔍 addPayment called with data:', JSON.stringify(paymentData, null, 2));
      
      const numericAmount = Number(paymentData.amount) || 0;
      if (numericAmount <= 0) {
        throw new Error("Invalid payment amount.");
      }

      // Create payment in database
      const newDbPayment = await paymentsService.create({
        client_id: paymentData.clientId,
        invoice_id: paymentData.invoiceId,
        amount: numericAmount,
        payment_source: paymentData.paymentSource,
        status: (paymentData.status || 'Paid') as 'Paid' | 'Pending' | 'Failed' | 'Refunded',
        paid_at: paymentData.paidAt || new Date().toISOString(),
        receipt_file_url: paymentData.receiptUrl || undefined
      });

      // Convert to store format
      const newPayment: Payment = {
        id: newDbPayment.id,
        clientId: newDbPayment.client_id,
        invoiceId: newDbPayment.invoice_id,
        amount: newDbPayment.amount,
        paymentSource: newDbPayment.payment_source,
        status: newDbPayment.status,
        paidAt: newDbPayment.paid_at,
        receiptFileUrl: newDbPayment.receipt_file_url,
        createdAt: newDbPayment.created_at,
        updatedAt: newDbPayment.updated_at,
      };

      // Calculate new invoice totals
      const currentInvoice = get().invoices.find(inv => inv.id === paymentData.invoiceId);
      if (currentInvoice) {
        const newPaidAmount = (Number(currentInvoice.paid) || 0) + numericAmount;
        const newDueAmount = Math.max(0, (Number(currentInvoice.amount) || 0) - newPaidAmount);
        const newStatus = newDueAmount <= 0 ? 'Paid' : 'Partial';

        // Update invoice in database
        await invoicesService.update(paymentData.invoiceId, {
          paid: newPaidAmount,
          due: newDueAmount,
          status: newStatus
        });
      }
      
      // Update client totals in the database
      const clientForPayment = get().clients.find(c => c.id === paymentData.clientId);
      if (clientForPayment) {
        const newTotalCollection = (Number(clientForPayment.totalCollection) || 0) + numericAmount;
        const newBalance = Math.max(0, (Number(clientForPayment.balance) || 0) - numericAmount);
        await clientsService.update(clientForPayment.id, {
          total_collection: newTotalCollection,
          balance: newBalance,
        });
      }

      // Update local state
      set((state) => ({
        payments: [...state.payments, newPayment],
        clients: state.clients.map((client) =>
          client.id === paymentData.clientId
            ? {
                ...client,
                totalCollection: (Number(client.totalCollection) || 0) + numericAmount,
                balance: Math.max(0, (Number(client.balance) || 0) - numericAmount),
                updatedAt: new Date().toISOString(),
              }
            : client
        ),
        invoices: state.invoices.map((invoice) =>
          invoice.id === paymentData.invoiceId
            ? {
                ...invoice,
                paid: (Number(invoice.paid) || 0) + numericAmount,
                due: Math.max(0, (Number(invoice.due) || 0) - numericAmount),
                status: (Number(invoice.due) || 0) - numericAmount <= 0 ? 'Paid' : 'Partial',
                updatedAt: new Date().toISOString(),
              }
            : invoice
        ),
      }));
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error; // Re-throw error so modal knows creation failed
    }
  },

  updatePayment: async (id, updates) => {
    const state = get();
    const payment = state.payments.find(p => p.id === id);
    const oldAmount = payment ? Number(payment.amount) : 0;
    const newAmount = updates.amount ? Number(updates.amount) : oldAmount;
    const amountDifference = newAmount - oldAmount;
    
    console.log('=== updatePayment called ===');
    console.log('Payment ID:', id);
    console.log('Payment object:', payment);
    console.log('Updates object:', updates);
    console.log('Old amount (converted):', oldAmount);
    console.log('New amount (converted):', newAmount);
    console.log('Amount difference:', amountDifference);
    
    // Update payment in database
    if (payment) {
      try {
        console.log('Updating payment in database...');
        await paymentsService.update(id, {
          amount: newAmount, // Ensure it's a number
          payment_source: updates.paymentSource || payment.paymentSource,
          status: (updates.status || payment.status) as 'Paid' | 'Pending' | 'Failed' | 'Refunded',
          paid_at: updates.paidAt || payment.paidAt,
          receipt_file_url: updates.receiptFileUrl || updates.receiptUrl || payment.receiptFileUrl
        });
        console.log('Payment updated in database successfully');
        
        // Update invoice in database with recalculated totals
        const invoice = state.invoices.find(inv => inv.id === payment.invoiceId);
        if (invoice) {
          const currentPaid = Number(invoice.paid);
          const invoiceAmount = Number(invoice.amount);
          const newPaidAmount = currentPaid + amountDifference;
          const newDueAmount = Math.max(0, invoiceAmount - newPaidAmount);
          const newStatus = newDueAmount <= 0 ? 'Paid' : 'Partial';

          console.log('Invoice update:', {
            invoiceId: invoice.id,
            invoiceObject: invoice,
            oldPaid: currentPaid,
            newPaidAmount,
            newDueAmount,
            newStatus
          });

          await invoicesService.update(payment.invoiceId, {
            paid: newPaidAmount,
            due: newDueAmount,
            status: newStatus
          });
          console.log('Invoice updated in database successfully');
        }
        
        // Also update client totals in the database
        const client = state.clients.find(c => c.id === payment.clientId);
        if (client) {
          // Debug: Show all payments for this client
          const allClientPayments = state.payments.filter(p => p.clientId === payment.clientId);
          console.log('All payments for this client:', allClientPayments);
          
          // Calculate what the total collection SHOULD be based on all payments
          const actualTotalCollection = allClientPayments.reduce((total, p) => {
            const amount = p.id === id ? newAmount : Number(p.amount); // Use new amount for the payment being updated
            return total + amount;
          }, 0);
          
          console.log('Calculated total collection from all payments:', actualTotalCollection);
          
          const currentTotalCollection = Number(client.totalCollection);
          const currentBalance = Number(client.balance);
          const newTotalCollection = currentTotalCollection + amountDifference;
          const newBalance = Math.max(0, currentBalance - amountDifference);
          
          console.log('Client update:', {
            clientId: client.id,
            clientObject: client,
            oldTotalCollection: currentTotalCollection,
            newTotalCollection,
            oldBalance: currentBalance,
            newBalance,
            amountDifference,
            actualTotalCollection: actualTotalCollection,
            shouldBeCollection: actualTotalCollection // What it should be
          });
          
          // Use the calculated actual total instead of adding difference
          await clientsService.update(client.id, {
            total_collection: actualTotalCollection, // Use calculated total instead
            balance: Math.max(0, client.totalSales - actualTotalCollection),
          });
          console.log('Client updated in database with recalculated totals');
        }

      } catch (error) {
        console.error('Error updating payment:', error);
        throw error; // Re-throw error
      }
    }

    // This part optimistically updates the UI.
    // It's wrapped in the main function body, not inside the try/catch,
    // so the UI updates regardless of the DB call outcome.
    // This is generally acceptable for a good user experience.
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

  deletePayment: async (id) => {
    const state = get();
    const payment = state.payments.find(p => p.id === id);
    
    if (payment) {
      try {
        // Delete payment from database first
        await paymentsService.delete(id);
        console.log(`Payment ${id} deleted from database successfully`);
        
        // Update client totals in the database
        const client = state.clients.find(c => c.id === payment.clientId);
        if (client) {
          const newTotalCollection = Math.max(0, client.totalCollection - payment.amount);
          const newBalance = client.balance + payment.amount;
          await clientsService.update(client.id, {
            total_collection: newTotalCollection,
            balance: newBalance,
          });
        }
        
        // Update invoice totals in the database
        const invoice = state.invoices.find(inv => inv.id === payment.invoiceId);
        if (invoice) {
          const newPaidAmount = Math.max(0, invoice.paid - payment.amount);
          const newDueAmount = invoice.due + payment.amount;
          const newStatus = newDueAmount <= 0 ? 'Paid' : 'Pending';

          await invoicesService.update(payment.invoiceId, {
            paid: newPaidAmount,
            due: newDueAmount,
            status: newStatus
          });
        }
        
        // Then update local state
        set((state) => ({
          payments: state.payments.filter((payment) => payment.id !== id),
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
                  status: (invoice.due + payment.amount) <= 0 ? 'Paid' : 'Pending',
                  updatedAt: new Date().toISOString(),
                }
              : invoice
          ),
        }));
        
        // Refresh clients data to ensure dashboard and reports are updated
        await get().fetchClients();
        
        // Auto-recalculate totals to fix any inconsistencies
        console.log('🔄 Auto-recalculating totals after payment deletion...');
        await get().recalculateAllClientTotals();
      } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
      }
    }
  },

  getPaymentsByClientId: (clientId) => {
    return get().payments.filter((payment) => payment.clientId === clientId);
  },

  addComponent: async (componentData) => {
    console.log('=== addComponent called ===');
    console.log('Raw componentData received:', componentData);
    console.log('componentData.clientId:', componentData.clientId);
    console.log('componentData.invoiceId:', componentData.invoiceId);
    
    try {
      console.log('Calling componentsService.create with:', componentData);
      const newDbComponent = await componentsService.create(componentData);
      console.log('Component saved to database:', newDbComponent);
      const newComponent: Component = {
        id: newDbComponent.id,
        clientId: newDbComponent.client_id,
        invoiceId: newDbComponent.invoice_id,
        name: newDbComponent.name,
        price: newDbComponent.price,
        active: newDbComponent.active,
        createdAt: newDbComponent.created_at,
        updatedAt: newDbComponent.updated_at,
      };
      console.log('Component mapped for store:', newComponent);

      set((state) => ({
        components: [...state.components, newComponent],
      }));
      
      // Also create a corresponding progress step
      await get().addProgressStep({
        clientId: newComponent.clientId,
        title: newComponent.name,
        description: `Complete the ${newComponent.name} component`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        important: false,
        comments: []
      });

    } catch (error) {
      console.error('Error adding component:', error);
      throw error;
    }
  },

  addComponents: async (componentsData) => {
    // This can be optimized to a single batch insert if the service supports it
    try {
      for (const component of componentsData) {
        await get().addComponent(component);
      }
    } catch (error) {
      console.error('Error adding multiple components:', error);
      throw error;
    }
  },
  
  updateComponent: async (id, updates) => {
    try {
      const updatedDbComponent = await componentsService.update(id, updates);
       const updatedComponent: Component = {
        id: updatedDbComponent.id,
        clientId: updatedDbComponent.client_id,
        invoiceId: updatedDbComponent.invoice_id,
        name: updatedDbComponent.name,
        price: updatedDbComponent.price,
        active: updatedDbComponent.active,
        createdAt: updatedDbComponent.created_at,
        updatedAt: updatedDbComponent.updated_at,
      };
      set((state) => ({
        components: state.components.map((component) =>
          component.id === id ? updatedComponent : component
        ),
      }));
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  },

  deleteComponent: async (id) => {
    try {
      await componentsService.delete(id);
      set((state) => ({
        components: state.components.filter((component) => component.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  },

  getComponentsByClientId: (clientId) => {
    const filteredComponents = get().components.filter((component) => component.clientId === clientId);
    // Sort by ID to maintain consistent order
    return filteredComponents.sort((a, b) => {
      // For bulk components, sort by the number in the ID to maintain proper order
      const aMatch = a.id.match(/bulk_\d+_(\d+)_/);
      const bMatch = b.id.match(/bulk_\d+_(\d+)_/);
      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[1]);
        const bNum = parseInt(bMatch[1]);
        return aNum - bNum; // Lower number first (like KOMPONEN #1, #2, #3)
      }
      // For other components, sort by creation date (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },

  getComponentsByInvoiceId: (invoiceId) => {
    const allComponents = get().components;
    const filteredComponents = allComponents.filter((component) => component.invoiceId === invoiceId);
    // Sort by ID to maintain consistent order
    return filteredComponents.sort((a, b) => {
      // For bulk components, sort by the number in the ID to maintain proper order
      const aMatch = a.id.match(/bulk_\d+_(\d+)_/);
      const bMatch = b.id.match(/bulk_\d+_(\d+)_/);
      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[1]);
        const bNum = parseInt(bMatch[1]);
        return aNum - bNum; // Lower number first (like KOMPONEN #1, #2, #3)
      }
      // For other components, sort by creation date (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },

  addProgressStep: async (stepData) => {
    try {
      // Map clientId to client_id for database
      const dbStepData = {
        ...stepData,
        client_id: stepData.clientId,
      };
      const newDbStep = await progressService.create(dbStepData);
      const newStep: ProgressStep = {
        id: newDbStep.id,
        clientId: newDbStep.client_id,
        title: newDbStep.title,
        description: newDbStep.description,
        deadline: newDbStep.deadline,
        completed: newDbStep.completed,
        completedDate: newDbStep.completed_date,
        important: newDbStep.important,
        comments: newDbStep.comments || [],
        createdAt: newDbStep.created_at,
        updatedAt: newDbStep.updated_at,
      };
      set((state) => {
        const updatedSteps = [...state.progressSteps, newStep];
        
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('progressStepsCache', JSON.stringify(updatedSteps));
        }
        
        return { progressSteps: updatedSteps };
      });
    } catch (error) {
      console.error('Error adding progress step:', error);
      throw error;
    }
  },

  updateProgressStep: async (id, updates) => {
    try {
      // Map store format to database format
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.completedDate !== undefined) dbUpdates.completed_date = updates.completedDate;
      if (updates.important !== undefined) dbUpdates.important = updates.important;
      
      // Handle new deadline fields
      if (updates.onboardingDeadline !== undefined) dbUpdates.onboarding_deadline = updates.onboardingDeadline;
      if (updates.firstDraftDeadline !== undefined) dbUpdates.first_draft_deadline = updates.firstDraftDeadline;
      if (updates.secondDraftDeadline !== undefined) dbUpdates.second_draft_deadline = updates.secondDraftDeadline;
      if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
      if (updates.firstDraftCompleted !== undefined) dbUpdates.first_draft_completed = updates.firstDraftCompleted;
      if (updates.secondDraftCompleted !== undefined) dbUpdates.second_draft_completed = updates.secondDraftCompleted;
      if (updates.onboardingCompletedDate !== undefined) dbUpdates.onboarding_completed_date = updates.onboardingCompletedDate;
      if (updates.firstDraftCompletedDate !== undefined) dbUpdates.first_draft_completed_date = updates.firstDraftCompletedDate;
      if (updates.secondDraftCompletedDate !== undefined) dbUpdates.second_draft_completed_date = updates.secondDraftCompletedDate;
      
      // Update in database
      const updatedDbStep = await progressService.update(id, dbUpdates);
      
      // Update local state
      set((state) => {
        const updatedSteps = state.progressSteps.map((step) =>
          step.id === id
            ? { 
                ...step, 
                ...updates, 
                completedDate: updatedDbStep.completed_date,
                updatedAt: updatedDbStep.updated_at 
              }
            : step
        );
        
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('progressStepsCache', JSON.stringify(updatedSteps));
        }
        
        return { progressSteps: updatedSteps };
      });
    } catch (error) {
      console.error('Error updating progress step:', error);
      throw error;
    }
  },

  deleteProgressStep: (id: string) => {
    set((state) => {
      const updatedSteps = state.progressSteps.filter((step) => step.id !== id);
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('progressStepsCache', JSON.stringify(updatedSteps));
      }
      
      return { progressSteps: updatedSteps };
    });
    progressService.delete(id).catch(err => console.error("Failed to delete progress step on server", err));
  },

  getProgressStepsByClientId: (clientId: number) => {
    const steps = get().progressSteps.filter((step) => step.clientId === clientId);
    // Sort by creation date (oldest first) to maintain proper order
    return steps.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  },

  // Helper function to calculate consistent progress status
  calculateClientProgressStatus: (clientId: number) => {
    const steps = get().progressSteps.filter(step => step.clientId === clientId);
    const now = new Date();
    
    const hasOverdueSteps = steps.some(step => {
      if (step.completed) return false;
      const deadline = new Date(step.deadline);
      return now > deadline;
    });
    
    const completedSteps = steps.filter(step => step.completed).length;
    const totalSteps = steps.length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    return {
      hasOverdue: hasOverdueSteps,
      percentage: progressPercentage,
      overdueCount: steps.filter(step => {
        if (step.completed) return false;
        const deadline = new Date(step.deadline);
        return now > deadline;
      }).length,
      completedSteps,
      totalSteps
    };
  },

  addCommentToStep: async (stepId, comment) => {
    const newComment = await progressService.addComment({
      step_id: stepId,
      text: comment.text,
      username: comment.username,
      attachment_url: comment.attachment_url,
      attachment_type: comment.attachment_type,
    });

    set(state => {
      const updatedSteps = state.progressSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            comments: [...step.comments, newComment]
          };
        }
        return step;
      });
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('progressStepsCache', JSON.stringify(updatedSteps));
      }
      
      return { progressSteps: updatedSteps };
    });
  },

  deleteCommentFromStep: async (stepId, commentId) => {
    await progressService.deleteComment(commentId);
    set(state => {
      const updatedSteps = state.progressSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            comments: step.comments.filter(c => c.id !== commentId)
          };
        }
        return step;
      });
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('progressStepsCache', JSON.stringify(updatedSteps));
      }
      
      return { progressSteps: updatedSteps };
    });
  },

  addCalendarEvent: async (event) => {
    try {
      // Map store format to database format
      const dbEventData = {
        client_id: event.clientId,
        title: event.title,
        start_date: event.startDate,
        end_date: event.endDate,
        start_time: event.startTime,
        end_time: event.endTime,
        description: event.description,
        type: event.type as 'meeting' | 'payment' | 'deadline' | 'call'
      };
      
      const newDbEvent = await calendarService.create(dbEventData);
      
      // Map back to store format
      const newEvent: CalendarEvent = {
        id: newDbEvent.id,
        clientId: newDbEvent.client_id,
        title: newDbEvent.title,
        startDate: newDbEvent.start_date,
        endDate: newDbEvent.end_date,
        startTime: newDbEvent.start_time,
        endTime: newDbEvent.end_time,
        description: newDbEvent.description,
        type: newDbEvent.type,
        createdAt: newDbEvent.created_at,
        updatedAt: newDbEvent.updated_at
      };
      
      set((state) => ({
        calendarEvents: [...state.calendarEvents, newEvent],
      }));
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  },

  updateCalendarEvent: async (id, updates) => {
    try {
      console.log('🔍 AppStore updateCalendarEvent called:');
      console.log('  Event ID:', id);
      console.log('  Updates received:', updates);
      
      // Map store format to database format
      const dbUpdates: any = {};
      if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      
      console.log('  Mapped dbUpdates:', dbUpdates);
      
      const updatedDbEvent = await calendarService.update(id, dbUpdates);
      console.log('  Updated event from database:', updatedDbEvent);
      
      // Map back to store format
      const updatedEvent: CalendarEvent = {
        id: updatedDbEvent.id,
        clientId: updatedDbEvent.client_id,
        title: updatedDbEvent.title,
        startDate: updatedDbEvent.start_date,
        endDate: updatedDbEvent.end_date,
        startTime: updatedDbEvent.start_time,
        endTime: updatedDbEvent.end_time,
        description: updatedDbEvent.description,
        type: updatedDbEvent.type,
        createdAt: updatedDbEvent.created_at,
        updatedAt: updatedDbEvent.updated_at
      };
      
      set((state) => ({
        calendarEvents: state.calendarEvents.map((event) =>
          event.id === id ? updatedEvent : event
        ),
      }));
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  deleteCalendarEvent: async (id) => {
    try {
      await calendarService.delete(id);
      set((state) => ({
        calendarEvents: state.calendarEvents.filter((event) => event.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  addTag: async (tagData) => {
    try {
      const dbTag = await tagsService.create(tagData);
      const newTag: Tag = {
        id: dbTag.id,
        name: dbTag.name,
        color: dbTag.color,
        createdAt: dbTag.created_at,
        updatedAt: dbTag.updated_at
      };
      set((state) => ({
        tags: [...state.tags, newTag]
      }));
      return newTag;
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error;
    }
  },

  updateTag: async (id, updates) => {
    try {
      const dbTag = await tagsService.update(id, updates);
      const updatedTag: Tag = {
        id: dbTag.id,
        name: dbTag.name,
        color: dbTag.color,
        createdAt: dbTag.created_at,
        updatedAt: dbTag.updated_at
      };
      set((state) => ({
        tags: state.tags.map((tag) =>
          tag.id === id ? updatedTag : tag
        ),
      }));
    } catch (error) {
      console.error('Error updating tag:', error);
      throw error;
    }
  },

  deleteTag: async (id) => {
    try {
      await tagsService.delete(id);
      set((state) => ({
        tags: state.tags.filter((tag) => tag.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting tag:', error);
      throw error;
    }
  },

  addUser: async (userData) => {
    try {
      console.log('🔍 Debug addUser - userData received:', JSON.stringify(userData, null, 2));
      
      // Extract password from appropriate access type
      let password = 'defaultpass123';
      if ((userData as any).dashboardAccess?.password) {
        password = (userData as any).dashboardAccess.password;
        console.log('🔑 Using dashboard password');
      } else if ((userData as any).portalAccess?.password) {
        password = (userData as any).portalAccess.password;
        console.log('🔑 Using portal password');
      } else {
        console.log('⚠️ No password provided, using default');
      }
      
      // Map store User format to DatabaseUser format
      const dbUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role as 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team',
        status: userData.status as 'Active' | 'Inactive',
        client_id: userData.clientId,
        permissions: userData.permissions,
        password: password
      };
      
      console.log('🔍 Debug addUser - dbUserData to create:', JSON.stringify(dbUserData, null, 2));
      
      const newDbUser = await usersService.create(dbUserData);
      
      // Map back to store format
      const newUser: User = {
        id: newDbUser.id,
        name: newDbUser.name,
        email: newDbUser.email,
        role: newDbUser.role,
        status: newDbUser.status,
        lastLogin: newDbUser.last_login || '',
        clientId: newDbUser.client_id,
        permissions: newDbUser.permissions,
        createdAt: newDbUser.created_at,
        updatedAt: newDbUser.updated_at
      };
      
      set((state) => ({
        users: [...state.users, newUser],
      }));
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    try {
      console.log('🔍 Debug updateUser - updates received:', JSON.stringify(updates, null, 2));
      
      // Extract password from appropriate access type
      let password = undefined;
      if ((updates as any).dashboardAccess?.password) {
        password = (updates as any).dashboardAccess.password;
        console.log('🔑 Using dashboard password for update');
      } else if ((updates as any).portalAccess?.password) {
        password = (updates as any).portalAccess.password;
        console.log('🔑 Using portal password for update');
      } else {
        console.log('⚠️ No password provided for update');
      }
      
      // Map store updates to database format
      const dbUpdates = {
        name: updates.name,
        email: updates.email,
        role: updates.role as 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team' | undefined,
        status: updates.status as 'Active' | 'Inactive' | undefined,
        client_id: updates.clientId,
        permissions: updates.permissions,
        password: password
      };
      
      console.log('🔍 Debug updateUser - dbUpdates to send:', JSON.stringify(dbUpdates, null, 2));
      
      const updatedDbUser = await usersService.update(id, dbUpdates);
      
      // Map back to store format and update state
      const updatedUser = {
        id: updatedDbUser.id,
        name: updatedDbUser.name,
        email: updatedDbUser.email,
        role: updatedDbUser.role,
        status: updatedDbUser.status,
        lastLogin: updatedDbUser.last_login || '',
        clientId: updatedDbUser.client_id,
        permissions: updatedDbUser.permissions,
        createdAt: updatedDbUser.created_at,
        updatedAt: updatedDbUser.updated_at
      };
      
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? updatedUser : user
        ),
      }));

      // Clean up PIC references if user role changed from Team to something else
      if (updates.role && updates.role !== 'Team') {
        const currentUser = get().users.find(u => u.id === id);
        if (currentUser && currentUser.role === 'Team') {
          await get().cleanupPicReferences(currentUser.name, `role changed from Team to ${updates.role}`);
        }
      }

      // Clean up PIC references if user status changed to Inactive
      if (updates.status === 'Inactive') {
        const currentUser = get().users.find(u => u.id === id);
        if (currentUser && currentUser.role === 'Team') {
          await get().cleanupPicReferences(currentUser.name, 'status changed to Inactive');
        }
      }
      
      // Return success status for toast notification
      return { success: true, passwordUpdated: !!password };
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      // Get user info before deletion for PIC cleanup
      const userToDelete = get().users.find(u => u.id === id);
      
      await usersService.delete(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));

      // Clean up PIC references if deleted user was a Team member
      if (userToDelete && userToDelete.role === 'Team') {
        await get().cleanupPicReferences(userToDelete.name, 'user deleted');
      }

      // Clean up PIC references if deleted user was inactive Team member
      if (userToDelete && userToDelete.role === 'Team' && userToDelete.status === 'Inactive') {
        await get().cleanupPicReferences(userToDelete.name, 'inactive user deleted');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },



  autoCreateProgressStepsForInvoice: async (clientId: number) => {
    try {
      const state = get();
      const clientInvoices = state.invoices.filter(inv => inv.clientId === clientId);
      
      // Only create progress step for the latest invoice
      const latestInvoice = clientInvoices[clientInvoices.length - 1];
      if (!latestInvoice) return;
      
      // Check if progress step already exists for this invoice
      const existingStep = state.progressSteps.find(step => 
        step.clientId === clientId && 
        step.title === `${latestInvoice.packageName} - Package Setup`
      );
      
      if (existingStep) {
        console.log(`Progress step already exists for invoice ${latestInvoice.packageName}`);
        return;
      }
      
      // Create progress step for the invoice
      const newStep = await progressService.create({
        client_id: clientId,
        title: `${latestInvoice.packageName} - Package Setup`,
        description: `Complete the setup and delivery of ${latestInvoice.packageName} package`,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        important: true,
        comments: []
      });
      
      const stepForStore: ProgressStep = {
        ...newStep,
        clientId: newStep.client_id,
        completedDate: newStep.completed_date,
        comments: newStep.comments || [],
        createdAt: newStep.created_at,
        updatedAt: newStep.updated_at,
      };
      
      set(state => ({
        progressSteps: [...state.progressSteps, stepForStore]
      }));
      
      console.log(`Auto-created progress step for invoice: ${latestInvoice.packageName}`);
      
    } catch (error) {
      console.error('Error auto-creating progress step for invoice:', error);
    }
  },

  addClientLink: async (linkData) => {
    try {
      // Determine link type based on current user
      const currentUser = get().user;
      const linkType = currentUser?.role === 'Client Admin' || currentUser?.role === 'Client Team' ? 'client' : 'admin';
      const createdBy = currentUser?.role === 'Client Admin' || currentUser?.role === 'Client Team' ? 'client' : 'admin';
      
      const newLink = await clientLinksService.create({
        ...linkData,
        created_by: createdBy,
        link_type: linkType,
        user_id: currentUser?.id,
        user_role: currentUser?.role
      });
      
      set(state => ({
        clientLinks: [...state.clientLinks, newLink]
      }));
    } catch (error) {
      console.error('Failed to add client link:', error);
      throw error;
    }
  },

  deleteClientLink: async (id) => {
    try {
      await clientLinksService.delete(id);
      set(state => ({
        clientLinks: state.clientLinks.filter(link => link.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete client link:', error);
      throw error;
    }
  },

  getClientLinksByClientId: (clientId) => {
    return get().clientLinks.filter(link => link.client_id === clientId);
  },

  getClientRole: (clientId) => {
    const users = get().users;
    const clientUser = users.find(user => user.clientId === clientId);
    return clientUser ? clientUser.role : 'Client';
  },

  getTotalSales: () => {
    const total = get().clients.reduce((total, client) => {
      const clientSales = Number(client.totalSales) || 0;
      return total + clientSales;
    }, 0);
    console.log('📊 getTotalSales called:', {
      clients: get().clients.map(c => ({ id: c.id, name: c.name, totalSales: c.totalSales })),
      total
    });
    return total;
  },

  getTotalCollection: () => {
    const total = get().clients.reduce((total, client) => {
      const clientCollection = Number(client.totalCollection) || 0;
      return total + clientCollection;
    }, 0);
    console.log('📊 getTotalCollection called:', {
      clients: get().clients.map(c => ({ id: c.id, name: c.name, totalCollection: c.totalCollection })),
      total
    });
    return total;
  },

  getTotalBalance: () => {
    const total = get().clients.reduce((total, client) => {
      const clientBalance = Number(client.balance) || 0;
      return total + clientBalance;
    }, 0);
    console.log('📊 getTotalBalance called:', {
      clients: get().clients.map(c => ({ id: c.id, name: c.name, balance: c.balance })),
      total
    });
    return total;
  },

  // Get sales data grouped by payment date (month/year)
  getSalesByPaymentDate: () => {
    const payments = get().payments;
    const salesByMonth: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      if (payment.status === 'Paid' && payment.paidAt) {
        const paymentDate = new Date(payment.paidAt);
        const monthKey = paymentDate.toISOString().slice(0, 7); // YYYY-MM format
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = 0;
        }
        salesByMonth[monthKey] += Number(payment.amount) || 0;
      }
    });
    
    return salesByMonth;
  },

  // Get monthly sales data for current year (based on total sales, not collections)
  getMonthlySalesData: () => {
    const currentYear = new Date().getFullYear();
    const invoices = get().invoices;
    const salesByMonth: { [key: string]: number } = {};
    
    console.log('🔍 getMonthlySalesData Debug:', {
      currentYear,
      invoicesCount: invoices.length,
      invoicesData: invoices.map(inv => ({
        id: inv.id,
        amount: inv.amount,
        createdAt: inv.createdAt,
        year: new Date(inv.createdAt).getFullYear()
      }))
    });
    
    // Group sales by invoice creation month (not payment date)
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      if (invoiceDate.getFullYear() === currentYear) {
        const monthKey = invoiceDate.toISOString().slice(0, 7); // YYYY-MM format
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = 0;
        }
        salesByMonth[monthKey] += Number(invoice.amount) || 0;
        
        console.log(`📊 Adding invoice ${invoice.id}: RM${invoice.amount} to ${monthKey}`);
      }
    });
    
    console.log('📊 Sales by month:', salesByMonth);
    
    return Array.from({ length: 12 }, (_, index) => {
      const month = (index + 1).toString().padStart(2, '0');
      const monthKey = `${currentYear}-${month}`;
      const monthName = new Date(currentYear, index, 1).toLocaleDateString('en-US', { month: 'long' });
      const sales = salesByMonth[monthKey] || 0;
      
      return {
        month: monthName,
        sales: sales,
        displayValue: `RM ${sales.toLocaleString()}`
      };
    });
  },

  // Add this new function to recalculate all client financial data
  recalculateAllClientTotals: async () => {
    console.log('=== Recalculating all client financial data ===');
    const state = get();
    
    // First, refresh all data from database to ensure we have the latest
    console.log('🔄 Refreshing data from database...');
    await Promise.all([
      get().fetchInvoices(),
      get().fetchPayments(),
      get().fetchClients()
    ]);
    
    const updatedState = get();
    console.log('📊 Current invoices in database:', updatedState.invoices.map(inv => ({
      id: inv.id,
      clientId: inv.clientId,
      packageName: inv.packageName,
      amount: inv.amount
    })));
    
    for (const client of updatedState.clients) {
      console.log(`Recalculating for client ${client.id} (${client.name})`);
      
      // Get all invoices for this client
      const clientInvoices = updatedState.invoices.filter(inv => inv.clientId === client.id);
      const totalSales = clientInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      
      // Get all payments for this client
      const clientPayments = updatedState.payments.filter(pay => pay.clientId === client.id);
      const totalCollection = clientPayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
      
      // Calculate balance
      const balance = Math.max(0, totalSales - totalCollection);
      
      console.log(`Client ${client.id} recalculated:`, {
        oldTotalSales: client.totalSales,
        newTotalSales: totalSales,
        oldTotalCollection: client.totalCollection,
        newTotalCollection: totalCollection,
        oldBalance: client.balance,
        newBalance: balance,
        invoiceCount: clientInvoices.length,
        invoices: clientInvoices.map(inv => ({ id: inv.id, amount: inv.amount }))
      });
      
      // Update in database
      try {
        await clientsService.update(client.id, {
          total_sales: totalSales,
          total_collection: totalCollection,
          balance: balance,
          invoice_count: clientInvoices.length
        });
        console.log(`Client ${client.id} updated in database`);
      } catch (error) {
        console.error(`Error updating client ${client.id}:`, error);
      }
    }
    
    // Refresh clients data
    await get().fetchClients();
    console.log('All client financial data recalculated and refreshed');
  },

  createTestUsers: async () => {
    try {
      // Add a Super Admin user
      await get().addUser({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: 'Super Admin',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        clientId: undefined, // No client for super admin
        permissions: ['all']
      });
      console.log('Super Admin user created.');

      // Add a Team user
      await get().addUser({
        name: 'Team User',
        email: 'teamuser@example.com',
        role: 'Team',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        clientId: 1, // Assuming client 1 exists for this example
        permissions: ['read', 'write']
      });
      console.log('Team user created.');

      // Add a Client Admin user
      await get().addUser({
        name: 'Client Admin',
        email: 'clientadmin@example.com',
        role: 'Client Admin',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        clientId: 2, // Assuming client 2 exists for this example
        permissions: ['read', 'write']
      });
      console.log('Client Admin user created.');

      // Add a Client Team user
      await get().addUser({
        name: 'Client Team User',
        email: 'clientteamuser@example.com',
        role: 'Client Team',
        status: 'Active',
        lastLogin: new Date().toISOString(),
        clientId: 2, // Assuming client 2 exists for this example
        permissions: ['read']
      });
      console.log('Client Team user created.');

      console.log('All test users created successfully.');
    } catch (error) {
      console.error('Error creating test users:', error);
      throw error;
    }
  },

  cleanOrphanedChats: async () => {
    try {
      const deletedCount = await chatService.cleanOrphanedChats();
      console.log(`Cleaned ${deletedCount} orphaned chat rooms`);
      
      // Refresh chats after cleaning
      await get().fetchChats();
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning orphaned chats:', error);
      throw error;
    }
  },

  mergeDuplicateChats: async () => {
    try {
      const mergedCount = await chatService.mergeDuplicateChats();
      console.log(`Merged ${mergedCount} duplicate chat rooms`);
      
      // Refresh chats after merging
      await get().fetchChats();
      
      return mergedCount;
    } catch (error) {
      console.error('Error merging duplicate chats:', error);
      throw error;
    }
  },

  refreshDashboardData: async () => {
    try {
      console.log('🔄 Refreshing dashboard data...');
      await Promise.all([
        get().fetchClients(),
        get().fetchInvoices(),
        get().fetchPayments(),
        get().fetchComponents(),
        get().fetchProgressSteps(),
        get().fetchCalendarEvents(),
        get().fetchChats(),
        get().fetchTags(),
        get().fetchUsers(),
        get().fetchAddOnServices(),
        get().fetchClientServiceRequests()
      ]);
      console.log('✅ Dashboard data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      throw error;
    }
  },

  getAdminTeam: async () => {
    try {
      const dbUsers = await usersService.getAdminTeam();
      const users: User[] = dbUsers.map((dbUser) => ({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        status: dbUser.status,
        lastLogin: dbUser.last_login || new Date().toISOString(),
        clientId: dbUser.client_id,
        permissions: dbUser.permissions || [],
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at
      }));
      return users;
    } catch (error) {
      console.error('Error fetching admin team:', error);
      throw error;
    }
  },

  assignUserToClient: async (userId: string, clientId: number) => {
    try {
      const updatedUser = await usersService.assignToClient(userId, clientId);
      
      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId
            ? { ...user, clientId: updatedUser.client_id }
            : user
        ),
      }));
      
      console.log(`User ${userId} assigned to client ${clientId}`);
    } catch (error) {
      console.error('Error assigning user to client:', error);
      throw error;
    }
  },

  // Client Files actions
  fetchClientFiles: async (clientId: number) => {
    set((state) => ({ loading: { ...state.loading, clientFiles: true } }));
    try {
      console.log(`🔄 Fetching files for client ${clientId}...`);
      const dbFiles = await clientFilesService.getByClientId(clientId);
      console.log('📋 Raw database files count:', dbFiles.length);
      
      if (dbFiles.length > 0) {
        console.log('📋 Sample raw database file:', {
          id: dbFiles[0].id,
          clientId: dbFiles[0].clientId,
          fileName: dbFiles[0].fileName,
          fileSize: dbFiles[0].fileSize
        });
      }
      
      const files: ClientFile[] = dbFiles.map((dbFile) => ({
        id: dbFile.id,
        clientId: dbFile.clientId || dbFile.client_id,
        fileName: dbFile.fileName || dbFile.file_name,
        fileSize: dbFile.fileSize || dbFile.file_size,
        fileUrl: dbFile.fileUrl || dbFile.file_url,
        fileType: dbFile.fileType || dbFile.file_type,
        uploadDate: (dbFile.uploadDate || dbFile.upload_date) instanceof Date ? (dbFile.uploadDate || dbFile.upload_date).toISOString() : (dbFile.uploadDate || dbFile.upload_date),
        createdAt: (dbFile.createdAt || dbFile.created_at) instanceof Date ? (dbFile.createdAt || dbFile.created_at).toISOString() : (dbFile.createdAt || dbFile.created_at),
        updatedAt: (dbFile.updatedAt || dbFile.updated_at) instanceof Date ? (dbFile.updatedAt || dbFile.updated_at).toISOString() : (dbFile.updatedAt || dbFile.updated_at)
      }));
      
      console.log('📄 Processed files count:', files.length);
      
      if (files.length > 0) {
        console.log('📄 Sample processed file:', {
          id: files[0].id,
          clientId: files[0].clientId,
          fileName: files[0].fileName,
          fileSize: files[0].fileSize
        });
      }
      
      set((state) => {
        // Clear existing files for this client and add new ones
        const otherClientFiles = state.clientFiles.filter(f => f.clientId !== clientId);
        const newState = {
          clientFiles: [...otherClientFiles, ...files]
        };
        console.log('🔄 State update - Other client files:', otherClientFiles.length);
        console.log('🔄 State update - New files for client', clientId, ':', files.length);
        console.log('🔄 State update - Total files in state:', newState.clientFiles.length);
        return newState;
      });
      
      console.log(`✅ Fetched ${files.length} files for client ${clientId}:`, files.map(f => f.fileName));
    } catch (error) {
      console.error('❌ Error fetching client files:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, clientFiles: false } }));
    }
  },

  addClientFile: async (file: Omit<ClientFile, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const dbFile = await clientFilesService.add(file);
      const newFile: ClientFile = {
        id: dbFile.id,
        clientId: dbFile.clientId || dbFile.client_id,
        fileName: dbFile.fileName || dbFile.file_name,
        fileSize: dbFile.fileSize || dbFile.file_size,
        fileUrl: dbFile.fileUrl || dbFile.file_url,
        fileType: dbFile.fileType || dbFile.file_type,
        uploadDate: (dbFile.uploadDate || dbFile.upload_date) instanceof Date ? (dbFile.uploadDate || dbFile.upload_date).toISOString() : (dbFile.uploadDate || dbFile.upload_date),
        createdAt: (dbFile.createdAt || dbFile.created_at) instanceof Date ? (dbFile.createdAt || dbFile.created_at).toISOString() : (dbFile.createdAt || dbFile.created_at),
        updatedAt: (dbFile.updatedAt || dbFile.updated_at) instanceof Date ? (dbFile.updatedAt || dbFile.updated_at).toISOString() : (dbFile.updatedAt || dbFile.updated_at)
      };
      
      set((state) => ({
        clientFiles: [...state.clientFiles, newFile]
      }));
      
      console.log('Client file added to database:', newFile);
    } catch (error) {
      console.error('Error adding client file:', error);
      throw error;
    }
  },

  deleteClientFile: async (id: number) => {
    try {
      await clientFilesService.delete(id);
      
      set((state) => ({
        clientFiles: state.clientFiles.filter(file => file.id !== id)
      }));
      
      console.log(`Client file ${id} deleted from database`);
    } catch (error) {
      console.error('Error deleting client file:', error);
      throw error;
    }
  },

  getClientFilesByClientId: (clientId: number) => {
    const allFiles = get().clientFiles;
    console.log(`🔍 getClientFilesByClientId(${clientId}) - All files in state:`, allFiles.length);
    
    // Debug first few files
    if (allFiles.length > 0) {
      console.log('🔍 Sample files in state:');
      allFiles.slice(0, 3).forEach((file, index) => {
        console.log(`  File ${index}:`, {
          id: file.id,
          clientId: file.clientId,
          fileName: file.fileName,
          fileSize: file.fileSize
        });
      });
    }
    
    const files = allFiles.filter(file => file.clientId === clientId);
    console.log(`🔍 getClientFilesByClientId(${clientId}) - Filtered files:`, files.length);
    
    // Debug filtered files
    if (files.length > 0) {
      console.log('🔍 Filtered files details:');
      files.forEach((file, index) => {
        console.log(`  Filtered File ${index}:`, {
          id: file.id,
          clientId: file.clientId,
          fileName: file.fileName,
          fileSize: file.fileSize
        });
      });
    }
    
    return files;
  },

  // Add-On Services actions
  fetchAddOnServices: async () => {
    set((state) => ({ loading: { ...state.loading, addOnServices: true } }));
    try {
      const dbServices = await addOnServicesService.getAll();
      const services: AddOnService[] = dbServices.map((dbService) => ({
        id: dbService.id,
        name: dbService.name,
        description: dbService.description,
        category: dbService.category,
        price: Number(dbService.price),
        status: dbService.status,
        features: dbService.features || [],
        createdAt: dbService.created_at,
        updatedAt: dbService.updated_at
      }));
      
      set({ addOnServices: services });
      console.log(`Fetched ${services.length} add-on services`);
    } catch (error) {
      console.error('Error fetching add-on services:', error);
      set({ addOnServices: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, addOnServices: false } }));
    }
  },

  fetchClientServiceRequests: async () => {
    set((state) => ({ loading: { ...state.loading, clientServiceRequests: true } }));
    try {
      const dbRequests = await clientServiceRequestsService.getAll();
      const requests: ClientServiceRequest[] = dbRequests.map((dbRequest) => ({
        id: dbRequest.id,
        client_id: dbRequest.client_id,
        service_id: dbRequest.service_id,
        status: dbRequest.status,
        request_date: dbRequest.request_date,
        approved_date: dbRequest.approved_date,
        rejected_date: dbRequest.rejected_date,
        completed_date: dbRequest.completed_date,
        admin_notes: dbRequest.admin_notes,
        rejection_reason: dbRequest.rejection_reason,
        created_at: dbRequest.created_at,
        updated_at: dbRequest.updated_at,
        service: dbRequest.service_name ? {
          id: dbRequest.service_id,
          name: dbRequest.service_name,
          description: dbRequest.service_description || '',
          category: dbRequest.service_category as any,
          price: Number(dbRequest.service_price) || 0,
          status: 'Available' as const,
          features: [],
          createdAt: dbRequest.created_at,
          updatedAt: dbRequest.updated_at
        } : undefined,
        client: dbRequest.client_name ? {
          id: dbRequest.client_id,
          name: dbRequest.client_name,
          email: dbRequest.client_email || ''
        } : undefined
      }));
      
      set({ clientServiceRequests: requests });
      console.log(`Fetched ${requests.length} client service requests`);
    } catch (error) {
      console.error('Error fetching client service requests:', error);
      set({ clientServiceRequests: [] });
    } finally {
      set((state) => ({ loading: { ...state.loading, clientServiceRequests: false } }));
    }
  },

  addAddOnService: async (service: Partial<AddOnService>) => {
    try {
      const dbService = await addOnServicesService.create(service);
      const newService: AddOnService = {
        id: dbService.id,
        name: dbService.name,
        description: dbService.description,
        category: dbService.category,
        price: Number(dbService.price),
        status: dbService.status,
        features: dbService.features || [],
        createdAt: dbService.created_at,
        updatedAt: dbService.updated_at
      };
      
      set((state) => ({
        addOnServices: [...state.addOnServices, newService]
      }));
      
      console.log('Add-on service added:', newService);
    } catch (error) {
      console.error('Error adding add-on service:', error);
      throw error;
    }
  },

  updateAddOnService: async (id: number, updates: Partial<AddOnService>) => {
    try {
      // Convert features array to proper format for database
      const dbUpdates = {
        ...updates,
        features: updates.features ? updates.features : undefined
      };
      
      const dbService = await addOnServicesService.update(id, dbUpdates);
      const updatedService: AddOnService = {
        id: dbService.id,
        name: dbService.name,
        description: dbService.description,
        category: dbService.category,
        price: Number(dbService.price),
        status: dbService.status,
        features: dbService.features || [],
        createdAt: dbService.created_at,
        updatedAt: dbService.updated_at
      };
      
      set((state) => ({
        addOnServices: state.addOnServices.map(service =>
          service.id === id ? updatedService : service
        )
      }));
      
      console.log('Add-on service updated:', updatedService);
    } catch (error) {
      console.error('Error updating add-on service:', error);
      throw error;
    }
  },

  deleteAddOnService: async (id: number) => {
    try {
      await addOnServicesService.delete(id);
      
      set((state) => ({
        addOnServices: state.addOnServices.filter(service => service.id !== id)
      }));
      
      console.log(`Add-on service ${id} deleted`);
    } catch (error) {
      console.error('Error deleting add-on service:', error);
      throw error;
    }
  },

  getAddOnServiceById: (id: number) => {
    return get().addOnServices.find(service => service.id === id);
  },

  addClientServiceRequest: async (request: Partial<ClientServiceRequest>) => {
    try {
      const dbRequest = await clientServiceRequestsService.create(request);
      const newRequest: ClientServiceRequest = {
        id: dbRequest.id,
        client_id: dbRequest.client_id,
        service_id: dbRequest.service_id,
        status: dbRequest.status,
        request_date: dbRequest.request_date,
        approved_date: dbRequest.approved_date,
        rejected_date: dbRequest.rejected_date,
        completed_date: dbRequest.completed_date,
        admin_notes: dbRequest.admin_notes,
        rejection_reason: dbRequest.rejection_reason,
        created_at: dbRequest.created_at,
        updated_at: dbRequest.updated_at
      };
      
      set((state) => ({
        clientServiceRequests: [...state.clientServiceRequests, newRequest]
      }));
      
      console.log('Client service request added:', newRequest);
    } catch (error) {
      console.error('Error adding client service request:', error);
      throw error;
    }
  },

  updateClientServiceRequest: async (id: number, updates: Partial<ClientServiceRequest>) => {
    try {
      const dbRequest = await clientServiceRequestsService.update(id, updates);
      const updatedRequest: ClientServiceRequest = {
        id: dbRequest.id,
        client_id: dbRequest.client_id,
        service_id: dbRequest.service_id,
        status: dbRequest.status,
        request_date: dbRequest.request_date,
        approved_date: dbRequest.approved_date,
        rejected_date: dbRequest.rejected_date,
        completed_date: dbRequest.completed_date,
        admin_notes: dbRequest.admin_notes,
        rejection_reason: dbRequest.rejection_reason,
        created_at: dbRequest.created_at,
        updated_at: dbRequest.updated_at
      };
      
      set((state) => ({
        clientServiceRequests: state.clientServiceRequests.map(request =>
          request.id === id ? updatedRequest : request
        )
      }));
      
      console.log('Client service request updated:', updatedRequest);
    } catch (error) {
      console.error('Error updating client service request:', error);
      throw error;
    }
  },

  deleteClientServiceRequest: async (id: number) => {
    try {
      await clientServiceRequestsService.delete(id);
      
      set((state) => ({
        clientServiceRequests: state.clientServiceRequests.filter(request => request.id !== id)
      }));
      
      console.log(`Client service request ${id} deleted`);
    } catch (error) {
      console.error('Error deleting client service request:', error);
      throw error;
    }
  },

  getClientServiceRequestsByClientId: (clientId: number) => {
    return get().clientServiceRequests.filter(request => request.client_id === clientId);
  },

  // Helper function to clean up PIC references
  cleanupPicReferences: async (userName: string, reason: string) => {
    console.log(`🧹 Cleaning up PIC references for user: ${userName} (${reason})`);
    
    // Get all clients that have this user as PIC
    const clientsToUpdate = get().clients.filter(client => {
      if (!client.pic) return false;
      
      // Check if this user is in PIC1 or PIC2
      let pic1 = '';
      let pic2 = '';
      if (client.pic.includes(' - ')) {
        [pic1, pic2] = client.pic.split(' - ');
      } else {
        pic1 = client.pic;
      }
      
      return pic1 === userName || pic2 === userName;
    });

    // Update each client to remove this user from PIC
    for (const client of clientsToUpdate) {
      let pic1 = '';
      let pic2 = '';
      if (client.pic && client.pic.includes(' - ')) {
        [pic1, pic2] = client.pic.split(' - ');
      } else {
        pic1 = client.pic || '';
        pic2 = '';
      }

      // Remove the user from PIC
      if (pic1 === userName) {
        pic1 = '';
      }
      if (pic2 === userName) {
        pic2 = '';
      }

      // Combine PIC values
      const newPicValue = pic1 && pic2 ? `${pic1} - ${pic2}` : pic1 || pic2;

      // Update client in database
      try {
        await get().updateClient(client.id, { pic: newPicValue });
        console.log(`✅ Updated client ${client.name} PIC: "${client.pic}" -> "${newPicValue}"`);
      } catch (error) {
        console.error(`❌ Error updating client ${client.name} PIC:`, error);
      }
    }

    // Refresh clients to update UI
    await get().fetchClients();
  },

  // Client PICs actions
  fetchClientPics: async (clientId: number) => {
    set((state) => ({ loading: { ...state.loading, clientPics: true } }));
    try {
      console.log(`🔄 Fetching client pics for client ${clientId}...`);
      const dbPics = await clientPicsService.getByClientId(clientId);
      console.log('📋 Raw database pics count:', dbPics.length);
      
      if (dbPics.length > 0) {
        console.log('📋 Sample raw database pic:', {
          id: dbPics[0].id,
          clientId: dbPics[0].clientId,
          picId: dbPics[0].picId,
          position: dbPics[0].position,
          userId: dbPics[0].user?.id,
          userName: dbPics[0].user?.name,
          userEmail: dbPics[0].user?.email,
          userRole: dbPics[0].user?.role,
          createdAt: dbPics[0].createdAt,
          updatedAt: dbPics[0].updatedAt
        });
      }
      
      const pics: ClientPic[] = dbPics.map((dbPic) => ({
        id: dbPic.id,
        clientId: dbPic.clientId || dbPic.client_id,
        picId: dbPic.picId,
        position: dbPic.position,
        user: dbPic.user ? {
          id: dbPic.user.id,
          name: dbPic.user.name,
          email: dbPic.user.email,
          role: dbPic.user.role
        } : undefined,
        createdAt: dbPic.createdAt,
        updatedAt: dbPic.updatedAt
      }));
      
      console.log('📄 Processed pics count:', pics.length);
      
      if (pics.length > 0) {
        console.log('📄 Sample processed pic:', {
          id: pics[0].id,
          clientId: pics[0].clientId,
          picId: pics[0].picId,
          position: pics[0].position,
          userId: pics[0].user?.id,
          userName: pics[0].user?.name,
          userEmail: pics[0].user?.email,
          userRole: pics[0].user?.role,
          createdAt: pics[0].createdAt,
          updatedAt: pics[0].updatedAt
        });
      }
      
      set((state) => {
        // Clear existing pics for this client and add new ones
        const otherClientPics = state.clientPics.filter(p => p.clientId !== clientId);
        const newState = {
          clientPics: [...otherClientPics, ...pics]
        };
        console.log('🔄 State update - Other client pics:', otherClientPics.length);
        console.log('🔄 State update - New pics for client', clientId, ':', pics.length);
        console.log('🔄 State update - Total pics in state:', newState.clientPics.length);
        return newState;
      });
      
      console.log(`✅ Fetched ${pics.length} pics for client ${clientId}:`, pics.map(p => p.picId));
    } catch (error) {
      console.error('❌ Error fetching client pics:', error);
    } finally {
      set((state) => ({ loading: { ...state.loading, clientPics: false } }));
    }
  },

  addClientPic: async (pic: Partial<ClientPic>) => {
    try {
      const dbPic = await clientPicsService.add(pic);
      const newPic: ClientPic = {
        id: dbPic.id,
        clientId: dbPic.clientId || dbPic.client_id,
        picId: dbPic.picId,
        position: dbPic.position,
        user: dbPic.user ? {
          id: dbPic.user.id,
          name: dbPic.user.name,
          email: dbPic.user.email,
          role: dbPic.user.role
        } : undefined,
        createdAt: dbPic.createdAt,
        updatedAt: dbPic.updatedAt
      };
      
      set((state) => ({
        clientPics: [...state.clientPics, newPic]
      }));
      
      console.log('Client pic added to database:', newPic);
    } catch (error) {
      console.error('Error adding client pic:', error);
      throw error;
    }
  },

  updateClientPic: async (id: number, updates: Partial<ClientPic>) => {
    try {
      const dbPic = await clientPicsService.update(id, updates);
      const updatedPic: ClientPic = {
        id: dbPic.id,
        clientId: dbPic.clientId || dbPic.client_id,
        picId: dbPic.picId,
        position: dbPic.position,
        user: dbPic.user ? {
          id: dbPic.user.id,
          name: dbPic.user.name,
          email: dbPic.user.email,
          role: dbPic.user.role
        } : undefined,
        createdAt: dbPic.createdAt,
        updatedAt: dbPic.updatedAt
      };
      
      set((state) => ({
        clientPics: state.clientPics.map(pic =>
          pic.id === id ? updatedPic : pic
        )
      }));
      
      console.log('Client pic updated:', updatedPic);
    } catch (error) {
      console.error('Error updating client pic:', error);
      throw error;
    }
  },

  deleteClientPic: async (id: number) => {
    try {
      await clientPicsService.delete(id);
      
      set((state) => ({
        clientPics: state.clientPics.filter(pic => pic.id !== id)
      }));
      
      console.log(`Client pic ${id} deleted from database`);
    } catch (error) {
      console.error('Error deleting client pic:', error);
      throw error;
    }
  },

  getClientPicsByClientId: (clientId: number) => {
    const allPics = get().clientPics;
    console.log(`🔍 getClientPicsByClientId(${clientId}) - All pics in state:`, allPics.length);
    
    // Debug first few pics
    if (allPics.length > 0) {
      console.log('🔍 Sample pics in state:');
      allPics.slice(0, 3).forEach((pic, index) => {
        console.log(`  Pic ${index}:`, {
          id: pic.id,
          clientId: pic.clientId,
          picId: pic.picId,
          position: pic.position,
          userId: pic.user?.id,
          userName: pic.user?.name,
          userEmail: pic.user?.email,
          userRole: pic.user?.role,
          createdAt: pic.createdAt,
          updatedAt: pic.updatedAt
        });
      });
    }
    
    const pics = allPics.filter(pic => pic.clientId === clientId);
    console.log(`🔍 getClientPicsByClientId(${clientId}) - Filtered pics:`, pics.length);
    
    // Debug filtered pics
    if (pics.length > 0) {
      console.log('🔍 Filtered pics details:');
      pics.forEach((pic, index) => {
        console.log(`  Filtered Pic ${index}:`, {
          id: pic.id,
          clientId: pic.clientId,
          picId: pic.picId,
          position: pic.position,
          userId: pic.user?.id,
          userName: pic.user?.name,
          userEmail: pic.user?.email,
          userRole: pic.user?.role,
          createdAt: pic.createdAt,
          updatedAt: pic.updatedAt
        });
      });
    }
    
    return pics;
  },

  reorderClientPics: async (clientId: number) => {
    try {
      const pics = get().clientPics.filter(pic => pic.clientId === clientId);
      const newOrder = pics.map(pic => pic.id);
      
      // Update database
      for (let i = 0; i < newOrder.length; i++) {
        await clientPicsService.update(newOrder[i], { position: i + 1 });
      }
      
      // Update local state
      set((state) => ({
        clientPics: state.clientPics.map(pic => {
          const newPic = { ...pic };
          newPic.position = newOrder.indexOf(pic.id) + 1;
          return newPic;
        })
      }));
      
      console.log(`Client pics reordered successfully for client ${clientId}`);
    } catch (error) {
      console.error('Error reordering client pics:', error);
      throw error;
    }
  },

  listAllInvoices: async () => {
    try {
      const allInvoices = await invoicesService.getAll();
      set({ invoices: allInvoices });
      console.log('All invoices listed successfully');
    } catch (error) {
      console.error('Error listing all invoices:', error);
      throw error;
    }
  },

  cleanOrphanedInvoices: async () => {
    try {
      const deletedCount = await invoicesService.cleanOrphanedInvoices();
      console.log(`Cleaned ${deletedCount} orphaned invoices`);
      
      // Refresh invoices after cleaning
      await get().fetchInvoices();
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning orphaned invoices:', error);
      throw error;
    }
  }
}));