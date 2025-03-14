
import { useAuth as useAuthProvider } from '@/components/AuthProvider';

// Add debug logging
export const useAuth = () => {
  const auth = useAuthProvider();
  const currentPath = window.location.pathname;
  
  // Only log on paths that are not the landing page to avoid redirects
  if (currentPath !== '/') {
    console.log('useAuth hook called, authenticated:', !!auth.user, 'skipAuth:', localStorage.getItem('skipAuth') === 'true', 'current path:', currentPath);
  }
  
  return auth;
};
