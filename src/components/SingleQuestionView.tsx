
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Check } from "lucide-react";
import { Question } from "../context/QuestionsContext";
import MoodTracker from "./MoodTracker";

interface SingleQuestionViewProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  mood?: number;
  onMoodChange: (mood: number | undefined) => void;
  type: 'morning' | 'evening';
  onSave: () => Promise<void>;
  isSaving: boolean;
}

const SingleQuestionView: React.FC<SingleQuestionViewProps> = ({
  questions,
  answers,
  onAnswerChange,
  mood,
  onMoodChange,
  type,
  onSave,
  isSaving
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswer, setLocalAnswer] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedIndex, setLastSavedIndex] = useState(-1);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  // Update local answer when question changes
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = answers[currentQuestion.id] || '';
      setLocalAnswer(existingAnswer);
      setHasUnsavedChanges(false);
    }
  }, [currentQuestion, answers]);

  const handleAnswerChange = (value: string) => {
    setLocalAnswer(value);
    setHasUnsavedChanges(true);
    onAnswerChange(currentQuestion.id, value);
  };

  const saveCurrentAnswer = async () => {
    if (hasUnsavedChanges) {
      await onSave();
      setHasUnsavedChanges(false);
      setLastSavedIndex(currentIndex);
    }
  };

  const goToNext = async () => {
    await saveCurrentAnswer();
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = async () => {
    await saveCurrentAnswer();
    if (!isFirstQuestion) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      goToNext();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No questions available</h2>
          <p className="text-gray-600">Please check your question settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with progress */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {lastSavedIndex === currentIndex && !hasUnsavedChanges && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" />
                Saved
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Mood tracker for first question */}
          {currentIndex === 0 && (
            <div className="mb-6">
              <MoodTracker 
                mood={mood} 
                onMoodChange={onMoodChange} 
                type={type}
              />
            </div>
          )}

          {/* Question card */}
          <Card className={`transition-all duration-200 border-l-4 
            ${currentQuestion.isTopFive ? 'border-l-teal-400' : 'border-l-navy-300'}`}>
            <CardHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.text}
                </h2>
                {currentQuestion.isTopFive && (
                  <Badge variant="outline" className="bg-teal-100 hover:bg-teal-100 text-teal-700 border-teal-200 font-normal text-xs rounded-full px-3 py-1 ml-4 flex-shrink-0">
                    Top 5
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <Textarea
                value={localAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className="min-h-[120px] text-base focus:border-teal-400 focus:ring-teal-400 bg-white resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Press Cmd/Ctrl + Enter to save and continue
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Button
            onClick={goToPrevious}
            disabled={isFirstQuestion || isSaving}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={saveCurrentAnswer}
            disabled={!hasUnsavedChanges || isSaving}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>

          <Button
            onClick={goToNext}
            disabled={isSaving}
            className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
          >
            {isLastQuestion ? 'Finish' : 'Next'}
            {!isLastQuestion && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleQuestionView;
