
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useErrorLogger } from '@/hooks/useErrorLogger';
import { useEffect, useRef, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();
  const loggedRef = useRef(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Always check localStorage directly to avoid stale closures
  const skipAuth = localStorage.getItem('skipAuth') === 'true';

  // Set a maximum loading time of 3 seconds to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Only log auth guard activity on first render or when status changes
  useEffect(() => {
    if (!loggedRef.current && !loading) {
      logAuthFlowIssue('AuthGuard', {
        isAuthenticated: !!user,
        skipAuth,
        path: location.pathname
      });
      loggedRef.current = true;
    }
  }, [loading, user, skipAuth, location.pathname, logAuthFlowIssue]);

  // If loading has timed out or finished, proceed with auth check
  if (loading && !loadingTimeout) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is not authenticated and skipAuth is not enabled, redirect to auth
  if (!user && !skipAuth) {
    console.log('AuthGuard: Redirecting to /auth from', location.pathname);
    // Save the current path to redirect back after auth
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

export const UnauthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { logAuthFlowIssue } = useErrorLogger();
  const loggedRef = useRef(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Always check localStorage directly to avoid stale closures
  const skipAuth = localStorage.getItem('skipAuth') === 'true';
  
  // Set a maximum loading time of 3 seconds to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Only log unauth guard activity on first render or when status changes
  useEffect(() => {
    if (!loggedRef.current && !loading) {
      logAuthFlowIssue('UnauthGuard', {
        isAuthenticated: !!user,
        skipAuth,
        path: location.pathname
      });
      loggedRef.current = true;
    }
  }, [loading, user, skipAuth, location.pathname, logAuthFlowIssue]);
  
  // If loading has timed out or finished, proceed with auth check
  if (loading && !loadingTimeout) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is authenticated or skipAuth is enabled, redirect to connect-data
  if (user || skipAuth) {
    console.log('UnauthGuard: Redirecting to /connect-data');
    return <Navigate to="/connect-data" replace />;
  }

  return <>{children}</>;
};
