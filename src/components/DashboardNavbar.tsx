
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMobile } from '@/hooks/useMobile';
import { useState } from 'react';

export const DashboardNavbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Don't render on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b z-50">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">VoterContact.io</Link>
          
          {isMobile ? (
            <div className="flex items-center">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="ml-2">
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
              
              {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background shadow-lg p-4 flex flex-col gap-4">
                  {user && (
                    <>
                      <Button 
                        onClick={handleSignOut} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  )}
                  {!user && location.pathname !== '/' && (
                    <Link to="/" className="py-2" onClick={toggleMenu}>Home</Link>
                  )}
                  {!user && location.pathname === '/' && (
                    <>
                      <Link to="/#features" className="py-2" onClick={toggleMenu}>Features</Link>
                      <Link to="/#pricing" className="py-2" onClick={toggleMenu}>Pricing</Link>
                      <Link to="/#more-info" className="py-2" onClick={toggleMenu}>More Info</Link>
                      <Link to="/auth" onClick={toggleMenu}>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <ThemeToggle />
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  {location.pathname !== '/' ? (
                    <nav className="flex items-center gap-6">
                      <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                    </nav>
                  ) : (
                    <nav className="flex items-center gap-6">
                      <Link to="/#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                      <Link to="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                      <Link to="/#more-info" className="text-sm font-medium hover:text-primary transition-colors">More Info</Link>
                    </nav>
                  )}
                  <ThemeToggle />
                  {location.pathname !== '/auth' && (
                    <Link to="/auth">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
