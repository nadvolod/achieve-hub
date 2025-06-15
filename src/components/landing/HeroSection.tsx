
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-navy-500 mb-6 leading-tight">
          Stop Dreaming, Start
          <span className="text-teal-500 block">Achieving</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Turn your ambitions into accomplishments. Achieve Hub provides the structure and motivation
          you need to conquer your goals and build a more focused, purposeful life.
        </p>
        <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 text-left max-w-2xl mx-auto">
          <p className="text-red-800 font-medium">
            <strong>The Cost of Waiting:</strong> Research shows that people who don't track their progress are 
            42% less likely to achieve their goals. How many opportunities have already passed you by?
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={() => navigate(user ? "/" : "/auth")}
          className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg font-semibold"
        >
          {user ? "Go to My Achieve Hub" : "Start Achieving Today"}
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          {user ? "Continue your journey" : "Join thousands who are achieving their goals"}
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
