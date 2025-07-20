import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { neon } from '@neondatabase/serverless';

// Database connection configuration
const neonConnectionString = import.meta.env.VITE_NEON_DATABASE_URL || "";

// Determine database type
const isNeonDatabase = neonConnectionString.includes('neon.tech');
const isDigitalOceanDatabase = neonConnectionString.includes('ondigitalocean.com');

// API server URL
const API_BASE_URL = 'http://localhost:3003/api';

// Initialize appropriate database client
let neonClient: any = null;

if (isNeonDatabase) {
  // Use Neon client for Neon database
  neonClient = neon(neonConnectionString, {
    disableWarningInBrowsers: true
  });
  console.log('🔗 Using Neon database client');
} else if (isDigitalOceanDatabase) {
  console.log('🔗 DigitalOcean database detected - using API server');
} else {
  console.log('⚠️ No database connection string provided');
}

// Database query function that works with both clients
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    if (isNeonDatabase && neonClient) {
      // Use Neon client
      return await neonClient.query(query, params);
    } else if (isDigitalOceanDatabase) {
      // Use API server for DO database
      console.log('⚠️ Direct queries not supported for DO database - use API endpoints');
      return [];
    } else {
      throw new Error('No database client available');
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// API functions for DO database
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Tagged template literal function for Neon compatibility
export const sqlTemplate = (strings: TemplateStringsArray, ...values: any[]) => {
  const query = strings.reduce((result, str, i) => {
    return result + str + (values[i] !== undefined ? `$${i + 1}` : '');
  }, '');
  
  return executeQuery(query, values);
};

// Export database connection status
export const dbConnectionStatus = {
  isNeon: isNeonDatabase,
  isDigitalOcean: isDigitalOceanDatabase,
  isAvailable: isNeonDatabase || isDigitalOceanDatabase,
  hasConnectionString: !!neonConnectionString
};

// For backward compatibility, export sql as the template function
export const sql = sqlTemplate;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  clientId?: number;
  permissions: string[];
}

interface DatabaseContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDatabaseConnected: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: {
    name: string;
    role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
    clientId?: number;
    permissions: string[];
  }) => Promise<{ data: any; error: any }>;
  setDemoUser: (demoUser: AuthUser) => void;
  isSessionValid: () => boolean;
  getSessionInfo: () => any;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
          console.log('🔄 Session restored for user:', parsedUser.email);
          
          const sessionTimestamp = localStorage.getItem('demoUserTimestamp');
          const now = Date.now();
          const sessionAge = sessionTimestamp ? now - parseInt(sessionTimestamp) : 0;
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge > maxSessionAge) {
            console.log('⚠️ Session expired, clearing...');
            localStorage.removeItem('demoUser');
            localStorage.removeItem('demoUserTimestamp');
          } else {
            console.log('✅ Session is valid, restoring user');
            if (mounted) {
              setUser(parsedUser);
            }
          }
        } else {
          console.log('❌ Invalid session data, clearing...');
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoUserTimestamp');
        }
      } catch (error) {
        console.error('❌ Error parsing session data:', error);
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoUserTimestamp');
      }
    }
    if (mounted) {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock authentication for Super Admin
      const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'superadmin@sentra.com';
      const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'password123';
      const demoAdminName = import.meta.env.VITE_DEMO_ADMIN_NAME || 'Super Admin';
      
      if (email === demoAdminEmail && password === demoAdminPassword) {
        const mockUser: AuthUser = {
          id: '1',
          email: demoAdminEmail,
          name: demoAdminName,
          role: 'Super Admin',
          permissions: ['all']
        };
        
        setUser(mockUser);
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        localStorage.setItem('demoUserTimestamp', Date.now().toString());
        console.log('✅ Session created for Super Admin');
        setLoading(false);
        return { data: { user: mockUser }, error: null };
      }

      // Mock authentication for Demo Client
      const demoClientEmail = import.meta.env.VITE_DEMO_CLIENT_EMAIL || 'client@demo.com';
      const demoClientPassword = import.meta.env.VITE_DEMO_CLIENT_PASSWORD || 'client123';
      const demoClientName = import.meta.env.VITE_DEMO_CLIENT_NAME || 'Demo Client';
      
      if (email === demoClientEmail && password === demoClientPassword) {
        const mockUser: AuthUser = {
          id: '2',
          email: demoClientEmail,
          name: demoClientName,
          role: 'Client Admin',
          clientId: 1,
          permissions: ['client_portal']
        };
        
        setUser(mockUser);
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        localStorage.setItem('demoUserTimestamp', Date.now().toString());
        console.log('✅ Session created for Demo Client');
        setLoading(false);
        return { data: { user: mockUser }, error: null };
      }

      // Database authentication
      if (dbConnectionStatus.isAvailable) {
        try {
          console.log('Attempting database authentication for:', email);
          
          if (isNeonDatabase) {
            // Use Neon database
            const userCheck = await executeQuery(
              'SELECT id, email, name, role, client_id, permissions, status FROM users WHERE email = $1 LIMIT 1',
              [email]
            );
            
            if (userCheck.length === 0) {
              console.log('User not found in database');
              setLoading(false);
              return { data: null, error: { message: 'Account not found. Please check your email address or contact your administrator to create an account.' } };
            }
            
            const userRecord = userCheck[0];
            console.log('User found:', { id: userRecord.id, email: userRecord.email, status: userRecord.status, role: userRecord.role });
            
            if (userRecord.status !== 'Active') {
              console.log('User account is not active:', userRecord.status);
              setLoading(false);
              
              const roleMessage = userRecord.role === 'Client Admin' || userRecord.role === 'Client Team' 
                ? 'Your client account has been deactivated. Please contact your service provider to reactivate your account.'
                : 'Your account has been deactivated. Please contact your administrator to reactivate your account.';
              
              return { data: null, error: { message: roleMessage } };
            }
            
            // Password authentication
            const authResult = await executeQuery(
              'SELECT id, email, name, role, client_id, permissions, status FROM users WHERE email = $1 AND password = crypt($2, password)',
              [email, password]
            );
            
            if (authResult.length > 0) {
              const userRecord = authResult[0];
              const authUser: AuthUser = {
                id: userRecord.id,
                email: userRecord.email,
                name: userRecord.name,
                role: userRecord.role,
                clientId: userRecord.client_id,
                permissions: userRecord.permissions || []
              };
              
              setUser(authUser);
              localStorage.setItem('demoUser', JSON.stringify(authUser));
              localStorage.setItem('demoUserTimestamp', Date.now().toString());
              console.log('✅ Database authentication successful');
              setLoading(false);
              return { data: { user: authUser }, error: null };
            } else {
              console.log('Invalid password');
              setLoading(false);
              return { data: null, error: { message: 'Invalid password. Please try again.' } };
            }
          } else if (isDigitalOceanDatabase) {
            // Use API server for DO database
            const response = await apiCall('/auth/login', {
              method: 'POST',
              body: JSON.stringify({ email, password })
            });
            
            if (response.success) {
              const authUser: AuthUser = response.user;
              setUser(authUser);
              localStorage.setItem('demoUser', JSON.stringify(authUser));
              localStorage.setItem('demoUserTimestamp', Date.now().toString());
              console.log('✅ API authentication successful');
              setLoading(false);
              return { data: { user: authUser }, error: null };
            } else {
              setLoading(false);
              return { data: null, error: { message: response.error || 'Authentication failed' } };
            }
          }
        } catch (error: any) {
          console.error('Database authentication error:', error);
          setLoading(false);
          return { data: null, error: { message: error.message || 'Authentication service temporarily unavailable. Please try again later.' } };
        }
      }

      setLoading(false);
      return { data: null, error: { message: 'Invalid email or password. Please try again.' } };
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem('demoUser');
      localStorage.removeItem('demoUserTimestamp');
      console.log('✅ User signed out successfully');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
    clientId?: number;
    permissions: string[];
  }) => {
    try {
      if (!dbConnectionStatus.isAvailable) {
        return { data: null, error: { message: 'Database not available for registration.' } };
      }

      // Only support Neon database for registration for now
      if (!isNeonDatabase) {
        return { data: null, error: { message: 'Registration not available for this database type.' } };
      }

      const result = await executeQuery(
        'INSERT INTO users (email, password, name, role, client_id, permissions, status) VALUES ($1, crypt($2, gen_salt(\'bf\')), $3, $4, $5, $6, $7) RETURNING *',
        [email, password, userData.name, userData.role, userData.clientId || null, userData.permissions, 'Active']
      );

      if (result.length > 0) {
        const newUser = result[0];
        const authUser: AuthUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          clientId: newUser.client_id,
          permissions: newUser.permissions || []
        };
        
        setUser(authUser);
        localStorage.setItem('demoUser', JSON.stringify(authUser));
        localStorage.setItem('demoUserTimestamp', Date.now().toString());
        
        return { data: { user: authUser }, error: null };
      } else {
        return { data: null, error: { message: 'Failed to create user account.' } };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.message.includes('duplicate key')) {
        return { data: null, error: { message: 'An account with this email already exists.' } };
      }
      return { data: null, error: { message: 'Failed to create account. Please try again.' } };
    }
  };

  const setDemoUser = (demoUser: AuthUser) => {
    setUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    localStorage.setItem('demoUserTimestamp', Date.now().toString());
  };

  const isSessionValid = () => {
    const demoUser = localStorage.getItem('demoUser');
    if (!demoUser) return false;
    
    try {
      const user = JSON.parse(demoUser);
      const sessionTimestamp = localStorage.getItem('demoUserTimestamp');
      const now = Date.now();
      const sessionAge = sessionTimestamp ? now - parseInt(sessionTimestamp) : 0;
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
      
      return sessionAge <= maxSessionAge;
    } catch {
      return false;
    }
  };

  const getSessionInfo = () => {
    const demoUser = localStorage.getItem('demoUser');
    const sessionTimestamp = localStorage.getItem('demoUserTimestamp');
    
    if (demoUser && sessionTimestamp) {
      try {
        const user = JSON.parse(demoUser);
        const now = Date.now();
        const sessionAge = now - parseInt(sessionTimestamp);
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        return {
          user,
          sessionAge,
          maxSessionAge,
          isValid: sessionAge <= maxSessionAge
        };
      } catch {
        return null;
      }
    }
    return null;
  };

  const contextValue: DatabaseContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isDatabaseConnected: dbConnectionStatus.isAvailable,
    signIn,
    signOut,
    signUp,
    setDemoUser,
    isSessionValid,
    getSessionInfo
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}; 