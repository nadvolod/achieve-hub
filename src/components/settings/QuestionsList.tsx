
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Question } from "@/context/QuestionsContext";
import QuestionItem from "./QuestionItem";

interface QuestionsListProps {
  title: string;
  questionType: "morning" | "evening";
  questions: Question[];
  mandatoryCount: number;
  draggedItem: Question | null;
  dragOverIndex: number | null;
  onAddQuestion: (type: "morning" | "evening") => void;
  onMandatoryToggle: (id: string, isMandatory: boolean) => void;
  onActiveToggle: (id: string, isActive: boolean) => void;
  onRemoveQuestion: (id: string) => void;
  onEditQuestion: (question: Question) => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent<HTMLDivElement>, question: Question) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, targetIndex: number, targetQuestion: Question) => void;
  };
}

const QuestionsList: React.FC<QuestionsListProps> = ({
  title,
  questionType,
  questions,
  mandatoryCount,
  draggedItem,
  dragOverIndex,
  onAddQuestion,
  onMandatoryToggle,
  onActiveToggle,
  onRemoveQuestion,
  onEditQuestion,
  dragHandlers
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">{title}</h2>
        
        <Button 
          size="sm" 
          className="bg-teal-400 hover:bg-teal-500"
          onClick={() => onAddQuestion(questionType)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Question
        </Button>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        You have {mandatoryCount} mandatory {questionType} questions
        {questionType === "morning" ? " that will appear daily. The remaining morning questions will rotate, with 2 showing each day." : ". All active evening questions will be shown every day."}
        <p className="mt-1 text-xs text-teal-600">Drag and drop questions to reorder them.</p>
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionItem
            key={question.id}
            question={question}
            index={index}
            onMandatoryToggle={onMandatoryToggle}
            onActiveToggle={onActiveToggle}
            onRemove={onRemoveQuestion}
            onEdit={onEditQuestion}
            dragHandlers={dragHandlers}
            isDragged={draggedItem?.id === question.id}
            isDragOver={dragOverIndex === index}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;
