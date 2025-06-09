
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const UrgencySection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-red-50 to-orange-50 py-16">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold text-red-700 mb-6">
            Every Day You Wait Is Another Day Lost
          </h3>
          <p className="text-lg text-red-600 mb-8">
            While you're reading this, successful people are already using tools like Daily Dreamer to 
            build the life they want. The gap between where you are and where you could be grows wider every day.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <p className="text-2xl font-bold text-navy-500 mb-2">
              What will your life look like in 90 days?
            </p>
            <p className="text-gray-600">
              With consistent daily reflection and weekly goal tracking, you could be living the focused, 
              intentional life you've always wanted. Or you could still be wondering "what if?"
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={() => navigate(user ? "/" : "/auth")}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold"
          >
            {user ? "Continue Your Journey" : "Don't Wait Another Day - Start Now"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UrgencySection;
