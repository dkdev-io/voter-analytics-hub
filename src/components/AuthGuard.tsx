
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const skipAuth = localStorage.getItem('skipAuth') === 'true';

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is not authenticated and skipAuth is not enabled, redirect to auth
  if (!user && !skipAuth) {
    console.log('AuthGuard: Redirecting to /auth from', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const UnauthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const skipAuth = localStorage.getItem('skipAuth') === 'true';
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // If user is authenticated or skipAuth is enabled, redirect to connect-data
  if (user || skipAuth) {
    console.log('UnauthGuard: Redirecting to /connect-data');
    return <Navigate to="/connect-data" replace />;
  }

  return <>{children}</>;
};
