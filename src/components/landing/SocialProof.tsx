
import React from "react";
import { CheckCircle, TrendingUp, Users } from "lucide-react";

const SocialProof = () => {
  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center space-x-8 text-gray-600">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">2,847 Active Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">98% Report Better Focus</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <span className="font-medium">Average 73% Goal Completion</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
