
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';

export const Navbar = () => {
  const { isMobile } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">Dashboard</Link>
          
          {isMobile ? (
            <div>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X /> : <Menu />}
              </Button>
              
              {isMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg p-4 flex flex-col gap-4">
                  <Link to="/#features" className="py-2" onClick={toggleMenu}>Features</Link>
                  <Link to="/#pricing" className="py-2" onClick={toggleMenu}>Pricing</Link>
                  <Link to="/#more-info" className="py-2" onClick={toggleMenu}>More Info</Link>
                  <Link to="/auth">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-6">
                <Link to="/#features" className="text-sm font-medium hover:text-blue-500 transition-colors">Features</Link>
                <Link to="/#pricing" className="text-sm font-medium hover:text-blue-500 transition-colors">Pricing</Link>
                <Link to="/#more-info" className="text-sm font-medium hover:text-blue-500 transition-colors">More Info</Link>
              </nav>
              <Link to="/auth">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
