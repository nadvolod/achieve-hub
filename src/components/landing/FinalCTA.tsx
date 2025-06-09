
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="bg-navy-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Join the Daily Dreamer Community Today
          </h3>
          <p className="text-xl mb-8 text-gray-200">
            Take the first step towards the focused, intentional life you deserve. 
            Your future self will thank you for starting today.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate(user ? "/" : "/auth")}
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold"
          >
            {user ? "Open Daily Dreamer" : "Get Started Free"}
          </Button>
          <p className="text-sm text-gray-300 mt-4">
            {user ? "Continue building your better life" : "No credit card required • Start transforming your life in under 2 minutes"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
