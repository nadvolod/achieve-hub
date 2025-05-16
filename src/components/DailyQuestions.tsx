
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon } from "lucide-react";
import QuestionCard from "./QuestionCard";
import { useQuestions } from "../context/QuestionsContext";
import { formatDate, getTodayDateString } from "../utils/questionsUtils";

const DailyQuestions: React.FC = () => {
  const { todaysMorningQuestions, todaysEveningQuestions, saveEntry, getEntries, refreshTodaysQuestions } = useQuestions();
  const { toast } = useToast();
  const [morningAnswers, setMorningAnswers] = useState<Record<string, string>>({});
  const [eveningAnswers, setEveningAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("morning");
  
  const today = getTodayDateString();
  const formattedDate = formatDate(today);
  
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
    setActiveTab(currentHour < 12 ? "morning" : "evening");
    
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
      
      saveEntry({
        date: new Date().toISOString(),
        type: 'morning',
        answers: entryAnswers
      });
      
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
      
      saveEntry({
        date: new Date().toISOString(),
        type: 'evening',
        answers: entryAnswers
      });
      
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
  
  return (
    <div className="mt-4">
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
          {todaysMorningQuestions.map(question => (
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
          {todaysEveningQuestions.map(question => (
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
    </div>
  );
};

export default DailyQuestions;
