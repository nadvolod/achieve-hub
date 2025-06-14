
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash, Pencil } from "lucide-react";
import { Question } from "@/context/QuestionsContext";

interface QuestionItemProps {
  question: Question;
  index: number;
  onMandatoryToggle: (id: string, isMandatory: boolean) => void;
  onActiveToggle: (id: string, isActive: boolean) => void;
  onRemove: (id: string) => void;
  onEdit: (question: Question) => void;
  dragHandlers: {
    onDragStart: (e: React.DragEvent<HTMLDivElement>, question: Question) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, targetIndex: number, targetQuestion: Question) => void;
  };
  isDragged: boolean;
  isDragOver: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ 
  question, 
  index,
  onMandatoryToggle, 
  onActiveToggle, 
  onRemove,
  onEdit,
  dragHandlers,
  isDragged,
  isDragOver
}) => {
  const handleStatusNotification = (message: string) => {
    console.log("Status update:", message);
  };
  
  return (
    <div 
      className={`border-b pb-3 last:border-0 last:pb-0 transition-all duration-200 ${
        isDragged ? 'opacity-50 scale-95' : ''
      } ${
        isDragOver ? 'border-t-2 border-t-teal-400' : ''
      } cursor-move hover:bg-gray-50 rounded-lg p-2`}
      draggable="true"
      onDragStart={(e) => dragHandlers.onDragStart(e, question)}
      onDragEnd={dragHandlers.onDragEnd}
      onDragOver={(e) => dragHandlers.onDragOver(e, index)}
      onDragLeave={dragHandlers.onDragLeave}
      onDrop={(e) => dragHandlers.onDrop(e, index, question)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-1 cursor-move hover:text-teal-500 transition-colors">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-gray-800 pr-4">{question.text}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(question)}
            className="text-gray-400 hover:text-teal-500 p-1 h-auto"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(question.id)}
            className="text-gray-400 hover:text-red-500 p-1 h-auto"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 ml-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`topfive-${question.id}`}
            checked={question.isTopFive}
            onCheckedChange={(checked) => {
              onMandatoryToggle(question.id, !!checked);
              handleStatusNotification(`Question Top 5 status ${checked ? 'enabled' : 'disabled'}`);
            }}
          />
          <label 
            htmlFor={`topfive-${question.id}`}
            className="text-sm text-gray-600"
          >
            Top 5
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <label 
            htmlFor={`active-${question.id}`}
            className="text-sm text-gray-600"
          >
            {question.isActive ? "Active" : "Inactive"}
          </label>
          <Switch 
            id={`active-${question.id}`}
            checked={question.isActive}
            onCheckedChange={(checked) => {
              onActiveToggle(question.id, checked);
              handleStatusNotification(`Question ${checked ? 'activated' : 'deactivated'}`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;
