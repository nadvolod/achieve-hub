import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { useQuestions } from "../context/QuestionsContext";
import { formatDate, getTodayDateString } from "../utils/questionsUtils";
import { useAuth } from "../context/AuthContext";
import StreakDisplay from "./StreakDisplay";

const DailyQuestions: React.FC = () => {
  const { 
    todaysMorningQuestions, 
    todaysEveningQuestions, 
    saveEntry, 
    getEntries, 
    refreshTodaysQuestions 
  } = useQuestions();
  
  const { toast } = useToast();
  const { updateStreak } = useAuth();
  const [morningAnswers, setMorningAnswers] = useState<Record<string, string>>({});
  const [eveningAnswers, setEveningAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("morning");
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  
  const today = getTodayDateString();
  const formattedDate = formatDate(today);
  
  // Sort questions to put required ones first
  const sortedMorningQuestions = [...todaysMorningQuestions].sort((a, b) => {
    if (a.isMandatory && !b.isMandatory) return -1;
    if (!a.isMandatory && b.isMandatory) return 1;
    return a.position - b.position;
  });

  const sortedEveningQuestions = [...todaysEveningQuestions].sort((a, b) => {
    if (a.isMandatory && !b.isMandatory) return -1;
    if (!a.isMandatory && b.isMandatory) return 1;
    return a.position - b.position;
  });
  
  // Load any existing entries for today
  useEffect(() => {
    const todaysEntries = getEntries(today);
    
    // Process morning entries
    const morningEntry = todaysEntries.find(entry => entry.type === 'morning');
    if (morningEntry) {
      const loadedAnswers: Record<string, string> = {};
      morningEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setMorningAnswers(loadedAnswers);
    } else {
      // Initialize empty answers for all morning questions
      const initialAnswers: Record<string, string> = {};
      todaysMorningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setMorningAnswers(initialAnswers);
    }
    
    // Process evening entries
    const eveningEntry = todaysEntries.find(entry => entry.type === 'evening');
    if (eveningEntry) {
      const loadedAnswers: Record<string, string> = {};
      eveningEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setEveningAnswers(loadedAnswers);
    } else {
      // Initialize empty answers for all evening questions
      const initialAnswers: Record<string, string> = {};
      todaysEveningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setEveningAnswers(initialAnswers);
    }
    
    // Set default active tab based on time of day
    const currentHour = new Date().getHours();
    setActiveTab(currentHour >= 17 ? "evening" : "morning"); // Use evening tab after 5PM (17:00)
    
  }, [todaysMorningQuestions, todaysEveningQuestions, getEntries, today]);
  
  const handleMorningAnswerChange = (questionId: string, answer: string) => {
    setMorningAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Trigger auto-save timer
    scheduleAutoSave();
    // Set status to show we're going to save
    setSaveStatus("saving");
  };
  
  const handleEveningAnswerChange = (questionId: string, answer: string) => {
    setEveningAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Trigger auto-save timer
    scheduleAutoSave();
    // Set status to show we're going to save
    setSaveStatus("saving");
  };
  
  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    // Clear existing timer if there is one
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Set a new timer for auto-save (1 second after typing stops for more responsive saving)
    const timer = setTimeout(() => {
      autoSaveEntries();
    }, 1000);
    
    setAutoSaveTimer(timer);
  }, [autoSaveTimer]);
  
  // Function to perform the auto-save
  const autoSaveEntries = useCallback(async () => {
    try {
      const currentTime = new Date();
      
      // Don't auto-save if last auto-save was less than 500ms ago
      if (lastAutoSave && currentTime.getTime() - lastAutoSave.getTime() < 500) {
        setSaveStatus("idle");
        return;
      }
      
      // Get the current active tab and related data
      const isActiveMorning = activeTab === "morning";
      
      // IMPORTANT: Always include BOTH morning and evening answers, regardless of active tab
      // This ensures we don't lose data when switching tabs
      
      // Process morning answers
      const morningEntryAnswers = todaysMorningQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: morningAnswers[question.id] || ''
      }));
      
      // Process evening answers
      const eveningEntryAnswers = todaysEveningQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: eveningAnswers[question.id] || ''
      }));
      
      // Only save the currently active tab if it has content
      const currentAnswers = isActiveMorning ? morningAnswers : eveningAnswers;
      const hasAnswers = Object.values(currentAnswers).some(answer => answer.trim() !== '');
      
      if (hasAnswers) {
        // Save the entry for the active tab
        await saveEntry({
          date: today,
          type: isActiveMorning ? 'morning' : 'evening',
          answers: isActiveMorning ? morningEntryAnswers : eveningEntryAnswers
        });
        
        // Update last auto-save timestamp
        setLastAutoSave(currentTime);
        
        // Update save status to "saved"
        setSaveStatus("saved");
        
        // Reset status to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } else {
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Error auto-saving:", error);
      setSaveStatus("idle");
      toast({
        title: "Auto-save failed",
        description: "There was a problem saving your answers. Please try again.",
        variant: "destructive"
      });
    }
  }, [activeTab, morningAnswers, eveningAnswers, todaysMorningQuestions, todaysEveningQuestions, saveEntry, lastAutoSave, today, toast]);
  
  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);
  
  const handleSaveMorning = async () => {
    // Validate mandatory questions are answered
    const mandatoryQuestions = todaysMorningQuestions.filter(q => q.isMandatory);
    const unansweredMandatory = mandatoryQuestions.filter(q => !morningAnswers[q.id]?.trim());
    
    if (unansweredMandatory.length > 0) {
      toast({
        title: "Missing required answers",
        description: "Please answer all required morning questions before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const entryAnswers = todaysMorningQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: morningAnswers[question.id] || ''
      }));
      
      // Save entry
      await saveEntry({
        date: today,
        type: 'morning',
        answers: entryAnswers
      });
      
      // Update user's streak
      await updateStreak();
      
      toast({
        title: "Morning entry saved",
        description: "Your morning reflections have been saved successfully."
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error saving",
        description: "There was a problem saving your answers.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveEvening = async () => {
    // Validate mandatory questions are answered
    const mandatoryQuestions = todaysEveningQuestions.filter(q => q.isMandatory);
    const unansweredMandatory = mandatoryQuestions.filter(q => !eveningAnswers[q.id]?.trim());
    
    if (unansweredMandatory.length > 0) {
      toast({
        title: "Missing required answers",
        description: "Please answer all required evening questions before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const entryAnswers = todaysEveningQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: eveningAnswers[question.id] || ''
      }));
      
      // Save entry
      await saveEntry({
        date: today,
        type: 'evening',
        answers: entryAnswers
      });
      
      // Update user's streak
      await updateStreak();
      
      toast({
        title: "Evening entry saved",
        description: "Your evening reflections have been saved successfully."
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error saving",
        description: "There was a problem saving your answers.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefresh = () => {
    refreshTodaysQuestions();
    toast({
      title: "Questions refreshed",
      description: "Your daily questions have been refreshed."
    });
  };
  
  // Render save status indicator
  const renderSaveStatus = () => {
    if (saveStatus === "idle") {
      return null;
    }
    
    return (
      <div className="text-xs text-gray-500 italic absolute bottom-4 right-4">
        {saveStatus === "saving" ? "Saving..." : "Saved"}
      </div>
    );
  };
  
  return (
    <div className="mt-4 relative">
      <StreakDisplay />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-navy-500">{formattedDate}</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="text-teal-500 border-teal-300 hover:bg-teal-50"
        >
          Refresh Questions
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="morning" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Morning</span>
          </TabsTrigger>
          <TabsTrigger value="evening" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Evening</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="morning" className="space-y-4">
          {sortedMorningQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={morningAnswers[question.id] || ''}
              onAnswerChange={(answer) => handleMorningAnswerChange(question.id, answer)}
            />
          ))}
          
          <div className="flex justify-end mt-6 mb-16">
            <Button 
              onClick={handleSaveMorning} 
              disabled={isSaving}
              className="bg-teal-400 hover:bg-teal-500 text-white"
            >
              {isSaving ? "Saving..." : "Save Morning Reflections"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="evening" className="space-y-4">
          {sortedEveningQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={eveningAnswers[question.id] || ''}
              onAnswerChange={(answer) => handleEveningAnswerChange(question.id, answer)}
            />
          ))}
          
          <div className="flex justify-end mt-6 mb-16">
            <Button 
              onClick={handleSaveEvening} 
              disabled={isSaving}
              className="bg-teal-400 hover:bg-teal-500 text-white"
            >
              {isSaving ? "Saving..." : "Save Evening Reflections"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {renderSaveStatus()}
    </div>
  );
};

export default DailyQuestions;
