
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Home, HistoryIcon, Settings2, LogOut, Menu, Sun, Moon } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="mx-auto px-4 max-w-5xl flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-xl text-navy-500 flex items-center">
            {isActivePath('/') ? <Sun className="w-5 h-5 mr-2 text-amber-500" /> : <Moon className="w-5 h-5 mr-2 text-indigo-500" />}
            <span>Daily Dreamer</span>
          </Link>
        </div>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant={isActivePath('/') ? "default" : "ghost"} size="sm">
                <Home className="w-4 h-4 mr-1" />
                Today
              </Button>
            </Link>
            <Link to="/history">
              <Button variant={isActivePath('/history') ? "default" : "ghost"} size="sm">
                <HistoryIcon className="w-4 h-4 mr-1" />
                History
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant={isActivePath('/settings') ? "default" : "ghost"} size="sm">
                <Settings2 className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </nav>
        )}
        
        {user && (
          <div className="md:hidden">
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { navigate('/'); setMenuOpen(false); }}>
                  <Home className="w-4 h-4 mr-2" />
                  Today
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/history'); setMenuOpen(false); }}>
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { navigate('/settings'); setMenuOpen(false); }}>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
