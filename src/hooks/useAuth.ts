
import { useAuth as useAuthProvider } from '@/components/AuthProvider';

// Add debug logging
export const useAuth = () => {
  const auth = useAuthProvider();
  console.log('useAuth hook called with auth object:', auth);
  console.log('Available methods:', Object.keys(auth));
  return auth;
};
