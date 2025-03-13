import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, LogOut, ClipboardList } from "lucide-react";
import { useMobile } from "@/hooks/useMobile";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto py-4 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-xl">
            VoterDash
          </Link>
        </div>

        {isMobile ? (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {user ? (
                    <>
                      <Link
                        to="/issues"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={toggleMenu}
                      >
                        <div className="flex items-center">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Issue Tracker
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          toggleMenu();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </div>
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/issues" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Issue Tracker
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
