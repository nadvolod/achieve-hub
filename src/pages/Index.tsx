
import React from "react";
import Header from "@/components/Header";
import DailyQuestions from "@/components/DailyQuestions";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-16 px-4 pb-4 max-w-md mx-auto w-full">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-navy-500 mb-1">Achieve Hub</h1>
          <p className="text-gray-600 text-sm">
            Take time to reflect and achieve your goals.
          </p>
        </div>
        
        <DailyQuestions />
      </main>
    </div>
  );
};

export default Index;
