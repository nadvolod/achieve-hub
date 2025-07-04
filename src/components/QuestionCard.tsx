
import React, { useState, useEffect } from "react";
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
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalAnswer(answer);
  }, [answer]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setLocalAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };
  
  return (
    <Card className={`mb-4 transition-all duration-200 border-l-4 
      ${question.isTopFive ? 'border-l-teal-400' : 'border-l-navy-300'}`}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">{question.text}</h3>
        {question.isTopFive && (
          <Badge variant="outline" className="bg-teal-100 hover:bg-teal-100 text-teal-700 border-teal-200 font-normal text-xs rounded-full px-3 py-1">
            Top 5
          </Badge>
        )}
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
