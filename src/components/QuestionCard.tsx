
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Question } from "../context/QuestionsContext";

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
  const [isEditing, setIsEditing] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalAnswer(answer);
  }, [answer]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setLocalAnswer(newAnswer);
    setIsEditing(true);
    
    // Debounce the callback to avoid excessive updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Ultra short debounce time for immediate responsiveness
    debounceTimerRef.current = setTimeout(() => {
      onAnswerChange(newAnswer);
      // Reset editing state after a short delay
      setTimeout(() => {
        setIsEditing(false);
      }, 100);
    }, 10); // Nearly instant response time
  };
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return (
    <Card className={`mb-4 transition-all duration-200 border-l-4 
      ${question.isMandatory ? 'border-l-teal-400' : 'border-l-navy-300'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <h3 className="text-md font-medium text-gray-800">{question.text}</h3>
        {question.isMandatory && (
          <Badge variant="outline" className="bg-teal-50 text-teal-600 border-teal-200">
            Required
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Textarea
          value={localAnswer}
          onChange={handleChange}
          placeholder="Your answer..."
          className={`min-h-[100px] focus:border-teal-400 focus:ring-teal-400 ${
            isEditing ? 'border-teal-300' : ''
          }`}
          disabled={readOnly}
          // Trigger onAnswerChange on blur to ensure the value is saved when tabbing away
          onBlur={() => {
            // Only trigger if there's an actual value to save
            if (localAnswer.trim() !== '') {
              onAnswerChange(localAnswer);
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
