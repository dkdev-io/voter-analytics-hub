
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthMode = 'login' | 'signup';

export function useAuthForm(redirectPath: string = '/connect-data') {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { logAuthFlowIssue } = useErrorLogger();

  // Get the intended destination from location state, if available
  const from = location.state?.from || redirectPath;

  const toggleAuthMode = () => setIsLogin(!isLogin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'You have been logged in successfully!',
        });
        
        console.log('Auth: Login successful, redirecting to', from);
        // The UnauthGuard will handle redirection
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Registration successful! Please check your email for confirmation.',
        });
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
      logAuthFlowIssue('Auth submission error', {
        errorMessage: error.message,
        isLogin,
        email: email.substring(0, 3) + '***', // Don't log full email for privacy
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAuth = () => {
    logAuthFlowIssue('Skip Auth button clicked', {
      redirectTarget: from
    });
    
    localStorage.setItem('skipAuth', 'true');
    toast({
      title: 'Access Granted',
      description: 'Proceeding without authentication',
    });
    console.log('Auth: Skip auth, redirecting to', from);
    navigate(from);
  };

  return {
    email,
    setEmail,
    password, 
    setPassword,
    loading,
    error,
    isLogin,
    toggleAuthMode,
    handleSubmit,
    handleSkipAuth
  };
}
