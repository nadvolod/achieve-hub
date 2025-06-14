
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Question, QuestionType } from "@/context/QuestionsContext";

interface AddEditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Omit<Question, "id" | "position">) => void;
  questionType: QuestionType;
  editingQuestion: Question | null;
}

const AddEditQuestionDialog: React.FC<AddEditQuestionDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  questionType,
  editingQuestion
}) => {
  const [questionText, setQuestionText] = useState("");
  const [isTopFive, setIsTopFive] = useState(false);
  
  // Reset form state when dialog opens with new editing data
  useEffect(() => {
    if (open) {
      if (editingQuestion) {
        setQuestionText(editingQuestion.text);
        setIsTopFive(editingQuestion.isTopFive);
      } else {
        setQuestionText("");
        setIsTopFive(false);
      }
    }
  }, [open, editingQuestion]);
  
  const handleSave = () => {
    const trimmedText = questionText.trim();
    if (!trimmedText) return;
    
    onSave({
      text: trimmedText,
      type: questionType,
      isActive: true,
      isTopFive: isTopFive
    });
    
    onOpenChange(false);
  };
  
  const title = editingQuestion 
    ? `Edit ${questionType === "morning" ? "Morning" : "Evening"} Question` 
    : `Add New ${questionType === "morning" ? "Morning" : "Evening"} Question`;
    
  const description = editingQuestion 
    ? `Edit your ${questionType} reflection question.` 
    : `Create a new ${questionType} reflection question.`;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="question-text">
              Question Text
            </label>
            <Input 
              id="question-text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={`e.g., ${questionType === "morning" ? "What am I grateful for today?" : "What did I accomplish today?"}`}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="topfive" 
              checked={isTopFive}
              onCheckedChange={(checked) => setIsTopFive(!!checked)}
            />
            <label 
              htmlFor="topfive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this a Top 5 question
            </label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-teal-400 hover:bg-teal-500">
            {editingQuestion ? "Save Changes" : "Add Question"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditQuestionDialog;
