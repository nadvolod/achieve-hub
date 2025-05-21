
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import DatePicker from "@/components/DatePicker";
import EntryList from "@/components/EntryList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History as HistoryIcon, RefreshCw } from "lucide-react";
import { useQuestions } from "../context/QuestionsContext";
import { useToast } from "@/components/ui/use-toast";

const History = () => {
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<"date" | "all">("all");
  const { refreshEntries, entries } = useQuestions();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Ensure we fetch the latest entries when the component mounts
  useEffect(() => {
    console.log("History: Component mounted, refreshing entries");
    const initialLoad = async () => {
      await handleRefresh();
      
      // Set up an interval to refresh entries every 5 seconds while the component is mounted
      const intervalId = setInterval(async () => {
        console.log("History: Auto-refreshing entries");
        try {
          await refreshEntries();
        } catch (error) {
          console.error("Error auto-refreshing entries:", error);
        }
      }, 5000); // Reduced from 10s to 5s for more frequent updates
      
      // Clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    };
    
    initialLoad();
  }, [refreshEntries]);
  
  // Also refresh when navigating back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("History: Page became visible, refreshing entries");
        handleRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleRefresh);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleRefresh);
    };
  }, []);
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setViewMode("date");
  };
  
  const clearSelectedDate = () => {
    setSelectedDate(undefined);
    setViewMode("all");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("History: Manual refresh triggered");
    
    try {
      await refreshEntries();
      toast({
        title: "Entries refreshed",
        description: "Your reflection entries have been updated.",
      });
    } catch (error) {
      console.error("Error refreshing entries:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh your entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-navy-500">Reflection History</h1>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-sm text-teal-500 hover:text-teal-700 flex items-center gap-1 disabled:opacity-50"
          >
            <span className={`h-4 w-4 inline-block ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? '⟳' : <RefreshCw className="h-4 w-4" />}
            </span> 
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
