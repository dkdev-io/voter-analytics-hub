
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

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

  if (!user && !skipAuth) {
    // Redirect to /auth and store the attempted location
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

  if (user || skipAuth) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
