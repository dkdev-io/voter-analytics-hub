
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogOut, MessageSquare } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-xl font-bold text-gray-900">
          Voter Analytics
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          
          <Link to="/ai-chat" className="text-gray-600 hover:text-gray-900 flex items-center">
            <MessageSquare className="mr-1 h-4 w-4" />
            AI Chat
          </Link>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
              onClick={handleSignOut}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sign Out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
