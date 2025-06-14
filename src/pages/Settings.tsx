import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Sun, Moon } from "lucide-react";
import Header from "@/components/Header";
import { useQuestions, Question } from "../context/QuestionsContext";
import EmailReminderForm from "@/components/EmailReminderForm";
import QuestionsList from "@/components/settings/QuestionsList";
import AddEditQuestionDialog from "@/components/settings/AddEditQuestionDialog";

const Settings = () => {
  const { 
    questions, 
    updateQuestion, 
    addQuestion, 
    removeQuestion, 
    reorderQuestions 
  } = useQuestions();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("morning");
  const [draggedItem, setDraggedItem] = useState<Question | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionType, setQuestionType] = useState<"morning" | "evening">("morning");
  
  // Filter questions by type and sort by position
  const morningQuestions = questions
    .filter(q => q.type === 'morning')
    .sort((a, b) => a.position - b.position);
    
  const eveningQuestions = questions
    .filter(q => q.type === 'evening')
    .sort((a, b) => a.position - b.position);
  
  const morningTopFiveCount = morningQuestions.filter(q => q.isTopFive && q.isActive).length;
  const eveningTopFiveCount = eveningQuestions.filter(q => q.isTopFive && q.isActive).length;
  
  const handleQuestionToggle = (id: string, isActive: boolean) => {
    updateQuestion(id, { isActive });
  };
  
  const handleTopFiveToggle = (id: string, isTopFive: boolean) => {
    updateQuestion(id, { isTopFive });
  };
  
  const handleOpenAddDialog = (type: "morning" | "evening") => {
    setQuestionType(type);
    setEditingQuestion(null);
    setDialogOpen(true);
  };
  
  const handleOpenEditDialog = (question: Question) => {
    setQuestionType(question.type);
    setEditingQuestion(question);
    setDialogOpen(true);
  };
  
  const handleSaveQuestion = async (questionData: Omit<Question, "id" | "position">) => {
    try {
      if (editingQuestion) {
        // Update existing question
        await updateQuestion(editingQuestion.id, {
          text: questionData.text,
          isActive: questionData.isActive,
          isTopFive: questionData.isTopFive
        });
        
        toast({
          title: "Question updated",
          description: "Your question has been updated successfully.",
        });
      } else {
        // Add new question
        await addQuestion({
          text: questionData.text,
          type: questionData.type,
          isActive: questionData.isActive,
          isTopFive: questionData.isTopFive,
        });
        
        toast({
          title: "Question added",
          description: "New question added successfully",
        });
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your question.",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveQuestion = (id: string) => {
    removeQuestion(id);
    
    toast({
      title: "Question removed",
      description: "Question removed successfully",
    });
  };
  
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
  
  const dragHandlers = {
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  };
  
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
            <QuestionsList
              title="Morning Questions"
              questionType="morning"
              questions={morningQuestions}
              mandatoryCount={morningTopFiveCount}
              draggedItem={draggedItem}
              dragOverIndex={dragOverIndex}
              onAddQuestion={handleOpenAddDialog}
              onMandatoryToggle={handleTopFiveToggle}
              onActiveToggle={handleQuestionToggle}
              onRemoveQuestion={handleRemoveQuestion}
              onEditQuestion={handleOpenEditDialog}
              dragHandlers={dragHandlers}
            />
          </TabsContent>
          
          <TabsContent value="evening" className="space-y-4">
            <QuestionsList
              title="Evening Questions"
              questionType="evening"
              questions={eveningQuestions}
              mandatoryCount={eveningTopFiveCount}
              draggedItem={draggedItem}
              dragOverIndex={dragOverIndex}
              onAddQuestion={handleOpenAddDialog}
              onMandatoryToggle={handleTopFiveToggle}
              onActiveToggle={handleQuestionToggle}
              onRemoveQuestion={handleRemoveQuestion}
              onEditQuestion={handleOpenEditDialog}
              dragHandlers={dragHandlers}
            />
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
      
      <AddEditQuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveQuestion}
        questionType={questionType}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default Settings;
