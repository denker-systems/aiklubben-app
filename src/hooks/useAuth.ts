import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAuth] Initializing auth listener');
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] Auth state changed', { event, userId: session?.user?.id });
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('[useAuth] Token refreshed, skipping state update');
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Initial session fetched', { 
        hasSession: !!session, 
        userId: session?.user?.id 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('[useAuth] Unsubscribing from auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('[useAuth] signIn attempt', { email });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('[useAuth] signIn error:', error);
      } else {
        console.log('[useAuth] signIn successful');
      }
      return { error };
    } catch (err) {
      console.error('[useAuth] signIn exception:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    console.log('[useAuth] signOut attempt');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[useAuth] signOut error:', error);
    } else {
      console.log('[useAuth] signOut successful');
    }
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log('[useAuth] signUp attempt', { email });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) {
        console.error('[useAuth] signUp error:', error);
      } else {
        console.log('[useAuth] signUp successful');
      }
      return { error };
    } catch (err) {
      console.error('[useAuth] signUp exception:', err);
      return { error: err as Error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signOut,
    signUp,
  };
};
