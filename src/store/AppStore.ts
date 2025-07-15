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
  calendarService
} from '../services/database';
import { generateAvatarUrl } from '../utils/avatarUtils';
import type { Client as DatabaseClient, ClientLink as TClientLink, DatabaseProgressStepComment } from '../types/database';

export interface Client {
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
  online: boolean;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender: 'client' | 'admin';
  content: string;
  message_type: string;
  created_at: string;
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

  // Navigation & User state
  user: User | null;
  activeTab: string;
  selectedClient: Client | null;

  // Real-time polling
  isPolling: boolean;
  pollingInterval: NodeJS.Timeout | null;

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

  // User & Navigation actions
  setUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
  setSelectedClient: (client: Client | null) => void;

  // Real-time polling actions
  startPolling: () => void;
  stopPolling: () => void;
  pollForUpdates: () => Promise<void>;

  // Chat actions
  sendMessage: (chatId: number, content: string, sender: 'client' | 'admin') => Promise<void>;
  loadChatMessages: (chatId: number) => Promise<void>;
  markChatAsRead: (chatId: number) => Promise<void>;
  createChatForClient: (clientId: number) => Promise<void>;
  updateChatOnlineStatus: (chatId: number, online: boolean) => Promise<void>;
  getUnreadMessagesCount: () => number;
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
  updateProgressStep: (id: string, updates: Partial<ProgressStep>) => void;
  deleteProgressStep: (id: string) => void;
  getProgressStepsByClientId: (clientId: number) => ProgressStep[];

  addCommentToStep: (stepId: string, comment: { text: string; username: string; attachment_url?: string; attachment_type?: string; }) => Promise<void>;
  deleteCommentFromStep: (stepId: string, commentId: string) => Promise<void>;

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  copyComponentsToProgressSteps: (clientId: number) => void;

  addClientLink: (link: Omit<ClientLink, 'id' | 'createdAt' | 'created_at'> & { client_id: number }) => Promise<void>;
  deleteClientLink: (id: string) => Promise<void>;
  getClientLinksByClientId: (clientId: number) => ClientLink[];

  // Computed values
  getTotalSales: () => number;
  getTotalCollection: () => number;
  getTotalBalance: () => number;
  
  // Utility functions
  recalculateAllClientTotals: () => Promise<void>;
  createTestUsers: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state - all empty arrays for production
  clients: [],
  invoices: [],
  payments: [],
  components: [],
  progressSteps: [],
  calendarEvents: [],
  chats: [],
  tags: [],
  users: [],
  clientLinks: [],

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
          tags: [],
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
      const dbInvoices = await invoicesService.getAll();
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
      const dbComponents = await componentsService.getAll();
      console.log('Raw components from database:', dbComponents);
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
      const dbSteps = await progressService.getAll();
      const steps: ProgressStep[] = dbSteps.map((dbStep: any) => ({
        ...dbStep,
        clientId: dbStep.client_id,
        completedDate: dbStep.completed_date,
        comments: dbStep.comments || [],
        createdAt: dbStep.created_at,
        updatedAt: dbStep.updated_at,
      }));
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
      const dbChats = await chatService.getAll();
      const chats: Chat[] = dbChats.map((dbChat) => {
        // Find existing chat to preserve messages
        const existingChat = get().chats.find(chat => chat.id === dbChat.id);
        
        return {
          id: dbChat.id,
          clientId: dbChat.client_id,
          client: dbChat.client_name,
          avatar: generateAvatarUrl(dbChat.client_name),
          lastMessage: dbChat.last_message,
          lastMessageAt: dbChat.last_message_at,
          unread_count: dbChat.unread_count || 0,
          online: dbChat.online || false,
          messages: existingChat ? existingChat.messages : [], // Preserve existing messages
          createdAt: dbChat.created_at,
          updatedAt: dbChat.updated_at
        };
      });
      set({ chats });
      
      // Load messages for all chats
      console.log('Loading messages for all chats...');
      for (const chat of chats) {
        try {
          const messages = await chatService.getMessages(chat.id);
          console.log(`Loaded ${messages.length} messages for chat ${chat.id} (${chat.client})`);
          
          // Update the specific chat with messages
          set((state) => ({
            chats: state.chats.map((c) =>
              c.id === chat.id
                ? {
                    ...c,
                    messages: messages,
                    updatedAt: new Date().toISOString(),
                  }
                : c
            ),
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
      // For now, keep empty until proper tag service is implemented
      set({ tags: [] });
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
      }, 3000); // Poll every 3 seconds for real-time chat
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
      // Refresh chat data to get latest messages and unread counts
      await get().fetchChats();
      
      // Reload messages for all chats that have been loaded previously
      const currentChats = get().chats;
      const chatsWithMessages = currentChats.filter(chat => chat.messages && chat.messages.length > 0);
      
      // Reload messages for active chats to ensure real-time sync
      for (const chat of chatsWithMessages) {
        try {
          await get().loadChatMessages(chat.id);
        } catch (error) {
          console.error(`Error reloading messages for chat ${chat.id}:`, error);
        }
      }
      
      // Also reload messages for any chats that are currently being viewed
      // (even if they don't have messages yet)
      const allChats = get().chats;
      for (const chat of allChats) {
        if (chat.messages && chat.messages.length === 0) {
          try {
            await get().loadChatMessages(chat.id);
          } catch (error) {
            console.error(`Error loading initial messages for chat ${chat.id}:`, error);
          }
        }
      }
      
      // You can add other polling operations here
      // For example: check for new notifications, updates, etc.
      await get().fetchClients();
      await get().fetchUsers();
      const { selectedClient, fetchClientLinks } = get();
      if (selectedClient) {
        await fetchClientLinks(selectedClient.id);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  },

  // Chat actions
  sendMessage: async (chatId, content, sender) => {
    try {
      const newMessage = await chatService.sendMessage({
        chat_id: chatId,
        sender: sender,
        content: content,
        message_type: 'text'
      });
      
      // Update local state immediately for responsive UI
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage.content,
                lastMessageAt: newMessage.created_at,
                unread_count: sender === 'client' ? chat.unread_count + 1 : chat.unread_count,
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
      
      // Force immediate reload of messages for this chat to ensure sync
      setTimeout(async () => {
        await get().loadChatMessages(chatId);
        get().fetchChats();
      }, 500);
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local state update for offline mode
      const mockMessage: ChatMessage = {
        id: Date.now(),
        chat_id: chatId,
        sender: sender,
        content: content,
        message_type: 'text',
        created_at: new Date().toISOString(),
      };
      
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, mockMessage],
                lastMessage: mockMessage.content,
                lastMessageAt: mockMessage.created_at,
                unread_count: sender === 'client' ? chat.unread_count + 1 : chat.unread_count,
                updatedAt: new Date().toISOString(),
              }
            : chat
        ),
      }));
    }
  },
  
  loadChatMessages: async (chatId) => {
    try {
      console.log(`Loading messages for chat ${chatId}...`);
      const messages = await chatService.getMessages(chatId);
      console.log(`Loaded ${messages.length} messages for chat ${chatId}:`, messages);
      
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
      
    } catch (error) {
      console.error('Error loading chat messages:', error);
      throw error;
    }
  },
  
  markChatAsRead: async (chatId) => {
    try {
      await chatService.markAsRead(chatId);
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                unread_count: 0,
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
        client: client?.name || 'Unknown Client',
        avatar: generateAvatarUrl(client?.name || 'Unknown Client'),
        lastMessage: undefined,
        lastMessageAt: undefined,
        unread_count: 0,
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

  getUnreadMessagesCount: () => {
    return get().chats.reduce((total: number, chat: Chat) => total + chat.unread_count, 0);
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
        tags: clientData.tags || [],
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
      
      return newClient;
    } catch (error) {
      console.error('Error adding client to database:', error);
      // Re-throw the error to be caught by the component
      throw error;
    }
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

  deleteClient: async (id: number) => {
    try {
      await clientsService.delete(id);
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
      
      // Note: Removed auto-creation of progress steps and tags to prevent clutter
      // Note: Removed setTimeout refresh to prevent duplicate data display
      
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
      } catch (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }
    }
  },

  getInvoicesByClientId: (clientId) => {
    return get().invoices.filter((invoice) => invoice.clientId === clientId);
  },

  addPayment: async (paymentData) => {
    try {
      // Create payment in database
      const newDbPayment = await paymentsService.create({
        client_id: paymentData.clientId,
        invoice_id: paymentData.invoiceId,
        amount: paymentData.amount,
        payment_source: paymentData.paymentSource,
        status: (paymentData.status || 'Paid') as 'Paid' | 'Pending' | 'Failed' | 'Refunded',
        paid_at: paymentData.paidAt || new Date().toISOString()
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
        const newPaidAmount = currentInvoice.paid + paymentData.amount;
        const newDueAmount = Math.max(0, currentInvoice.amount - newPaidAmount);
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
        const newTotalCollection = clientForPayment.totalCollection + paymentData.amount;
        const newBalance = Math.max(0, clientForPayment.balance - paymentData.amount);
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
          paid_at: updates.paidAt || payment.paidAt
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
    return get().components.filter((component) => component.clientId === clientId);
  },

  getComponentsByInvoiceId: (invoiceId) => {
    const allComponents = get().components;
    const filteredComponents = allComponents.filter((component) => component.invoiceId === invoiceId);
    console.log(`Getting components for invoice ${invoiceId}:`, {
      allComponents: allComponents.length,
      filteredComponents: filteredComponents.length,
      components: filteredComponents
    });
    return filteredComponents;
  },

  addProgressStep: async (stepData) => {
    try {
      const newDbStep = await progressService.create(stepData);
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
      set((state) => ({
        progressSteps: [...state.progressSteps, newStep],
      }));
    } catch (error) {
      console.error('Error adding progress step:', error);
      throw error;
    }
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

  deleteProgressStep: (id: string) => {
    set((state) => ({
      progressSteps: state.progressSteps.filter((step) => step.id !== id),
    }));
    progressService.delete(id).catch(err => console.error("Failed to delete progress step on server", err));
  },

  getProgressStepsByClientId: (clientId: number) => {
    return get().progressSteps.filter((step) => step.clientId === clientId);
  },

  addCommentToStep: async (stepId, comment) => {
    const newComment = await progressService.addComment({
      step_id: stepId,
      text: comment.text,
      username: comment.username,
      attachment_url: comment.attachment_url,
      attachment_type: comment.attachment_type,
    });

    set(state => ({
      progressSteps: state.progressSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            comments: [...step.comments, newComment]
          };
        }
        return step;
      })
    }));
  },

  deleteCommentFromStep: async (stepId, commentId) => {
    await progressService.deleteComment(commentId);
    set(state => ({
      progressSteps: state.progressSteps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            comments: step.comments.filter(c => c.id !== commentId)
          };
        }
        return step;
      })
    }));
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
      // Map store updates to database format
      const dbUpdates = {
        name: updates.name,
        email: updates.email,
        role: updates.role as 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team' | undefined,
        status: updates.status as 'Active' | 'Inactive' | undefined,
        client_id: updates.clientId,
        permissions: updates.permissions
      };
      
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
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await usersService.delete(id);
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  copyComponentsToProgressSteps: async (clientId) => {
    // First, delete all existing progress steps for this client to ensure a clean sync
    try {
      // Get all steps for the client
      const existingSteps = get().progressSteps.filter(step => step.clientId === clientId);
      // Create a list of promises for deletion
      const deletionPromises = existingSteps.map(step => progressService.delete(step.id));
      // Wait for all deletions to complete
      await Promise.all(deletionPromises);
      console.log(`Deleted ${existingSteps.length} existing progress steps for client ${clientId}.`);
      
      // Update the local state to reflect the deletion immediately
      set(state => ({
        progressSteps: state.progressSteps.filter(step => step.clientId !== clientId)
      }));

    } catch (error) {
      console.error(`Failed to delete existing progress steps for client ${clientId}:`, error);
      // We can choose to stop here or continue, for now we'll continue
    }
    
    // Now, proceed with fetching the latest data and creating new steps
    const state = get();
    await state.fetchComponents();
    await state.fetchInvoices();
    
    const freshState = get();
    const clientComponents = freshState.components.filter(comp => comp.clientId === clientId);
    const clientInvoices = freshState.invoices.filter(inv => inv.clientId === clientId);

    const newStepsToCreate = [];

    // Create steps for packages
    for (const invoice of clientInvoices) {
      newStepsToCreate.push({
        client_id: clientId,
        title: `${invoice.packageName} - Package Setup`,
        description: `Complete the setup and delivery of ${invoice.packageName} package`,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        important: true,
        comments: []
      });
    }
    
    // Create steps for components
    for (const component of clientComponents) {
      newStepsToCreate.push({
        client_id: clientId,
        title: component.name,
        description: `Complete the ${component.name} component`,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        important: false,
        comments: []
      });
    }

    if (newStepsToCreate.length > 0) {
      try {
        const createdDbSteps = await Promise.all(
          newStepsToCreate.map(step => progressService.create(step))
        );
        const createdStepsForStore: ProgressStep[] = createdDbSteps.map(dbStep => ({
          ...dbStep,
          clientId: dbStep.client_id,
          completedDate: dbStep.completed_date,
          comments: dbStep.comments || [],
          createdAt: dbStep.created_at,
          updatedAt: dbStep.updated_at,
        }));
        set(currentState => ({
          progressSteps: [...currentState.progressSteps.filter(s => s.clientId !== clientId), ...createdStepsForStore],
        }));
      } catch (error) {
        console.error("Failed to batch create progress steps:", error);
      }
    } else {
        // If there are no new steps, we still need to refresh the progress steps to clear the UI
        await state.fetchProgressSteps();
    }
  },

  addClientLink: async (linkData) => {
    try {
      const newLink = await clientLinksService.create(linkData);
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

  getTotalSales: () => {
    return get().clients.reduce((total, client) => {
      const clientSales = Number(client.totalSales) || 0;
      return total + clientSales;
    }, 0);
  },

  getTotalCollection: () => {
    return get().clients.reduce((total, client) => {
      const clientCollection = Number(client.totalCollection) || 0;
      return total + clientCollection;
    }, 0);
  },

  getTotalBalance: () => {
    return get().clients.reduce((total, client) => {
      const clientBalance = Number(client.balance) || 0;
      return total + clientBalance;
    }, 0);
  },

  // Add this new function to recalculate all client financial data
  recalculateAllClientTotals: async () => {
    console.log('=== Recalculating all client financial data ===');
    const state = get();
    
    for (const client of state.clients) {
      console.log(`Recalculating for client ${client.id} (${client.name})`);
      
      // Get all invoices for this client
      const clientInvoices = state.invoices.filter(inv => inv.clientId === client.id);
      const totalSales = clientInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
      
      // Get all payments for this client
      const clientPayments = state.payments.filter(pay => pay.clientId === client.id);
      const totalCollection = clientPayments.reduce((sum, pay) => sum + Number(pay.amount), 0);
      
      // Calculate balance
      const balance = Math.max(0, totalSales - totalCollection);
      
      console.log(`Client ${client.id} recalculated:`, {
        oldTotalSales: client.totalSales,
        newTotalSales: totalSales,
        oldTotalCollection: client.totalCollection,
        newTotalCollection: totalCollection,
        oldBalance: client.balance,
        newBalance: balance
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
  }
}));