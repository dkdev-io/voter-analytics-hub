
import { useAuth as useAuthProvider } from '@/components/AuthProvider';
import { useErrorLogger } from './useErrorLogger';

// Add debug logging
export const useAuth = () => {
  const auth = useAuthProvider();
  const { logAuthFlowIssue } = useErrorLogger();
  const currentPath = window.location.pathname;
  
  // Only log on paths that are not the landing page to avoid redirects
  if (currentPath !== '/' && currentPath !== '/auth') {
    console.log('useAuth hook called, authenticated:', !!auth.user, 'skipAuth:', localStorage.getItem('skipAuth') === 'true', 'current path:', currentPath);
    
    // Log detailed information about auth state for debugging
    logAuthFlowIssue('useAuth hook', {
      isAuthenticated: !!auth.user,
      loading: auth.loading,
      skipAuth: localStorage.getItem('skipAuth') === 'true',
      path: currentPath,
    });
  }
  
  return auth;
};
