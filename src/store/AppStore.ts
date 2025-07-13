import { create } from 'zustand';
import { chatService, clientsService, usersService, invoicesService, paymentsService, clientLinksService, progressService } from '../services/database';
import { generateAvatarUrl } from '../utils/avatarUtils';
import type { ClientLink as TClientLink } from '../types/database';

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
  comments: Comment[];
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
  getUnreadMessagesCount: () => number;
  getChatById: (chatId: number) => Chat | undefined;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (id: number, updates: Partial<Client>) => void;
  deleteClient: (id: number) => Promise<void>;
  getClientById: (id: number) => Client | undefined;

  addInvoice: (invoiceData: { clientId: number; packageName: string; amount: number; invoiceDate: string }) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (invoiceId: string) => void;
  getInvoicesByClientId: (clientId: number) => Invoice[];

  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
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

  addCommentToStep: (stepId: string, comment: { text: string; username: string; attachment_url?: string; attachment_type?: string; }) => Promise<void>;
  deleteCommentFromStep: (stepId: string, commentId: string) => Promise<void>;

  addCalendarEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;

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
      const dbClients = await clientsService.getAll();
      // Convert database Client type to store Client type
      const clients: Client[] = dbClients.map((dbClient) => ({
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
      }));
      
      // Debug log to check client data
      console.log('Fetched clients:', clients);
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
      // For now, keep empty until proper component service is implemented
      set({ components: [] });
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
      // For now, keep empty until proper progress service is implemented
      set({ progressSteps: [] });
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
      // For now, keep empty until proper calendar service is implemented
      set({ calendarEvents: [] });
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
      await get().fetchInvoices();
      await get().fetchPayments();
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
  
  getUnreadMessagesCount: () => {
    return get().chats.reduce((sum, chat) => sum + chat.unread_count, 0);
  },
  
  getChatById: (chatId) => {
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
      
      // Update local state
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
      
      // Auto-create a progress step for the package
      const packageProgressStep: ProgressStep = {
        id: `step-${Date.now()}-package`,
        clientId: invoiceData.clientId,
        title: `${invoiceData.packageName} - Package Setup`,
        description: `Complete the setup and delivery of ${invoiceData.packageName} package`,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        completed: false,
        important: true, // Mark package steps as important
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        progressSteps: [...state.progressSteps, packageProgressStep],
      }));
      
      // Refresh data to ensure sync
      setTimeout(() => {
        get().fetchInvoices();
        get().fetchClients();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding invoice:', error);
      // Fallback to local state only
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
                packageName: invoiceData.packageName,
                totalSales: client.totalSales + invoiceData.amount,
                balance: client.balance + invoiceData.amount,
                invoiceCount: client.invoiceCount + 1,
                tags: client.tags && client.tags.includes(invoiceData.packageName) 
                  ? client.tags 
                  : [...(client.tags || []), invoiceData.packageName],
                updatedAt: new Date().toISOString(),
              }
            : client
        ),
      }));
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

  deleteInvoice: (invoiceId) => {
    const state = get();
    const invoice = state.invoices.find(inv => inv.id === invoiceId);
    
    if (invoice) {
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
      
      // Refresh data to ensure sync
      setTimeout(() => {
        get().fetchPayments();
        get().fetchInvoices();
        get().fetchClients();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding payment:', error);
      // Fallback to local state only
      const newPayment: Payment = {
        id: `PAY-${Date.now()}`,
        clientId: paymentData.clientId,
        invoiceId: paymentData.invoiceId,
        amount: paymentData.amount,
        paymentSource: paymentData.paymentSource,
        status: paymentData.status || 'Paid',
        paidAt: paymentData.paidAt || new Date().toISOString(),
        receiptFileUrl: paymentData.receiptFileUrl,
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
    }
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
                status: invoice.paid - payment.amount <= 0 ? 'Pending' : 'Partial',
                updatedAt: new Date().toISOString(),
              }
            : invoice
        ),
      }));
    }
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
    
    // Create corresponding progress step for this component
    const newProgressStep: ProgressStep = {
      id: `step-${Date.now()}-comp`,
      clientId: componentData.clientId,
      title: componentData.name,
      description: `Complete the ${componentData.name} component`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      completed: false,
      important: false,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      components: [...state.components, newComponent],
      progressSteps: [...state.progressSteps, newProgressStep],
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
    
    // Create corresponding progress steps for all components
    const newProgressSteps: ProgressStep[] = componentsData.map((componentData, index) => ({
      id: `step-${Date.now()}-comp-${index}`,
      clientId: componentData.clientId,
      title: componentData.name,
      description: `Complete the ${componentData.name} component`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      completed: false,
      important: false,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    set((state) => ({
      components: [...state.components, ...newComponents],
      progressSteps: [...state.progressSteps, ...newProgressSteps],
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

  addCalendarEvent: (event) => {
    const newEvent: CalendarEvent = {
      ...event,
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

  addUser: async (userData) => {
    try {
      // Map store User format to DatabaseUser format
      const dbUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role as 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team',
        status: userData.status as 'Active' | 'Inactive',
        client_id: userData.clientId,
        permissions: userData.permissions,
        password: (userData as any).dashboardAccess?.password || (userData as any).portalAccess?.password || 'defaultpass123'
      };
      
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

  copyComponentsToProgressSteps: (clientId) => {
    const state = get();
    const clientComponents = state.components.filter(comp => comp.clientId === clientId);
    const clientInvoices = state.invoices.filter(inv => inv.clientId === clientId);
    
    // Create progress steps for packages (from invoices)
    clientInvoices.forEach(invoice => {
      const existingPackageStep = state.progressSteps.find(step => 
        step.clientId === clientId && step.title === `${invoice.packageName} - Package Setup`
      );
      
      if (!existingPackageStep) {
        const packageStep: ProgressStep = {
          id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-pkg`,
          clientId: clientId,
          title: `${invoice.packageName} - Package Setup`,
          description: `Complete the setup and delivery of ${invoice.packageName} package`,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          completed: false,
          important: true, // Mark package steps as important
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          progressSteps: [...state.progressSteps, packageStep],
        }));
      }
    });
    
    // Create progress steps for components
    clientComponents.forEach(component => {
      const existingStep = state.progressSteps.find(step => 
        step.clientId === clientId && step.title === component.name
      );
      
      if (!existingStep) {
        const componentStep: ProgressStep = {
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
          progressSteps: [...state.progressSteps, componentStep],
        }));
      }
    });
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
}));