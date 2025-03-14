
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();
  const { toast } = useToast();
  
  // Always check localStorage directly to avoid stale closures
  const skipAuth = localStorage.getItem('skipAuth') === 'true';

  // Log the auth guard activity
  logAuthFlowIssue('AuthGuard', {
    isAuthenticated: !!user,
    loading,
    skipAuth,
    path: location.pathname,
    state: location.state
  });

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is not authenticated and skipAuth is not enabled, redirect to auth
  if (!user && !skipAuth) {
    console.log('AuthGuard: Redirecting to /auth from', location.pathname);
    // Save the current path to redirect back after auth
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // User is authenticated or skipAuth is enabled, show protected content
  return <>{children}</>;
};

export const UnauthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();
  const { toast } = useToast();
  
  // Always check localStorage directly to avoid stale closures
  const skipAuth = localStorage.getItem('skipAuth') === 'true';
  
  // Log the unauth guard activity
  logAuthFlowIssue('UnauthGuard', {
    isAuthenticated: !!user,
    loading,
    skipAuth,
    path: location.pathname
  });
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is authenticated or skipAuth is enabled, redirect to connect-data
  if (user || skipAuth) {
    console.log('UnauthGuard: Redirecting to /connect-data');
    toast({
      title: "Authentication successful",
      description: "Redirecting to data connection page",
    });
    return <Navigate to="/connect-data" replace />;
  }

  // User is not authenticated and skipAuth is not enabled, show auth content
  return <>{children}</>;
};
