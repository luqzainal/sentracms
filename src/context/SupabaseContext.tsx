import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { neon } from '@neondatabase/serverless';

// Initialize Neon client with fallback
const neonConnectionString = import.meta.env.VITE_NEON_DATABASE_URL;
const isDatabaseAvailable = neonConnectionString && neonConnectionString.length > 0;

// Only initialize Neon client if database URL is available
export const sql = isDatabaseAvailable ? neon(neonConnectionString, {
  disableWarningInBrowsers: true // Disable browser warning
}) : null;

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
        if (mounted) {
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem('demoUser');
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
    
    // Mock authentication for Super Admin
    if (email === 'superadmin@sentra.com' && password === 'password123') {
      const mockUser: AuthUser = {
        id: '1',
        email: 'superadmin@sentra.com',
        name: 'Super Admin',
        role: 'Super Admin',
        permissions: ['all']
      };
      
      setUser(mockUser);
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      setLoading(false);
      return { data: { user: mockUser }, error: null };
    }

    // Try database authentication if available
    if (isDatabaseAvailable && sql) {
      try {
        const result = await sql`
          SELECT id, email, name, role, client_id, permissions 
          FROM users 
          WHERE email = ${email} 
          AND password = crypt(${password}, password)
          AND status = 'Active'
          LIMIT 1
        `;
        
        if (result.length > 0) {
          const dbUser = result[0];
          const authUser: AuthUser = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            clientId: dbUser.client_id,
            permissions: dbUser.permissions || []
          };
          
          setUser(authUser);
          localStorage.setItem('demoUser', JSON.stringify(authUser));
          setLoading(false);
          return { data: { user: authUser }, error: null };
        }
      } catch (error) {
        // Database error - fallback to mock data
        console.warn('Database connection failed, using mock data');
      }
    }

    // Invalid credentials
    setLoading(false);
    return { data: null, error: { message: 'Invalid credentials' } };
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('demoUser');
    return { error: null };
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
    clientId?: number;
    permissions: string[];
  }) => {
    setLoading(true);
    
    if (isDatabaseAvailable && sql) {
      try {
        const result = await sql`
          INSERT INTO users (email, password, name, role, client_id, permissions, status, created_at, updated_at)
          VALUES (
            ${email}, 
            crypt(${password}, gen_salt('bf')), 
            ${userData.name}, 
            ${userData.role}, 
            ${userData.clientId || null}, 
            ${userData.permissions}, 
            'active', 
            NOW(), 
            NOW()
          )
          RETURNING id, email, name, role, client_id, permissions
        `;
        
        if (result.length > 0) {
          const dbUser = result[0];
          const authUser: AuthUser = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            clientId: dbUser.client_id,
            permissions: dbUser.permissions || []
          };
          
          setLoading(false);
          return { data: { user: authUser }, error: null };
        }
      } catch (error) {
        setLoading(false);
        return { data: null, error: { message: 'Failed to create user' } };
      }
    }
    
    // Mock mode - just return success
    setLoading(false);
    return { data: { user: userData }, error: null };
  };

  const setDemoUser = (demoUser: AuthUser) => {
    setUser(demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
  };

  const value: DatabaseContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isDatabaseConnected: isDatabaseAvailable,
    signIn,
    signOut,
    signUp,
    setDemoUser
  };

  return (
    <DatabaseContext.Provider value={value}>
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

// Legacy exports for backward compatibility
export const useSupabase = useDatabase;