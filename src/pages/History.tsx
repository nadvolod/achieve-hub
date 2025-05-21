
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DatePicker from "@/components/DatePicker";
import EntryList from "@/components/EntryList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History as HistoryIcon } from "lucide-react";
import { useQuestions } from "../context/QuestionsContext";
import { useToast } from "@/components/ui/use-toast";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"date" | "all">("all");
  const { refreshEntries, entries } = useQuestions();
  const { toast } = useToast();
  
  // Ensure we fetch the latest entries when the component mounts or becomes active
  useEffect(() => {
    console.log("History: Refreshing entries");
    
    // Immediately refresh entries when component mounts
    refreshEntries();
    
    // Show toast to indicate loading
    toast({
      title: "Loading entries",
      description: "Fetching your latest reflection entries...",
    });
    
  }, [refreshEntries, toast]);
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setViewMode("date");
  };
  
  const clearSelectedDate = () => {
    setSelectedDate(undefined);
    setViewMode("all");
  };

  const handleRefresh = () => {
    refreshEntries();
    toast({
      title: "Entries refreshed",
      description: "Your reflection entries have been updated.",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-navy-500">Reflection History</h1>
          <button 
            onClick={handleRefresh}
            className="text-sm text-teal-500 hover:text-teal-700 flex items-center gap-1"
          >
            <span className="h-4 w-4">⟳</span> Refresh
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Review your past reflections to track your growth and insights.
        </p>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "date" | "all")} className="w-full mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="date" onClick={() => selectedDate || setSelectedDate(new Date().toISOString().split('T')[0])} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>By Date</span>
            </TabsTrigger>
            <TabsTrigger value="all" onClick={clearSelectedDate} className="flex items-center gap-2">
              <HistoryIcon className="h-4 w-4" />
              <span>All History</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {viewMode === "date" && (
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
        )}
        
        <EntryList selectedDate={viewMode === "date" ? selectedDate : undefined} />
      </main>
    </div>
  );
};

export default History;
