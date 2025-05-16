
import React, { useState } from "react";
import Header from "@/components/Header";
import DatePicker from "@/components/DatePicker";
import EntryList from "@/components/EntryList";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };
  
  const clearSelectedDate = () => {
    setSelectedDate(undefined);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-navy-500 mb-2">Reflection History</h1>
        <p className="text-gray-600 mb-6">
          Review your past reflections to track your growth and insights.
        </p>
        
        <div className="mb-4">
          <DatePicker onSelectDate={handleSelectDate} />
          
          {selectedDate && (
            <div className="mt-2 text-right">
              <button 
                onClick={clearSelectedDate}
                className="text-sm text-teal-500 hover:text-teal-700"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
        
        <EntryList selectedDate={selectedDate} />
      </main>
    </div>
  );
};

export default History;
