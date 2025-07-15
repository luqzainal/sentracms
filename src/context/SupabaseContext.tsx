import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { neon } from '@neondatabase/serverless';

// Initialize Neon client with fallback
const neonConnectionString = import.meta.env.VITE_NEON_DATABASE_URL || "postgresql://neondb_owner:npg_3ok7edPaMzNc@ep-curly-bonus-a1x3bxl3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const isDatabaseAvailable = neonConnectionString && neonConnectionString.length > 0;

// Debug logging for production
console.log('🔍 Database Environment Check:', {
  hasEnvVar: !!neonConnectionString,
  envVarLength: neonConnectionString?.length || 0,
  isDatabaseAvailable,
  env: import.meta.env.MODE
});

// Only initialize Neon client if database URL is available
export const sql = isDatabaseAvailable ? neon(neonConnectionString, {
  disableWarningInBrowsers: true // Disable browser warning
}) : null;

// Export database connection status for debugging
export const dbConnectionStatus = {
  isAvailable: isDatabaseAvailable,
  hasConnectionString: !!neonConnectionString,
  connectionStringLength: neonConnectionString?.length || 0
};

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
        
        // Validate session data integrity
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
          console.log('🔄 Session restored for user:', parsedUser.email);
          
          // Check if session is still valid (optional: add expiration check)
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
        localStorage.setItem('demoUserTimestamp', Date.now().toString());
        console.log('✅ Session created for Super Admin');
        setLoading(false);
        return { data: { user: mockUser }, error: null };
      }

      // Try database authentication if available
      if (isDatabaseAvailable && sql) {
        try {
          console.log('Attempting database authentication for:', email);
          
          // First check if user exists
          const userCheck = await sql`
            SELECT id, email, name, role, client_id, permissions, status 
            FROM users 
            WHERE email = ${email}
            LIMIT 1
          `;
          
          if (userCheck.length === 0) {
            console.log('User not found in database');
            setLoading(false);
            return { data: null, error: { message: 'Account not found. Please check your email address or contact your administrator to create an account.' } };
          }
          
          const userRecord = userCheck[0];
          console.log('User found:', { id: userRecord.id, email: userRecord.email, status: userRecord.status, role: userRecord.role });
          
          // Check if user is active
          if (userRecord.status !== 'Active') {
            console.log('User account is not active:', userRecord.status);
            setLoading(false);
            
            // Different messages based on user role
            const roleMessage = userRecord.role === 'Client Admin' || userRecord.role === 'Client Team' 
              ? 'Your client account has been deactivated. Please contact your service provider to reactivate your account.'
              : 'Your account has been deactivated. Please contact your administrator to reactivate your account.';
            
            return { data: null, error: { message: roleMessage } };
          }
          
          // Try password authentication with crypt
          const authResult = await sql`
            SELECT id, email, name, role, client_id, permissions, status 
            FROM users 
            WHERE email = ${email} 
            AND password = crypt(${password}, password)
            LIMIT 1
          `;
          
          if (authResult.length > 0) {
            const dbUser = authResult[0];
            console.log('Authentication successful for user:', dbUser.id);
            
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
            localStorage.setItem('demoUserTimestamp', Date.now().toString());
            console.log('✅ Session created for user:', authUser.email);
            setLoading(false);
            return { data: { user: authUser }, error: null };
          } else {
            console.log('Password authentication failed');
            setLoading(false);
            return { data: null, error: { message: 'Incorrect password. Please check your password and try again.' } };
          }
          
        } catch (dbError) {
          console.error('Database authentication error:', dbError);
          setLoading(false);
          return { data: null, error: { message: 'Unable to connect to authentication service. Please check your internet connection and try again.' } };
        }
      }

      // Database not available
      console.log('Database not available, authentication failed');
      setLoading(false);
      return { data: null, error: { message: 'Authentication service is currently unavailable. Please try again later or contact support.' } };
      
    } catch (error) {
      console.error('Authentication error:', error);
      setLoading(false);
      return { data: null, error: { message: 'An unexpected error occurred during login. Please refresh the page and try again.' } };
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out user...');
    setUser(null);
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoUserTimestamp');
    console.log('✅ Session cleared successfully');
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
    localStorage.setItem('demoUserTimestamp', Date.now().toString());
    console.log('✅ Demo user session created:', demoUser.email);
  };

  // Utility function to check session validity
  const isSessionValid = () => {
    const sessionTimestamp = localStorage.getItem('demoUserTimestamp');
    if (!sessionTimestamp) return false;
    
    const now = Date.now();
    const sessionAge = now - parseInt(sessionTimestamp);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge <= maxSessionAge;
  };

  // Utility function to get session info
  const getSessionInfo = () => {
    const sessionTimestamp = localStorage.getItem('demoUserTimestamp');
    const demoUser = localStorage.getItem('demoUser');
    
    if (!sessionTimestamp || !demoUser) return null;
    
    const now = Date.now();
    const sessionAge = now - parseInt(sessionTimestamp);
    const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
    const remainingTime = maxSessionAge - sessionAge;
    
    return {
      isValid: remainingTime > 0,
      sessionAge: sessionAge,
      remainingTime: remainingTime,
      user: JSON.parse(demoUser)
    };
  };

  const value: DatabaseContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isDatabaseConnected: isDatabaseAvailable,
    signIn,
    signOut,
    signUp,
    setDemoUser,
    isSessionValid,
    getSessionInfo
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