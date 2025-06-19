import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Save, Grid, List } from "lucide-react";
import QuestionCard from "./QuestionCard";
import SingleQuestionView from "./SingleQuestionView";
import WeeklyPriorities from "./WeeklyPriorities";
import MoodTracker from "./MoodTracker";
import MoodChart from "./MoodChart";
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
    refreshTodaysQuestions,
    refreshEntries,
    getMoodTrend
  } = useQuestions();
  
  const { toast } = useToast();
  const { updateStreak } = useAuth();
  const [morningAnswers, setMorningAnswers] = useState<Record<string, string>>({});
  const [eveningAnswers, setEveningAnswers] = useState<Record<string, string>>({});
  const [morningMood, setMorningMood] = useState<number | undefined>(undefined);
  const [eveningMood, setEveningMood] = useState<number | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("morning");
  const [viewMode, setViewMode] = useState<'single' | 'list'>('single');
  
  // Use the improved getTodayDateString function to get today's date
  const today = getTodayDateString();
  const formattedDate = formatDate(today);
  
  // Get mood trend data
  const moodTrend = getMoodTrend();
  
  // Sort questions to put top 5 ones first
  const sortedMorningQuestions = [...todaysMorningQuestions].sort((a, b) => {
    if (a.isTopFive && !b.isTopFive) return -1;
    if (!a.isTopFive && b.isTopFive) return 1;
    return a.position - b.position;
  });

  const sortedEveningQuestions = [...todaysEveningQuestions].sort((a, b) => {
    if (a.isTopFive && !b.isTopFive) return -1;
    if (!a.isTopFive && b.isTopFive) return 1;
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
      setMorningMood(morningEntry.mood);
    } else {
      // Initialize empty answers for all morning questions
      const initialAnswers: Record<string, string> = {};
      todaysMorningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setMorningAnswers(initialAnswers);
      setMorningMood(undefined);
    }
    
    // Process evening entries
    const eveningEntry = todaysEntries.find(entry => entry.type === 'evening');
    if (eveningEntry) {
      const loadedAnswers: Record<string, string> = {};
      eveningEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setEveningAnswers(loadedAnswers);
      setEveningMood(eveningEntry.mood);
    } else {
      // Initialize empty answers for all evening questions
      const initialAnswers: Record<string, string> = {};
      todaysEveningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setEveningAnswers(initialAnswers);
      setEveningMood(undefined);
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
  };
  
  const handleEveningAnswerChange = (questionId: string, answer: string) => {
    setEveningAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleSaveAll = async () => {
    setIsSaving(true);
    
    try {
      // Save both morning and evening entries
      const activeQuestions = activeTab === "morning" ? sortedMorningQuestions : sortedEveningQuestions;
      const activeAnswers = activeTab === "morning" ? morningAnswers : eveningAnswers;
      const activeMood = activeTab === "morning" ? morningMood : eveningMood;
      
      // Process entries for current tab
      const entryAnswers = activeQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: activeAnswers[question.id] || ''
      }));
      
      // Only save if there are answers to save
      if (entryAnswers.some(answer => answer.answer.trim() !== '')) {
        await saveEntry({
          date: today,
          type: activeTab as 'morning' | 'evening',
          answers: entryAnswers,
          mood: activeMood
        });
      }
      
      // Force update streak immediately
      console.log("DailyQuestions: Explicitly updating streak after save");
      await updateStreak();
      
      // Refresh entries to ensure History page shows the latest data
      await refreshEntries();
      
      toast({
        title: `${activeTab === "morning" ? "Morning" : "Evening"} entries saved`,
        description: `Your ${activeTab} reflections have been saved successfully.`
      });
    } catch (error) {
      console.error("Error saving entries:", error);
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

  // If in single view mode, render the single question interface
  if (viewMode === 'single') {
    const activeQuestions = activeTab === "morning" ? sortedMorningQuestions : sortedEveningQuestions;
    const activeAnswers = activeTab === "morning" ? morningAnswers : eveningAnswers;
    const activeMood = activeTab === "morning" ? morningMood : eveningMood;
    const onAnswerChange = activeTab === "morning" ? handleMorningAnswerChange : handleEveningAnswerChange;
    const onMoodChange = activeTab === "morning" ? setMorningMood : setEveningMood;

    return (
      <div className="relative">
        {/* Header with view toggle */}
        <div className="bg-white shadow-sm border-b px-4 py-3 fixed top-16 left-0 right-0 z-10">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-500">{formattedDate}</h2>
            <div className="flex items-center gap-2">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-auto"
              >
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="morning" className="flex items-center gap-1 text-xs">
                    <Sun className="h-3 w-3" />
                    <span>AM</span>
                  </TabsTrigger>
                  <TabsTrigger value="evening" className="flex items-center gap-1 text-xs">
                    <Moon className="h-3 w-3" />
                    <span>PM</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                onClick={() => setViewMode('list')}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Offset for fixed header */}
        <div className="pt-16">
          <SingleQuestionView
            questions={activeQuestions}
            answers={activeAnswers}
            onAnswerChange={onAnswerChange}
            mood={activeMood}
            onMoodChange={onMoodChange}
            type={activeTab as 'morning' | 'evening'}
            onSave={handleSaveAll}
            isSaving={isSaving}
          />
        </div>
      </div>
    );
  }
  
  // Optimized list view with better layout
  return (
    <div className="space-y-4">
      {/* Streak Display */}
      <StreakDisplay />
      
      {/* Weekly Priorities - Compact Version */}
      <WeeklyPriorities />
      
      {/* Main Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-navy-500">{formattedDate}</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode('single')}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Grid className="h-4 w-4" />
            Single
          </Button>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="text-teal-500 border-teal-300 hover:bg-teal-50"
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Mood Chart - Compact */}
      <div className="mb-4">
        <MoodChart moodData={moodTrend} />
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
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
          <MoodTracker 
            mood={morningMood} 
            onMoodChange={setMorningMood} 
            type="morning"
          />
          {sortedMorningQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={morningAnswers[question.id] || ''}
              onAnswerChange={(answer) => handleMorningAnswerChange(question.id, answer)}
            />
          ))}
        </TabsContent>
        
        <TabsContent value="evening" className="space-y-4">
          <MoodTracker 
            mood={eveningMood} 
            onMoodChange={setEveningMood} 
            type="evening"
          />
          {sortedEveningQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              answer={eveningAnswers[question.id] || ''}
              onAnswerChange={(answer) => handleEveningAnswerChange(question.id, answer)}
            />
          ))}
        </TabsContent>
      </Tabs>
      
      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-20">
        <Button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg h-14 w-14 flex items-center justify-center"
        >
          {isSaving ? 
            <span className="animate-spin">⟳</span> : 
            <Save className="h-6 w-6" />
          }
        </Button>
      </div>
    </div>
  );
};

export default DailyQuestions;
