import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Type definitions
export type QuestionType = 'morning' | 'evening';

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  isActive: boolean;
  isMandatory: boolean;
  position: number;
};

export type Answer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export type Entry = {
  id: string;
  date: string;
  type: QuestionType;
  answers: Answer[];
};

export type QuestionsContextType = {
  questions: Question[];
  entries: Entry[];
  isLoading: boolean;
  addQuestion: (question: Omit<Question, 'id' | 'position'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Omit<Question, 'id' | 'position'>>) => Promise<void>;
  toggleQuestionActive: (id: string) => Promise<void>;
  removeQuestion: (id: string) => Promise<void>;
  reorderQuestions: (questionIds: string[], type: QuestionType) => Promise<void>;
  saveEntry: (entry: Omit<Entry, 'id'>) => Promise<void>;
  todaysMorningQuestions: Question[];
  todaysEveningQuestions: Question[];
  getEntries: (date: string) => Entry[];
  refreshTodaysQuestions: () => void;
};

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

const dummyQuestions: Question[] = [
  // Morning questions
  {
    id: "1",
    text: "How did you sleep?",
    type: 'morning',
    isActive: true,
    isMandatory: true,
    position: 1
  },
  {
    id: "2",
    text: "What are you grateful for today?",
    type: 'morning',
    isActive: true,
    isMandatory: false,
    position: 2
  },
  {
    id: "3",
    text: "What would make today great?",
    type: 'morning',
    isActive: true,
    isMandatory: false,
    position: 3
  },
  // Evening questions
  {
    id: "4",
    text: "What did you accomplish today?",
    type: 'evening',
    isActive: true,
    isMandatory: true,
    position: 1
  },
  {
    id: "5",
    text: "What could you have done better today?",
    type: 'evening',
    isActive: true,
    isMandatory: false,
    position: 2
  },
];

const dummyEntries: Entry[] = [
  {
    id: uuidv4(),
    date: '2024-01-01',
    type: 'morning',
    answers: [
      { questionId: '1', questionText: 'How did you sleep?', answer: 'Great!' },
      { questionId: '2', questionText: 'What are you grateful for today?', answer: 'My family' },
      { questionId: '3', questionText: 'What would make today great?', answer: 'A good workout' },
    ],
  },
  {
    id: uuidv4(),
    date: '2024-01-01',
    type: 'evening',
    answers: [
      { questionId: '4', questionText: 'What did you accomplish today?', answer: 'Finished my work' },
      { questionId: '5', questionText: 'What could you have done better today?', answer: 'Spent less time on social media' },
    ],
  },
];

export const QuestionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysMorningQuestions, setTodaysMorningQuestions] = useState<Question[]>([]);
  const [todaysEveningQuestions, setTodaysEveningQuestions] = useState<Question[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('user_questions')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;

      const formattedQuestions: Question[] = data.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type as QuestionType,
        isActive: q.is_active,
        isMandatory: q.is_mandatory,
        position: q.position
      }));

      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Failed to load your questions",
        variant: "destructive",
      });
    }
  };

  const fetchEntries = async () => {
    try {
      if (!user) return;

      // Fetch entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('user_entries')
        .select('*');

      if (entriesError) throw entriesError;

      // Fetch answers for all entries
      const entryIds = entriesData.map(entry => entry.id);
      
      if (entryIds.length === 0) {
        setEntries([]);
        return;
      }

      const { data: answersData, error: answersError } = await supabase
        .from('entry_answers')
        .select('*')
        .in('entry_id', entryIds);

      if (answersError) throw answersError;

      // Map and combine the data
      const formattedEntries: Entry[] = entriesData.map(entry => {
        const entryAnswers = answersData.filter(answer => answer.entry_id === entry.id);
        
        return {
          id: entry.id,
          date: entry.date,
          type: entry.type as QuestionType,
          answers: entryAnswers.map(a => ({
            questionId: a.question_id,
            questionText: a.question_text,
            answer: a.answer
          }))
        };
      });

      setEntries(formattedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      toast({
        title: "Error",
        description: "Failed to load your entries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTodaysQuestions = () => {
    const morningQuestions = questions
      .filter(q => q.type === 'morning' && q.isActive)
      .sort((a, b) => a.position - b.position);
    
    const eveningQuestions = questions
      .filter(q => q.type === 'evening' && q.isActive)
      .sort((a, b) => a.position - b.position);
    
    setTodaysMorningQuestions(morningQuestions);
    setTodaysEveningQuestions(eveningQuestions);
  };

  const refreshTodaysQuestions = () => {
    updateTodaysQuestions();
  };

  const getEntries = (date: string): Entry[] => {
    return entries.filter(entry => entry.date.startsWith(date));
  };

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchEntries();
    } else {
      setQuestions([]);
      setEntries([]);
    }
  }, [user]);

  useEffect(() => {
    updateTodaysQuestions();
  }, [questions]);

  const addQuestion = async (question: Omit<Question, 'id' | 'position'>) => {
    if (!user) return;

    try {
      // Get current highest position for the question type
      const maxPosition = Math.max(
        ...questions
          .filter(q => q.type === question.type)
          .map(q => q.position),
        0
      );

      // Insert into Supabase
      const { data, error } = await supabase
        .from('user_questions')
        .insert([{
          user_id: user.id,
          text: question.text,
          type: question.type,
          is_active: question.isActive,
          is_mandatory: question.isMandatory,
          position: maxPosition + 1
        }])
        .select();

      if (error) throw error;
      
      // Add to local state
      if (data && data[0]) {
        const newQuestion: Question = {
          id: data[0].id,
          text: data[0].text,
          type: data[0].type as QuestionType,
          isActive: data[0].is_active,
          isMandatory: data[0].is_mandatory,
          position: data[0].position
        };
        
        setQuestions(prev => [...prev, newQuestion]);
        
        toast({
          title: "Success",
          description: "Question added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Omit<Question, 'id' | 'position'>>) => {
    if (!user) return;

    try {
      // Prepare updates in Supabase format
      const supabaseUpdates: any = {};
      if (updates.text !== undefined) supabaseUpdates.text = updates.text;
      if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;
      if (updates.isMandatory !== undefined) supabaseUpdates.is_mandatory = updates.isMandatory;
      
      // No position updates allowed here, use reorderQuestions for that
      
      // Update in Supabase
      const { error } = await supabase
        .from('user_questions')
        .update(supabaseUpdates)
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setQuestions(prev => 
        prev.map(q => q.id === id ? { ...q, ...updates } : q)
      );
      
      toast({
        title: "Success",
        description: "Question updated successfully",
      });
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };
  
  const toggleQuestionActive = async (id: string) => {
    const question = questions.find(q => q.id === id);
    if (!question || !user) return;
    
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('user_questions')
        .update({ is_active: !question.isActive })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setQuestions(prev => 
        prev.map(q => q.id === id ? { ...q, isActive: !q.isActive } : q)
      );
      
      toast({
        title: "Success",
        description: `Question ${question.isActive ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      console.error("Error toggling question active state:", error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const removeQuestion = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('user_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setQuestions(prev => prev.filter(q => q.id !== id));
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error removing question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const reorderQuestions = async (questionIds: string[], type: QuestionType) => {
    if (!user) return;
    
    try {
      // Update positions in local state first
      const updatedQuestions = [...questions];
      
      questionIds.forEach((id, index) => {
        const questionIndex = updatedQuestions.findIndex(q => q.id === id);
        if (questionIndex !== -1) {
          updatedQuestions[questionIndex].position = index + 1;
        }
      });
      
      setQuestions(updatedQuestions);
      
      // Create an array of updates for Supabase
      const updates = questionIds.map((id, index) => ({
        id,
        position: index + 1
      }));
      
      // Perform batch update in Supabase
      for (const update of updates) {
        const { error } = await supabase
          .from('user_questions')
          .update({ position: update.position })
          .eq('id', update.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Questions reordered successfully",
      });
    } catch (error) {
      console.error("Error reordering questions:", error);
      toast({
        title: "Error",
        description: "Failed to reorder questions",
        variant: "destructive",
      });
      // Refresh questions to restore original order
      fetchQuestions();
    }
  };

  const saveEntry = async (entry: Omit<Entry, 'id'>) => {
    if (!user) return;
    
    try {
      // Get existing entries for this date and type
      const { data: existingEntries, error: fetchError } = await supabase
        .from('user_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', entry.date.split('T')[0]) // Ensure we're using just the date part
        .eq('type', entry.type);
      
      if (fetchError) throw fetchError;
      
      // Get the existing entry ID if it exists
      let existingEntryId: string | null = null;
      
      if (existingEntries && existingEntries.length > 0) {
        existingEntryId = existingEntries[0].id;
        
        // Get the existing answers for this entry
        const { data: existingAnswers, error: existingAnswersError } = await supabase
          .from('entry_answers')
          .select('*')
          .eq('entry_id', existingEntryId);
          
        if (existingAnswersError) throw existingAnswersError;

        // Create a map of existing answers by question ID
        const existingAnswersMap: Record<string, any> = {};
        if (existingAnswers) {
          existingAnswers.forEach(answer => {
            existingAnswersMap[answer.question_id] = answer;
          });
        }

        // Update each answer one by one instead of deleting and re-creating
        for (const answer of entry.answers) {
          if (existingAnswersMap[answer.questionId]) {
            // Update existing answer
            const { error: updateError } = await supabase
              .from('entry_answers')
              .update({
                answer: answer.answer,
                // Keep the question_text as it was or update if changed
                question_text: answer.questionText
              })
              .eq('id', existingAnswersMap[answer.questionId].id);
              
            if (updateError) throw updateError;
            
            // Remove from map to track which ones we've processed
            delete existingAnswersMap[answer.questionId];
          } else {
            // Insert new answer
            const { error: insertError } = await supabase
              .from('entry_answers')
              .insert({
                entry_id: existingEntryId,
                question_id: answer.questionId,
                question_text: answer.questionText,
                answer: answer.answer
              });
              
            if (insertError) throw insertError;
          }
        }

        // Now handle any answers for questions that might have been removed
        // We'll keep them as they are to preserve the user's data
      } else {
        // Create new entry since none exists
        const { data: entryData, error: entryError } = await supabase
          .from('user_entries')
          .insert({
            user_id: user.id,
            date: entry.date.split('T')[0], // Ensure we're using just the date part
            type: entry.type
          })
          .select();
        
        if (entryError) throw entryError;
        
        // Then save each answer
        if (entryData && entryData[0]) {
          existingEntryId = entryData[0].id;
          
          // Prepare answers for insertion
          const answersToInsert = entry.answers.map(answer => ({
            entry_id: existingEntryId,
            question_id: answer.questionId,
            question_text: answer.questionText,
            answer: answer.answer
          }));
          
          // Only insert if we have answers
          if (answersToInsert.length > 0) {
            const { error: answersError } = await supabase
              .from('entry_answers')
              .insert(answersToInsert);
            
            if (answersError) throw answersError;
          }
        }
      }
      
      // Update entries in local state to reflect changes
      // We need to fetch the complete updated entry
      if (existingEntryId) {
        const { data: updatedAnswers, error: updatedAnswersError } = await supabase
          .from('entry_answers')
          .select('*')
          .eq('entry_id', existingEntryId);
          
        if (updatedAnswersError) throw updatedAnswersError;
        
        // Create the updated entry
        const updatedEntry: Entry = {
          id: existingEntryId,
          date: entry.date,
          type: entry.type,
          answers: updatedAnswers ? updatedAnswers.map(a => ({
            questionId: a.question_id,
            questionText: a.question_text,
            answer: a.answer
          })) : []
        };
        
        // Update local state
        setEntries(prev => {
          // Remove any existing entry for this date and type
          const filtered = prev.filter(e => 
            !(e.date.startsWith(entry.date.split('T')[0]) && e.type === entry.type)
          );
          // Add the updated entry
          return [...filtered, updatedEntry];
        });
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      toast({
        title: "Error",
        description: "Failed to save your responses",
        variant: "destructive",
      });
      throw error; // Re-throw to allow caller to handle
    }
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        entries,
        isLoading,
        addQuestion,
        updateQuestion,
        toggleQuestionActive,
        removeQuestion,
        reorderQuestions,
        saveEntry,
        todaysMorningQuestions,
        todaysEveningQuestions,
        getEntries,
        refreshTodaysQuestions,
      }}
    >
      {children}
    </QuestionsContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionsContext);
  if (context === undefined) {
    throw new Error("useQuestions must be used within a QuestionsProvider");
  }
  return context;
};
