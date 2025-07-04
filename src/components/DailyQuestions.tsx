import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Moon, Save, Sun } from "lucide-react";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useQuestions } from "../context/QuestionsContext";
import { formatDate, getTodayDateString } from "../utils/questionsUtils";
import DashboardLayout from "./DashboardLayout";
import MoodChart from "./MoodChart";
import MoodTracker from "./MoodTracker";
import QuestionCard from "./QuestionCard";
import SingleQuestionView from "./SingleQuestionView";

const DailyQuestions: React.FC = memo(() => {
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
  const [viewMode, setViewMode] = useState<'dashboard' | 'single' | 'list'>('dashboard');
  
  // Memoize today's date and formatted date
  const today = useMemo(() => getTodayDateString(), []);
  const formattedDate = useMemo(() => formatDate(today), [today]);
  const moodTrend = useMemo(() => getMoodTrend(), [getMoodTrend]);
  
  // Memoize sorted questions to prevent unnecessary recalculations
  const sortedMorningQuestions = useMemo(() => 
    [...todaysMorningQuestions].sort((a, b) => {
      if (a.isTopFive && !b.isTopFive) return -1;
      if (!a.isTopFive && b.isTopFive) return 1;
      return a.position - b.position;
    }), [todaysMorningQuestions]
  );

  const sortedEveningQuestions = useMemo(() => 
    [...todaysEveningQuestions].sort((a, b) => {
      if (a.isTopFive && !b.isTopFive) return -1;
      if (!a.isTopFive && b.isTopFive) return 1;
      return a.position - b.position;
    }), [todaysEveningQuestions]
  );
  
  // Load existing entries for today
  useEffect(() => {
    const todaysEntries = getEntries(today);
    
    const morningEntry = todaysEntries.find(entry => entry.type === 'morning');
    if (morningEntry) {
      const loadedAnswers: Record<string, string> = {};
      morningEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setMorningAnswers(loadedAnswers);
      setMorningMood(morningEntry.mood);
    } else {
      const initialAnswers: Record<string, string> = {};
      todaysMorningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setMorningAnswers(initialAnswers);
      setMorningMood(undefined);
    }
    
    const eveningEntry = todaysEntries.find(entry => entry.type === 'evening');
    if (eveningEntry) {
      const loadedAnswers: Record<string, string> = {};
      eveningEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setEveningAnswers(loadedAnswers);
      setEveningMood(eveningEntry.mood);
    } else {
      const initialAnswers: Record<string, string> = {};
      todaysEveningQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setEveningAnswers(initialAnswers);
      setEveningMood(undefined);
    }
    
    const currentHour = new Date().getHours();
    setActiveTab(currentHour >= 17 ? "evening" : "morning");
    
  }, [todaysMorningQuestions, todaysEveningQuestions, getEntries, today]);
  
  const handleMorningAnswerChange = useCallback((questionId: string, answer: string) => {
    setMorningAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);
  
  const handleEveningAnswerChange = useCallback((questionId: string, answer: string) => {
    setEveningAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);
  
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    
    try {
      const activeQuestions = activeTab === "morning" ? sortedMorningQuestions : sortedEveningQuestions;
      const activeAnswers = activeTab === "morning" ? morningAnswers : eveningAnswers;
      const activeMood = activeTab === "morning" ? morningMood : eveningMood;
      
      const entryAnswers = activeQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: activeAnswers[question.id] || ''
      }));
      
      if (entryAnswers.some(answer => answer.answer.trim() !== '') || activeMood !== undefined) {
        await saveEntry({
          date: today,
          type: activeTab as 'morning' | 'evening',
          answers: entryAnswers,
          mood: activeMood
        });
      }
      
      await updateStreak();
      await refreshEntries();
      
      toast({
        title: `${activeTab === "morning" ? "Morning" : "Evening"} entries saved`,
        description: `Your ${activeTab} reflections have been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Error saving",
        description: "There was a problem saving your answers.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, sortedMorningQuestions, sortedEveningQuestions, morningAnswers, eveningAnswers, morningMood, eveningMood, today, saveEntry, updateStreak, refreshEntries, toast]);

  const handleRefresh = useCallback(() => {
    refreshTodaysQuestions();
    toast({
      title: "Questions refreshed",
      description: "Your daily questions have been refreshed."
    });
  }, [refreshTodaysQuestions, toast]);

  // Memoize active question data
  const activeQuestionData = useMemo(() => {
    const activeQuestions = activeTab === "morning" ? sortedMorningQuestions : sortedEveningQuestions;
    const activeAnswers = activeTab === "morning" ? morningAnswers : eveningAnswers;
    const onAnswerChange = activeTab === "morning" ? handleMorningAnswerChange : handleEveningAnswerChange;
    
    return { activeQuestions, activeAnswers, onAnswerChange };
  }, [activeTab, sortedMorningQuestions, sortedEveningQuestions, morningAnswers, eveningAnswers, handleMorningAnswerChange, handleEveningAnswerChange]);

  // Single question view
  if (viewMode === 'single') {
    return (
      <SingleQuestionView
        questions={activeQuestionData.activeQuestions}
        answers={activeQuestionData.activeAnswers}
        onAnswerChange={activeQuestionData.onAnswerChange}
        type={activeTab as 'morning' | 'evening'}
        onSave={handleSaveAll}
        isSaving={isSaving}
        onBack={() => setViewMode('dashboard')}
        formattedDate={formattedDate}
      />
    );
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div className="space-y-4 px-4 pb-4 max-w-md mx-auto w-full">
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={() => setViewMode('dashboard')}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <h2 className="text-xl font-semibold text-navy-500">{formattedDate}</h2>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="text-teal-500 border-teal-300 hover:bg-teal-50"
          >
            Refresh
          </Button>
        </div>
        
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
  }

  // Dashboard view (default)
  return (
    <DashboardLayout
      formattedDate={formattedDate}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onViewModeChange={setViewMode}
      onRefresh={handleRefresh}
      morningMood={morningMood}
      eveningMood={eveningMood}
      onMorningMoodChange={setMorningMood}
      onEveningMoodChange={setEveningMood}
    />
  );
});

export default DailyQuestions;
