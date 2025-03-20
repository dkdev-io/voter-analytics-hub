
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserMetadata {
  last_dataset_name?: string;
  last_dataset_upload_date?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userMetadata: UserMetadata | null;
  signOut: () => Promise<void>;
  refreshUserMetadata: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userMetadata: null,
  signOut: async () => {},
  refreshUserMetadata: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false);
  
  // Use a memoized function to refresh metadata to avoid creating a new function on every render
  const refreshUserMetadata = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error refreshing user metadata:', error);
        return;
      }
      
      if (updatedUser?.user_metadata) {
        setUserMetadata(updatedUser.user_metadata as UserMetadata);
      }
    } catch (error) {
      console.error('Failed to refresh user metadata:', error);
    }
  }, [user]);

  // Initial session check - only run once
  useEffect(() => {
    if (initialCheckDone.current) return;
    
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUser(data.session.user);
          setUserMetadata(data.session.user.user_metadata as UserMetadata || null);
        } else {
          setUser(null);
          setUserMetadata(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
        initialCheckDone.current = true;
      }
    };

    checkSession();
  }, []);

  // Auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setUserMetadata(session.user.user_metadata as UserMetadata || null);
      } else {
        setUser(null);
        setUserMetadata(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserMetadata(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    userMetadata,
    signOut,
    refreshUserMetadata,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
