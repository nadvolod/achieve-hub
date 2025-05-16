
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-teal-400">
          Daily <span className="text-navy-500">Reflections</span>
        </h1>
      </div>
      
      <nav className="flex items-center gap-2">
        <Button
          variant={isActive("/") ? "default" : "ghost"}
          size="sm"
          asChild
          className={isActive("/") ? "bg-teal-400 hover:bg-teal-500" : ""}
        >
          <Link to="/">
            <Menu className="mr-2 h-4 w-4" />
            Today
          </Link>
        </Button>
        
        <Button
          variant={isActive("/history") ? "default" : "ghost"}
          size="sm"
          asChild
          className={isActive("/history") ? "bg-teal-400 hover:bg-teal-500" : ""}
        >
          <Link to="/history">
            <Calendar className="mr-2 h-4 w-4" />
            History
          </Link>
        </Button>
        
        <Button
          variant={isActive("/settings") ? "default" : "ghost"}
          size="sm"
          asChild
          className={isActive("/settings") ? "bg-teal-400 hover:bg-teal-500" : ""}
        >
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </nav>
    </header>
  );
};

export default Header;
