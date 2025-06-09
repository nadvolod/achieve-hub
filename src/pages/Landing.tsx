
import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import HeroSection from "@/components/landing/HeroSection";
import SocialProof from "@/components/landing/SocialProof";
import ProblemSolution from "@/components/landing/ProblemSolution";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UrgencySection from "@/components/landing/UrgencySection";
import FinalCTA from "@/components/landing/FinalCTA";
import LandingFooter from "@/components/landing/LandingFooter";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50">
      <LandingHeader />
      <HeroSection />
      <SocialProof />
      <ProblemSolution />
      <FeaturesSection />
      <UrgencySection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default Landing;
