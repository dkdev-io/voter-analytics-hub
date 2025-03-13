
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Dashboard
            </Link>
          </div>
          
          <nav className="flex space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
              Home
            </Link>
          </nav>
          
          <div>
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button variant="outline" onClick={signOut}>
                  Log Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
