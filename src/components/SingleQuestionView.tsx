
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Save, Check, ArrowLeft } from "lucide-react";
import { Question } from "../context/QuestionsContext";

interface SingleQuestionViewProps {
  questions: Question[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, answer: string) => void;
  type: 'morning' | 'evening';
  onSave: () => Promise<void>;
  isSaving: boolean;
  onBack: () => void;
  formattedDate: string;
}

const SingleQuestionView: React.FC<SingleQuestionViewProps> = ({
  questions,
  answers,
  onAnswerChange,
  type,
  onSave,
  isSaving,
  onBack,
  formattedDate
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

  const handleFinish = async () => {
    await saveCurrentAnswer();
    onBack();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (isLastQuestion) {
        handleFinish();
      } else {
        goToNext();
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">No questions available</h2>
            <p className="text-gray-600 mb-4">Please check your question settings.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 font-medium shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-navy-500">{formattedDate}</h2>
              <p className="text-sm text-gray-600 capitalize">{type} Reflection</p>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              {lastSavedIndex === currentIndex && !hasUnsavedChanges && (
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-gray-500">
                {Math.round(((currentIndex + 1) / questions.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        {/* Question Content */}
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold text-gray-800 leading-relaxed flex-1">
                {currentQuestion.text}
              </h3>
              {currentQuestion.isTopFive && (
                <Badge variant="outline" className="bg-teal-100 hover:bg-teal-100 text-teal-700 border-teal-200 font-normal text-xs rounded-full px-3 py-1 ml-4 flex-shrink-0">
                  Top 5
                </Badge>
              )}
            </div>

            {/* Answer */}
            <div className="space-y-2">
              <Textarea
                value={localAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here..."
                className="min-h-[160px] text-base focus:border-teal-400 focus:ring-teal-400 bg-white resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Press Cmd/Ctrl + Enter to save and {isLastQuestion ? 'finish' : 'continue'}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
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
              onClick={isLastQuestion ? handleFinish : goToNext}
              disabled={isSaving}
              className="bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2"
            >
              {isLastQuestion ? 'Finish' : 'Next'}
              {!isLastQuestion && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SingleQuestionView;
