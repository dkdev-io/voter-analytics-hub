
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthContainer } from '@/components/auth/AuthContainer';

const Auth = () => {
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();

  console.log('Auth component rendered, location state:', location.state);
  
  // Get the redirect path from location state, default to connect-data
  const from = location.state?.from || "/connect-data";
  
  useEffect(() => {
    // Clear skipAuth on mount to ensure proper authentication
    if (localStorage.getItem('skipAuth') === 'true') {
      console.log('Auth: Clearing skipAuth flag on Auth page load');
      localStorage.removeItem('skipAuth');
      
      logAuthFlowIssue('Auth page - cleared skipAuth', {
        locationState: location.state,
        previousSkipAuth: true
      });
    }
  }, []);

  return (
    <AuthContainer>
      <AuthForm redirectPath={from} />
    </AuthContainer>
  );
};

export default Auth;
