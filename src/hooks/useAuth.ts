
import { useAuth as useAuthProvider } from '@/components/AuthProvider';

// Add debug logging
export const useAuth = () => {
  const auth = useAuthProvider();
  console.log('useAuth hook called, authenticated:', !!auth.user);
  return auth;
};
