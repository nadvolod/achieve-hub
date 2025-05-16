
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import QuestionCard from "./QuestionCard";
import { useQuestions } from "../context/QuestionsContext";
import { formatDate, getTodayDateString } from "../utils/questionsUtils";

const DailyQuestions: React.FC = () => {
  const { todaysQuestions, saveEntry, getEntry, refreshTodaysQuestions } = useQuestions();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  
  const today = getTodayDateString();
  const formattedDate = formatDate(today);
  
  // Load any existing entry for today
  useEffect(() => {
    const existingEntry = getEntry(today);
    
    if (existingEntry) {
      const loadedAnswers: Record<string, string> = {};
      existingEntry.answers.forEach(answer => {
        loadedAnswers[answer.questionId] = answer.answer;
      });
      setAnswers(loadedAnswers);
    } else {
      // Initialize empty answers for all questions
      const initialAnswers: Record<string, string> = {};
      todaysQuestions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
    }
  }, [todaysQuestions, getEntry, today]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleSave = async () => {
    // Validate mandatory questions are answered
    const mandatoryQuestions = todaysQuestions.filter(q => q.isMandatory);
    const unansweredMandatory = mandatoryQuestions.filter(q => !answers[q.id]?.trim());
    
    if (unansweredMandatory.length > 0) {
      toast({
        title: "Missing required answers",
        description: "Please answer all required questions before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      const entryAnswers = todaysQuestions.map(question => ({
        questionId: question.id,
        questionText: question.text,
        answer: answers[question.id] || ''
      }));
      
      saveEntry({
        date: new Date().toISOString(),
        answers: entryAnswers
      });
      
      toast({
        title: "Entry saved",
        description: "Your reflections have been saved successfully."
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
      
      {todaysQuestions.map(question => (
        <QuestionCard
          key={question.id}
          question={question}
          answer={answers[question.id] || ''}
          onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
        />
      ))}
      
      <div className="flex justify-end mt-6 mb-16">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-teal-400 hover:bg-teal-500 text-white"
        >
          {isSaving ? "Saving..." : "Save Today's Reflections"}
        </Button>
      </div>
    </div>
  );
};

export default DailyQuestions;
