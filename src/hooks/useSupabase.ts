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

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          await fetchUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
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
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('users')
        .select('id, email, name, role, client_id, permissions')
        .eq('id', authUser.id)
        .single();
      
      const { data: userProfile, error } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]) as any;

      if (error) {
        if (error.message === 'Request timeout') {
          console.error('User profile fetch timed out');
        } else {
          console.error('Error fetching user profile:', error);
        }
        // Set a default user if profile fetch fails
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.email?.split('@')[0] || 'User',
          role: 'Team',
          permissions: []
        });
        return;
      }

      if (userProfile) {
        setUser({
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          role: userProfile.role,
          clientId: userProfile.client_id,
          permissions: userProfile.permissions || []
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Set a default user if there's an error
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.email?.split('@')[0] || 'User',
        role: 'Team',
        permissions: []
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
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
            email: userData.name,
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