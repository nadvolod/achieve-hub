
import React from "react";
import Header from "@/components/Header";
import DailyQuestions from "@/components/DailyQuestions";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-16">
        <DailyQuestions />
      </main>
    </div>
  );
};

export default Index;
