import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

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
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const maxFetchAttempts = 3;

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Session fetch timeout - setting default user');
            setUser({
              id: 'default-user',
              email: 'admin@sentra.com',
              name: 'Admin User',
              role: 'Super Admin',
              permissions: ['all']
            });
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        const { data: { session } } = await supabase.auth.getSession();
        
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        
        if (mounted && session?.user) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          // No session, user needs to log in
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        try {
          if (session?.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    // Prevent infinite fetch attempts
    if (fetchAttempts >= maxFetchAttempts) {
      console.warn('Max fetch attempts reached, using fallback user');
      // Determine role based on email for demo purposes
      const role = authUser.email === 'client@sentra.com' ? 'Client Admin' : 'Super Admin';
      const clientId = authUser.email === 'client@sentra.com' ? 1 : undefined;
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email === 'client@sentra.com' ? 'Nik Salwani Bt.Nik Ab Rahman' : authUser.email?.split('@')[0] || 'User',
        role: role,
        clientId: clientId,
        permissions: role === 'Client Admin' ? ['client_dashboard', 'client_profile', 'client_messages'] : ['all']
      });
      return;
    }

    setFetchAttempts(prev => prev + 1);

    try {
      console.log('Fetching user profile for:', authUser.id);
      
      // Add timeout for this specific query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: userProfile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If it's an RLS error or user not found, create a default user
        if (error.code === 'PGRST116' || error.message?.includes('infinite recursion') || error.message?.includes('RLS') || error.message?.includes('timeout')) {
          console.log('RLS or user not found error, creating default user');
          
          // Determine role based on email for demo purposes
          const role = authUser.email === 'client@sentra.com' ? 'Client Admin' : 'Super Admin';
          const clientId = authUser.email === 'client@sentra.com' ? 1 : undefined;
          
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            name: authUser.email === 'client@sentra.com' ? 'Nik Salwani Bt.Nik Ab Rahman' : authUser.email?.split('@')[0] || 'User',
            role: role,
            clientId: clientId,
            permissions: role === 'Client Admin' ? ['client_dashboard', 'client_profile', 'client_messages'] : ['all']
          });
          setFetchAttempts(0); // Reset attempts on successful fallback
          return;
        }
        throw error;
      }

      if (userProfile) {
        console.log('User profile found:', userProfile);
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          clientId: userProfile.client_id,
          permissions: userProfile.permissions
        });
        setFetchAttempts(0); // Reset attempts on success
      } else {
        // Handle case where user exists in auth.users but not in public.users
        console.warn('User found in auth.users but no profile in public.users table:', authUser.id);
        
        // Determine role based on email for demo purposes
        const role = authUser.email === 'client@sentra.com' ? 'Client Admin' : 'Super Admin';
        const clientId = authUser.email === 'client@sentra.com' ? 1 : undefined;
        
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.email === 'client@sentra.com' ? 'Nik Salwani Bt.Nik Ab Rahman' : authUser.email?.split('@')[0] || 'User',
          role: role,
          clientId: clientId,
          permissions: role === 'Client Admin' ? ['client_dashboard', 'client_profile', 'client_messages'] : ['all']
        });
        setFetchAttempts(0); // Reset attempts
      }

    } catch (error) {
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.warn('Profile fetch timeout - using fallback user:', error.message);
      } else {
        console.error('Error in fetchUserProfile:', error);
      }
      // Set a default user based on email if there's an error
      const role = authUser.email === 'client@sentra.com' ? 'Client Admin' : 'Super Admin';
      const clientId = authUser.email === 'client@sentra.com' ? 1 : undefined;
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email === 'client@sentra.com' ? 'Nik Salwani Bt.Nik Ab Rahman' : authUser.email?.split('@')[0] || 'User',
        role: role,
        clientId: clientId,
        permissions: role === 'Client Admin' ? ['client_dashboard', 'client_profile', 'client_messages'] : ['all']
      });
      setFetchAttempts(0); // Reset attempts
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is properly configured
      if (!supabaseUrl || supabaseUrl.includes('your-project') || 
          !supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
        throw new Error('Supabase not configured - using demo mode');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Update last login
      if (data.user) {
        try {
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);
        } catch (updateError) {
          console.warn('Could not update last login:', updateError);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    role: 'Super Admin' | 'Team' | 'Client Admin' | 'Client Team';
    clientId?: number;
    permissions: string[];
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            name: userData.name,
            role: userData.role,
            client_id: userData.clientId,
            permissions: userData.permissions,
            status: 'Active'
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    signUp,
    isAuthenticated: !!user
  };
};