import { useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
  clientId?: number;
  permissions: string[];
}

export const useSupabase = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const demoUser = localStorage.getItem('demoUser');
    console.log('useSupabase: useEffect - demoUser from localStorage:', demoUser);
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        if (mounted) {
          setUser(parsedUser);
          console.log('useSupabase: User restored from localStorage:', parsedUser);
        }
      } catch (error) {
        console.error('Error parsing demo user from localStorage:', error);
        localStorage.removeItem('demoUser');
      }
    }
    if (mounted) {
      setLoading(false);
      console.log('useSupabase: Initial load complete. User:', user, 'Loading:', false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    console.log('useSupabase: signIn called with email:', email);
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
        console.log('useSupabase: Admin user set to', mockUser);
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
        console.log('useSupabase: Client user set to', mockUser);
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
        console.log('useSupabase: Team user set to', mockUser);
        return { data: { user: mockUser }, error: null };
      } else {
        console.log('useSupabase: Invalid credentials provided');
        throw new Error('Invalid credentials');
      }
    } catch (error: any) {
      console.log('useSupabase: signIn error:', error);
      return { data: null, error: { message: error.message || 'Sign in failed' } };
    } finally {
      setLoading(false);
      console.log('useSupabase: signIn completed, loading set to false');
    }
  };

  const signOut = async () => {
    setLoading(true);
    console.log('useSupabase: signOut called');
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.removeItem('demoUser');
      setUser(null);
      console.log('useSupabase: User signed out, set to null');
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
    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    setUser(demoUser);
    setLoading(false);
    console.log('useSupabase: Demo user set to', demoUser);
    console.log('useSupabase: isAuthenticated after setDemoUser:', !!demoUser);
  };

  console.log('useSupabase: Current state - User:', user, 'Loading:', loading, 'isAuthenticated:', !!user);

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    setDemoUser,
    isAuthenticated: !!user
  };
};
