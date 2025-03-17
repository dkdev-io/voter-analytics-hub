
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthForm } from '@/hooks/useAuthForm';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthContainer } from '@/components/auth/AuthContainer';

const Auth = () => {
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();

  console.log('Auth component rendered, location state:', location.state);
  
  // Get the redirect path from location state, default to connect-data
  const from = location.state?.from || "/connect-data";
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    loading, 
    error, 
    isLogin, 
    signupSuccess,
    toggleAuthMode, 
    handleSubmit, 
    handleSkipAuth 
  } = useAuthForm(from);
  
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
      <AuthForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
        isLogin={isLogin}
        signupSuccess={signupSuccess}
        onToggleMode={toggleAuthMode}
        onSubmit={handleSubmit}
        onSkipAuth={handleSkipAuth}
      />
    </AuthContainer>
  );
};

export default Auth;
