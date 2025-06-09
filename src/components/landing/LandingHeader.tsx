
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-navy-500">Daily Dreamer</h1>
        <div className="flex gap-3">
          {user ? (
            <Button 
              onClick={() => navigate("/")}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Go to My App
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => navigate("/auth")}
              className="border-teal-500 text-teal-700 hover:bg-teal-50"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
