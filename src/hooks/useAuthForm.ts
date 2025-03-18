
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup';

export function useAuthForm(redirectPath: string = '/connect-data') {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logAuthFlowIssue } = useErrorLogger();

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSignupSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignupSuccess(false);

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
        
        console.log('Auth: Login successful, redirecting to', redirectPath);
        navigate(redirectPath);
      } else {
        // Sign up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          }
        });

        if (error) throw error;
        
        setSignupSuccess(true);
        
        toast({
          title: 'Registration Successful',
          description: 'Please check your email to verify your account.',
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
      redirectTarget: redirectPath
    });
    
    localStorage.setItem('skipAuth', 'true');
    toast({
      title: 'Access Granted',
      description: 'Proceeding without authentication',
    });
    console.log('Auth: Skip auth, redirecting to', redirectPath);
    navigate(redirectPath);
  };

  return {
    email,
    setEmail,
    password, 
    setPassword,
    fullName,
    setFullName,
    loading,
    error,
    isLogin,
    signupSuccess,
    toggleAuthMode,
    handleSubmit,
    handleSkipAuth
  };
}
