import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, History, Settings, Home, LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference, default to light mode
    const savedTheme = localStorage.getItem("theme") || "light";
    const isDark = savedTheme === "dark";
    
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging you out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-navy-500 shadow-sm">
      <div className="px-4 h-16 flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center">
          {darkMode ? (
            <Moon className="h-5 w-5 text-yellow-300" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-500" />
          )}
          <div 
            className="ml-2 text-lg font-semibold dark:text-white cursor-pointer"
            onClick={() => navigate("/")}
          >
            Daily Dreamer
          </div>
        </div>
        
        <nav className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className={`text-sm ${location.pathname === "/" ? "bg-gray-100 dark:bg-navy-700" : ""}`}
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/history")}
            className={`text-sm ${location.pathname === "/history" ? "bg-gray-100 dark:bg-navy-700" : ""}`}
          >
            <History className="h-4 w-4 mr-1" />
            History
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/settings")}
            className={`text-sm ${location.pathname === "/settings" ? "bg-gray-100 dark:bg-navy-700" : ""}`}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
