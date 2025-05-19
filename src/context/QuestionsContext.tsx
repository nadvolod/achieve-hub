import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

export type Question = {
  id: string;
  text: string;
  isMandatory: boolean;
  isActive: boolean;
  position: number;
  type: 'morning' | 'evening';
};

export type Answer = {
  questionId: string;
  questionText: string;
  answer: string;
};

export type Entry = {
  id: string;
  date: string;
  type: 'morning' | 'evening';
  answers: Answer[];
};

type QuestionsContextType = {
  questions: Question[];
  entries: Entry[];
  isLoading: boolean;
  fetchQuestions: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id' | 'position'>) => Promise<void>;
  updateQuestion: (id: string, updates: Partial<Omit<Question, 'id'>>) => Promise<void>;
  removeQuestion: (id: string) => Promise<void>;
  reorderQuestions: (questionIds: string[], type: 'morning' | 'evening') => Promise<void>;
  saveEntry: (entry: Omit<Entry, 'id'>) => Promise<void>;
  todaysMorningQuestions: Question[];
  todaysEveningQuestions: Question[];
  getEntries: (date: string) => Entry[];
  refreshTodaysQuestions: () => void;
};

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

const defaultMorningQuestions: Omit<Question, 'id' | 'position'>[] = [
  { text: "How can I give even more fully consistently?", isMandatory: true, isActive: true, type: 'morning' },
  { text: "Who do I need to be to be able to go at 95% 6 days of the week?", isMandatory: true, isActive: true, type: 'morning' },
  { text: "Am I happy?", isMandatory: true, isActive: true, type: 'morning' },
  { text: "Am I having fun?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "How can I live with even more courage and determination?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "Did I live with level 10 energy? Who must I become to live with level 10 energy 6/7 days?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "Was I my best yesterday (1-10)?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "How can I love even more (3 human needs)?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "How do I serve even more?", isMandatory: false, isActive: true, type: 'morning' },
  { text: "How can I grow even more?", isMandatory: false, isActive: true, type: 'morning' },
];

const defaultEveningQuestions: Omit<Question, 'id' | 'position'>[] = [
  { text: "What did I accomplish today?", isMandatory: true, isActive: true, type: 'evening' },
  { text: "Did I complete all my planned activities? Why?", isMandatory: true, isActive: true, type: 'evening' },
  { text: "What should I focus on tomorrow?", isMandatory: true, isActive: true, type: 'evening' },
  { text: "What should I do tomorrow to make it a better day?", isMandatory: false, isActive: true, type: 'evening' },
  { text: "How did I do with my emotions? What was the moment that made me unconscious?", isMandatory: false, isActive: true, type: 'evening' },
  { text: "What fun did I have today?", isMandatory: false, isActive: true, type: 'evening' },
  { text: "Who should I spend more time with and why?", isMandatory: false, isActive: true, type: 'evening' },
  { text: "What would I do differently if I could live my day over?", isMandatory: false, isActive: true, type: 'evening' },
];

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todaysMorningQuestions, setTodaysMorningQuestions] = useState<Question[]>([]);
  const [todaysEveningQuestions, setTodaysEveningQuestions] = useState<Question[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchQuestions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_questions')
        .select('*')
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      if (data) {
        const formattedQuestions: Question[] = data.map(q => ({
          id: q.id,
          text: q.text,
          isMandatory: q.is_mandatory,
          isActive: q.is_active,
          position: q.position,
          type: q.type as 'morning' | 'evening'
        }));
        
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Failed to load questions",
        description: "There was an error loading your questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // First get all entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('user_entries')
        .select('*')
        .order('date', { ascending: false });
        
      if (entriesError) throw entriesError;
      
      if (entriesData) {
        // Then get all answers for those entries
        const { data: answersData, error: answersError } = await supabase
          .from('entry_answers')
          .select('*')
          .in('entry_id', entriesData.map(e => e.id));
          
        if (answersError) throw answersError;
        
        // Format and combine data
        const formattedEntries: Entry[] = entriesData.map(entry => {
          const entryAnswers = answersData?.filter(a => a.entry_id === entry.id) || [];
          
          return {
            id: entry.id,
            date: entry.date,
            type: entry.type as 'morning' | 'evening',
            answers: entryAnswers.map(a => ({
              questionId: a.question_id,
              questionText: a.question_text,
              answer: a.answer
            }))
          };
        });
        
        setEntries(formattedEntries);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast({
        title: "Failed to load entries",
        description: "There was an error loading your journal entries. Please try again.",
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
      // Find max position for the question type
      const maxPosition = questions
        .filter(q => q.type === question.type)
        .reduce((max, q) => (q.position > max ? q.position : max), 0);
      
      const { data, error } = await supabase
        .from('user_questions')
        .insert([{
          user_id: user.id,
          text: question.text,
          is_mandatory: question.isMandatory,
          is_active: question.isActive,
          position: maxPosition + 1,
          type: question.type
        }])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        const newQuestion: Question = {
          id: data[0].id,
          text: data[0].text,
          isMandatory: data[0].is_mandatory,
          isActive: data[0].is_active,
          position: data[0].position,
          type: data[0].type
        };
        
        setQuestions(prev => [...prev, newQuestion]);
      }
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Failed to add question",
        description: "There was an error adding your question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQuestion = async (id: string, updates: Partial<Omit<Question, 'id'>>) => {
    if (!user) return;
    
    try {
      const updateData: any = {};
      if ('text' in updates) updateData.text = updates.text;
      if ('isMandatory' in updates) updateData.is_mandatory = updates.isMandatory;
      if ('isActive' in updates) updateData.is_active = updates.isActive;
      if ('position' in updates) updateData.position = updates.position;
      if ('type' in updates) updateData.type = updates.type;
      
      const { error } = await supabase
        .from('user_questions')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      setQuestions(prev => prev.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ));
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: "Failed to update question",
        description: "There was an error updating your question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeQuestion = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_questions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error removing question:', error);
      toast({
        title: "Failed to remove question",
        description: "There was an error removing your question. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const reorderQuestions = async (questionIds: string[], type: 'morning' | 'evening') => {
    if (!user || questionIds.length === 0) return;
    
    try {
      // Update positions in the local state
      const updatedQuestions = [...questions];
      
      // We'll only reorder questions of the specified type
      const typeQuestions = updatedQuestions.filter(q => q.type === type);
      const otherQuestions = updatedQuestions.filter(q => q.type !== type);
      
      // Create a mapping of id to new position
      const updates: { id: string, position: number }[] = [];
      
      questionIds.forEach((id, index) => {
        const question = typeQuestions.find(q => q.id === id);
        if (question) {
          question.position = index + 1;
          updates.push({ id, position: index + 1 });
        }
      });
      
      // Update the database (in batch if possible)
      for (const update of updates) {
        const { error } = await supabase
          .from('user_questions')
          .update({ position: update.position })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      // Update the local state
      setQuestions([...typeQuestions, ...otherQuestions]);
      
      toast({
        title: "Questions reordered",
        description: "Your questions have been successfully reordered.",
      });
    } catch (error) {
      console.error('Error reordering questions:', error);
      toast({
        title: "Failed to reorder questions",
        description: "There was an error reordering your questions. Please try again.",
        variant: "destructive",
      });
      
      // Revert to the original order by fetching again
      fetchQuestions();
    }
  };

  const saveEntry = async (entry: Omit<Entry, 'id'>) => {
    if (!user) return;
    
    try {
      // First insert the entry
      const { data: entryData, error: entryError } = await supabase
        .from('user_entries')
        .insert([{
          user_id: user.id,
          date: entry.date,
          type: entry.type
        }])
        .select();
        
      if (entryError) throw entryError;
      
      if (entryData && entryData[0]) {
        const entryId = entryData[0].id;
        
        // Then insert all answers
        const answersToInsert = entry.answers.map(answer => ({
          entry_id: entryId,
          question_id: answer.questionId,
          question_text: answer.questionText,
          answer: answer.answer
        }));
        
        const { error: answersError } = await supabase
          .from('entry_answers')
          .insert(answersToInsert);
          
        if (answersError) throw answersError;
        
        // Update local state
        const newEntry: Entry = {
          id: entryId,
          date: entry.date,
          type: entry.type,
          answers: entry.answers
        };
        
        setEntries(prev => [newEntry, ...prev]);
        
        toast({
          title: "Entry saved",
          description: `Your ${entry.type} reflection has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Failed to save entry",
        description: "There was an error saving your reflection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        entries,
        isLoading,
        fetchQuestions,
        addQuestion,
        updateQuestion,
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
    throw new Error('useQuestions must be used within a QuestionsProvider');
  }
  return context;
};
