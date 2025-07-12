import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  clientId?: number;
  permissions: string[];
}

interface SupabaseContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
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

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const demoUser = localStorage.getItem('demoUser');
    console.log('SupabaseProvider: useEffect - demoUser from localStorage:', demoUser);
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        if (mounted) {
          setUser(parsedUser);
          console.log('SupabaseProvider: User restored from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error parsing demo user from localStorage:', error);
        localStorage.removeItem('demoUser');
      }
    }
    if (mounted) {
      setLoading(false);
      console.log('SupabaseProvider: Initial load complete. User:', user, 'Loading:', false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('SupabaseProvider: signIn called with email:', email);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Hardcoded demo credentials
      if (email === 'admin@sentra.com' && password === 'password123') {
        const mockUser: AuthUser = {
          id: 'admin-user-id',
          email: 'admin@sentra.com',
          name: 'Admin User',
          role: 'Super Admin',
          permissions: ['all']
        };
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('SupabaseProvider: Admin user set to', mockUser);
        return { data: { user: mockUser }, error: null };
      } else if (email === 'client@sentra.com' && password === 'password123') {
        const mockUser: AuthUser = {
          id: 'client-user-id',
          email: 'client@sentra.com',
          name: 'Nik Salwani Bt.Nik Ab Rahman',
          role: 'Client Admin',
          clientId: 1,
          permissions: ['client_dashboard', 'client_profile', 'client_messages']
        };
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('SupabaseProvider: Client user set to', mockUser);
        return { data: { user: mockUser }, error: null };
      } else if (email === 'team@sentra.com' && password === 'password123') {
        const mockUser: AuthUser = {
          id: 'team-user-id',
          email: 'team@sentra.com',
          name: 'Team Member',
          role: 'Team',
          permissions: ['clients', 'calendar', 'chat', 'reports', 'dashboard']
        };
        localStorage.setItem('demoUser', JSON.stringify(mockUser));
        setUser(mockUser);
        console.log('SupabaseProvider: Team user set to', mockUser);
        return { data: { user: mockUser }, error: null };
      } else {
        console.log('SupabaseProvider: Invalid credentials provided');
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.log('SupabaseProvider: signIn error:', error);
      return { data: null, error: { message: error.message || 'Sign in failed' } };
    } finally {
      setLoading(false);
      console.log('SupabaseProvider: signIn completed, loading set to false');
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('SupabaseProvider: signOut called');
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.removeItem('demoUser');
      setUser(null);
      console.log('SupabaseProvider: User signed out, set to null');
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Sign out failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
    clientId?: number;
    permissions: string[];
  }) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, you'd store this user data. For this local setup, we just mock success.
      console.log('Mock signUp successful for:', email, userData);
      return { data: { user: { id: 'mock-id', email } }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Sign up failed' } };
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoUser: AuthUser) => {
    console.log('SupabaseProvider: setDemoUser called with:', demoUser);
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
    console.log('SupabaseProvider: Demo user set to', demoUser);
    console.log('SupabaseProvider: isAuthenticated after setDemoUser:', !!demoUser);
  };

  const isAuthenticated = !!user;

  console.log('SupabaseProvider: Current state - User:', user, 'Loading:', loading, 'isAuthenticated:', isAuthenticated);

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signOut,
    signUp,
    setDemoUser
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};