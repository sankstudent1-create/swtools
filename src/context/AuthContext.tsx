'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  profile: any | null;
}>({
  user: null,
  loading: true,
  profile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Check
    const initialize = async () => {
      try {
        console.log('AuthContext: Initializing...');
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          console.log('AuthContext: User found, fetching profile:', currentUser.id);
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
            console.warn('AuthContext: Profile missing, creating default for:', currentUser.id);
            const newProfile = {
              id: currentUser.id,
              full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
              wallet_balance: 0
            };
            const { error: insErr } = await supabase.from('profiles').insert(newProfile);
            if (insErr) console.error('AuthContext: Profile creation failed:', insErr);
            setProfile(newProfile);
          } else if (data) {
            console.log('AuthContext: Profile loaded successfully');
            setProfile(data);
          }
        }
      } catch (err) {
        console.error('AuthContext: Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };


    initialize();

    // 2. Listen for Auth & Data Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // 3. Real-time Profile Updates (for credits/wallet_balance sync)
    const profileSubscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: user ? `id=eq.${user.id}` : undefined
      }, (payload) => {
        setProfile(payload.new);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
