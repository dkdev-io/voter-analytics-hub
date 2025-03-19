
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// The correct password for accessing the site
const CORRECT_PASSWORD = 'votercontact2025';
const PASSWORD_STORAGE_KEY = 'votercontact_auth';

interface PasswordGateProps {
  children: React.ReactNode;
}

export const PasswordGate = ({ children }: PasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(PASSWORD_STORAGE_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      // Save authentication state to localStorage
      localStorage.setItem(PASSWORD_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      toast({
        title: 'Access granted',
        description: 'Welcome to VoterContact.io',
      });
    } else {
      toast({
        title: 'Incorrect password',
        description: 'Please try again with the correct password',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">VoterContact.io</h1>
          <p className="text-gray-600 mt-2">This site is currently in private beta</p>
        </div>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Enter password to access
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter site password"
              required
              className="w-full"
            />
          </div>
          
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
            Access Site
          </Button>
        </form>
      </div>
    </div>
  );
};
