import React, { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash, Sun, Moon, GripVertical } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import EmailReminderForm from "@/components/EmailReminderForm";

const Settings = () => {
  const { questions, updateQuestion, addQuestion, removeQuestion, reorderQuestions } = useQuestions();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionMandatory, setNewQuestionMandatory] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<"morning" | "evening">("morning");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("morning");
  const [draggedItem, setDraggedItem] = useState<Question | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
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
      type: newQuestionType,
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

  // Filter questions by type and sort by position
  const morningQuestions = questions
    .filter(q => q.type === 'morning')
    .sort((a, b) => a.position - b.position);
    
  const eveningQuestions = questions
    .filter(q => q.type === 'evening')
    .sort((a, b) => a.position - b.position);
  
  const morningMandatoryCount = morningQuestions.filter(q => q.isMandatory && q.isActive).length;
  const eveningMandatoryCount = eveningQuestions.filter(q => q.isMandatory && q.isActive).length;
  
  // Fixed drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, question: Question) => {
    console.log("Drag start:", question.id);
    setDraggedItem(question);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', question.id);
    
    // Add visual feedback
    e.currentTarget.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log("Drag end");
    setDraggedItem(null);
    setDragOverIndex(null);
    e.currentTarget.style.opacity = '1';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear dragOverIndex if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number, targetQuestion: Question) => {
    e.preventDefault();
    console.log("Drop on:", targetQuestion.id, "at index:", targetIndex);
    
    if (!draggedItem || draggedItem.id === targetQuestion.id) {
      setDragOverIndex(null);
      return;
    }
    
    // Make sure we're only reordering within the same type
    if (draggedItem.type !== targetQuestion.type) {
      setDragOverIndex(null);
      return;
    }
    
    const type = draggedItem.type;
    const filteredQuestions = type === 'morning' ? morningQuestions : eveningQuestions;
    
    // Find the current index of the dragged item
    const draggedIndex = filteredQuestions.findIndex(q => q.id === draggedItem.id);
    
    // Create a new array with the updated order
    const reorderedQuestions = [...filteredQuestions];
    
    // Remove the dragged item from its current position
    const [removed] = reorderedQuestions.splice(draggedIndex, 1);
    
    // Insert it at the new position
    reorderedQuestions.splice(targetIndex, 0, removed);
    
    // Extract the new order of IDs
    const reorderedIds = reorderedQuestions.map(q => q.id);
    
    console.log("New order:", reorderedIds);
    
    // Update the database with the new order
    reorderQuestions(reorderedIds, type);
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };
  
  // Using successful status notifications instead of disruptive toasts for smaller operations
  const handleStatusNotification = (message: string) => {
    // Instead of using a toast for every small interaction, just update a status message
    // This could be implemented with a small notification that auto-dismisses
    console.log("Status update:", message);
    
    // For now we'll keep the toast but make it less disruptive
    toast({
      title: "Success",
      description: message,
      duration: 2000, // Shorter duration
    });
  };

  const renderQuestionList = (questionsList: Question[], type: "morning" | "evening") => (
    <div className="space-y-4">
      {questionsList.map((question, index) => (
        <div 
          key={question.id} 
          className={`border-b pb-3 last:border-0 last:pb-0 transition-all duration-200 ${
            draggedItem?.id === question.id ? 'opacity-50 scale-95' : ''
          } ${
            dragOverIndex === index ? 'border-t-2 border-t-teal-400' : ''
          } cursor-move hover:bg-gray-50 rounded-lg p-2`}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, question)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index, question)}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <div className="mt-1 cursor-move hover:text-teal-500 transition-colors">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-gray-800 pr-4">{question.text}</p>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveQuestion(question.id)}
              className="text-gray-400 hover:text-red-500 p-1 h-auto"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 ml-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`mandatory-${question.id}`}
                checked={question.isMandatory}
                onCheckedChange={(checked) => {
                  handleMandatoryToggle(question.id, !!checked);
                  handleStatusNotification(`Question requirement ${checked ? 'enabled' : 'disabled'}`);
                }}
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
                onCheckedChange={(checked) => {
                  handleQuestionToggle(question.id, checked);
                  handleStatusNotification(`Question ${checked ? 'activated' : 'deactivated'}`);
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20 px-4 pb-4 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-navy-500 mb-2">Settings</h1>
        <p className="text-gray-600 mb-6">
          Configure your reflection questions and preferences.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="morning" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Morning Questions</span>
            </TabsTrigger>
            <TabsTrigger value="evening" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Evening Questions</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="morning" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Morning Questions</h2>
                
                <Dialog open={dialogOpen && activeTab === "morning"} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setNewQuestionType("morning");
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-400 hover:bg-teal-500">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Morning Question</DialogTitle>
                      <DialogDescription>
                        Create a new morning reflection question.
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
                You have {morningMandatoryCount} mandatory morning questions that will appear daily.
                The remaining morning questions will rotate, with 2 showing each day.
                <p className="mt-1 text-xs text-teal-600">Drag and drop questions to reorder them.</p>
              </div>
              
              {renderQuestionList(morningQuestions, "morning")}
            </div>
          </TabsContent>
          
          <TabsContent value="evening" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Evening Questions</h2>
                
                <Dialog open={dialogOpen && activeTab === "evening"} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (open) setNewQuestionType("evening");
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-400 hover:bg-teal-500">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Question
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Evening Question</DialogTitle>
                      <DialogDescription>
                        Create a new evening reflection question.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="question-text-evening">
                          Question Text
                        </label>
                        <Input 
                          id="question-text-evening"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="e.g., What did I accomplish today?"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mandatory-evening" 
                          checked={newQuestionMandatory}
                          onCheckedChange={(checked) => setNewQuestionMandatory(!!checked)}
                        />
                        <label 
                          htmlFor="mandatory-evening"
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
                You have {eveningMandatoryCount} mandatory evening questions.
                All active evening questions will be shown every day.
                <p className="mt-1 text-xs text-teal-600">Drag and drop questions to reorder them.</p>
              </div>
              
              {renderQuestionList(eveningQuestions, "evening")}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-xl font-medium mb-4">Email Reminders</h2>
          <p className="text-sm text-gray-500 mb-4">
            Set up email reminders to help you remember to complete your daily reflections.
          </p>
          
          <EmailReminderForm />
        </div>
      </main>
    </div>
  );
};

export default Settings;
