
import React from "react";
import Header from "@/components/Header";
import DailyQuestions from "@/components/DailyQuestions";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-navy-500 mb-2">Daily Dreamer</h1>
        <p className="text-gray-600 mb-6">
          Take time to reflect on these questions to improve your focus and mindfulness.
        </p>
        
        <DailyQuestions />
      </main>
    </div>
  );
};

export default Index;
