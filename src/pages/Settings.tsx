
import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash } from "lucide-react";
import Header from "@/components/Header";
import { useQuestions, Question } from "../context/QuestionsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Settings = () => {
  const { questions, updateQuestion, addQuestion, removeQuestion } = useQuestions();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionMandatory, setNewQuestionMandatory] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleQuestionToggle = (id: string, isActive: boolean) => {
    updateQuestion(id, { isActive });
  };
  
  const handleMandatoryToggle = (id: string, isMandatory: boolean) => {
    updateQuestion(id, { isMandatory });
  };
  
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Empty question",
        description: "Question text cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addQuestion({
      text: newQuestion.trim(),
      isMandatory: newQuestionMandatory,
      isActive: true,
    });
    
    setNewQuestion("");
    setNewQuestionMandatory(false);
    setDialogOpen(false);
    
    toast({
      title: "Question added",
      description: "New question added successfully",
    });
  };
  
  const handleRemoveQuestion = (id: string) => {
    removeQuestion(id);
    
    toast({
      title: "Question removed",
      description: "Question removed successfully",
    });
  };

  const mandatoryCount = questions.filter(q => q.isMandatory && q.isActive).length;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-navy-500 mb-2">Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure your reflection questions and preferences.
        </p>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Your Questions</h2>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-teal-400 hover:bg-teal-500">
                  <Plus className="mr-1 h-4 w-4" />
                  Add Question
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Question</DialogTitle>
                  <DialogDescription>
                    Create a new reflection question to include in your daily prompts.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="question-text">
                      Question Text
                    </label>
                    <Input 
                      id="question-text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="e.g., What am I grateful for today?"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="mandatory" 
                      checked={newQuestionMandatory}
                      onCheckedChange={(checked) => setNewQuestionMandatory(!!checked)}
                    />
                    <label 
                      htmlFor="mandatory"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Make this a mandatory question
                    </label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddQuestion} className="bg-teal-400 hover:bg-teal-500">
                    Add Question
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            You have {mandatoryCount} mandatory questions that will appear daily.
            The remaining questions will rotate, with 2 showing each day.
          </div>
          
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 pr-4">{question.text}</p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(question.id)}
                    className="text-gray-400 hover:text-red-500 p-1 h-auto"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mandatory-${question.id}`}
                      checked={question.isMandatory}
                      onCheckedChange={(checked) => 
                        handleMandatoryToggle(question.id, !!checked)
                      }
                    />
                    <label 
                      htmlFor={`mandatory-${question.id}`}
                      className="text-sm text-gray-600"
                    >
                      Required
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
                      onCheckedChange={(checked) => 
                        handleQuestionToggle(question.id, checked)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
