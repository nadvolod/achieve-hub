
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Question } from "../context/QuestionsContext";
import { useAutoSave } from "../hooks/useAutoSave";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  answer: string;
  onAnswerChange: (answer: string) => void;
  readOnly?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  answer, 
  onAnswerChange,
  readOnly = false
}) => {
  const [localAnswer, setLocalAnswer] = useState(answer);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalAnswer(answer);
  }, [answer]);

  const { debouncedAutoSave } = useAutoSave({
    questionId: question.id,
    questionText: question.text,
    type: question.type,
    onSaveSuccess: () => {
      setAutoSaveStatus('saved');
      // Reset to idle after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    },
    onSaveError: () => {
      setAutoSaveStatus('error');
      // Reset to idle after 3 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
    
    // Don't auto-save in read-only mode
    if (!readOnly) {
      setAutoSaveStatus('saving');
      debouncedAutoSave(newAnswer);
    }
  };

  const getStatusIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <span className="animate-spin text-gray-400 text-xs">⟳</span>;
      case 'saved':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };
  
  return (
    <Card className={`mb-4 transition-all duration-200 border-l-4 
      ${question.isMandatory ? 'border-l-teal-400' : 'border-l-navy-300'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">{question.text}</h3>
        <div className="flex items-center gap-2">
          {question.isMandatory && (
            <Badge variant="outline" className="bg-teal-100 hover:bg-teal-100 text-teal-700 border-teal-200 font-normal text-xs rounded-full px-3 py-1">
              Required
            </Badge>
          )}
          {!readOnly && autoSaveStatus !== 'idle' && (
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs text-gray-500">{getStatusText()}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Textarea
          value={localAnswer}
          onChange={handleChange}
          placeholder="Your answer..."
          className="min-h-[100px] focus:border-teal-400 focus:ring-teal-400 bg-white dark:bg-navy-700 dark:text-gray-100"
          disabled={readOnly}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
