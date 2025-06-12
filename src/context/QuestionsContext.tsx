import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  mood?: number; // Add mood to entries
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
  refreshEntries: () => void;
  getMoodTrend: () => { date: string; mood: number }[];
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
  {
    id: "morning-grateful",
    text: "What is one thing that you are grateful for?",
    type: 'morning',
    isActive: true,
    isMandatory: true,
    position: 4
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
  {
    id: "evening-win",
    text: "What is one win you had today?",
    type: 'evening',
    isActive: true,
    isMandatory: true,
    position: 3
  },
];

const dummyEntries: Entry[] = [
  {
    id: uuidv4(),
    date: '2024-01-01',
    type: 'morning',
    mood: 4,
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
    mood: 5,
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
  const { user, updateStreak } = useAuth();
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

  const fetchEntries = useCallback(async () => {
    try {
      if (!user) return;

      console.log("QuestionsContext: Fetching entries from Supabase");
      setIsLoading(true);

      // Fetch entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('user_entries')
        .select('*')
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      console.log("QuestionsContext: Received entries data", { count: entriesData?.length || 0 });

      // Fetch answers for all entries
      const entryIds = entriesData.map(entry => entry.id);
      
      if (entryIds.length === 0) {
        console.log("QuestionsContext: No entries found, setting empty array");
        setEntries([]);
        setIsLoading(false);
        return;
      }

      const { data: answersData, error: answersError } = await supabase
        .from('entry_answers')
        .select('*')
        .in('entry_id', entryIds);

      if (answersError) throw answersError;

      console.log("QuestionsContext: Received answers data", { count: answersData?.length || 0 });

      // Map and combine the data
      const formattedEntries: Entry[] = entriesData.map(entry => {
        const entryAnswers = answersData.filter(answer => answer.entry_id === entry.id);
        
        return {
          id: entry.id,
          date: entry.date,
          type: entry.type as QuestionType,
          mood: entry.mood || undefined,
          answers: entryAnswers.map(a => ({
            questionId: a.question_id,
            questionText: a.question_text,
            answer: a.answer
          }))
        };
      });

      console.log("QuestionsContext: Setting formatted entries", { count: formattedEntries.length });
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
  }, [user, toast]);
  
  // Make refreshEntries a function that awaits the fetchEntries call
  const refreshEntries = useCallback(async () => {
    console.log("QuestionsContext: refreshEntries called");
    await fetchEntries();
    return true; // Return a value to indicate completion
  }, [fetchEntries]);

  const updateTodaysQuestions = () => {
    const morningQuestions = questions
      .filter(q => q.type === 'morning' && q.isActive)
      .sort((a, b) => a.position - b.position);
    
    const eveningQuestions = questions
      .filter(q => q.type === 'evening' && q.isActive)
      .sort((a, b) => a.position - b.position);
    
    // For morning questions: always include mandatory ones, then randomly select 2 non-mandatory ones
    const mandatoryMorningQuestions = morningQuestions.filter(q => q.isMandatory);
    const nonMandatoryMorningQuestions = morningQuestions.filter(q => !q.isMandatory);
    
    // Randomly select 2 non-mandatory questions
    const shuffledNonMandatory = [...nonMandatoryMorningQuestions].sort(() => 0.5 - Math.random());
    const selectedNonMandatory = shuffledNonMandatory.slice(0, 2);
    
    // Combine mandatory and selected non-mandatory questions
    const finalMorningQuestions = [...mandatoryMorningQuestions, ...selectedNonMandatory]
      .sort((a, b) => a.position - b.position);
    
    setTodaysMorningQuestions(finalMorningQuestions);
    setTodaysEveningQuestions(eveningQuestions);
  };

  const refreshTodaysQuestions = () => {
    updateTodaysQuestions();
  };

  const getEntries = useCallback((date: string): Entry[] => {
    return entries.filter(entry => entry.date.startsWith(date));
  }, [entries]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchEntries();
    } else {
      setQuestions([]);
      setEntries([]);
    }
  }, [user, fetchEntries]);

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
      // Format the date to ensure consistent format in the database
      const formattedDate = entry.date.split('T')[0];
      
      // Get existing entries for this date and type
      const { data: existingEntries, error: fetchError } = await supabase
        .from('user_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', formattedDate)
        .eq('type', entry.type);
      
      if (fetchError) throw fetchError;
      
      // Get the existing entry ID if it exists
      let existingEntryId: string | null = null;
      let isNewEntry = false;
      
      if (existingEntries && existingEntries.length > 0) {
        existingEntryId = existingEntries[0].id;
        
        // Update existing entry with mood
        const { error: updateError } = await supabase
          .from('user_entries')
          .update({
            mood: entry.mood
          })
          .eq('id', existingEntryId);
          
        if (updateError) throw updateError;
        
        // Get existing answers for this entry to compare and update
        const { data: existingAnswers, error: answersError } = await supabase
          .from('entry_answers')
          .select('*')
          .eq('entry_id', existingEntryId);
          
        if (answersError) throw answersError;
        
        // Create a map of existing answers by question ID for efficient lookup
        const existingAnswersMap = new Map();
        if (existingAnswers) {
          existingAnswers.forEach(answer => {
            existingAnswersMap.set(answer.question_id, {
              id: answer.id,
              answer: answer.answer,
              question_text: answer.question_text
            });
          });
        }
        
        // Process each answer in the entry
        for (const answer of entry.answers) {
          const existingAnswer = existingAnswersMap.get(answer.questionId);
          
          if (existingAnswer) {
            // Only update if content changed to minimize database operations
            if (existingAnswer.answer !== answer.answer || existingAnswer.question_text !== answer.questionText) {
              const { error: updateError } = await supabase
                .from('entry_answers')
                .update({
                  answer: answer.answer,
                  question_text: answer.questionText
                })
                .eq('id', existingAnswer.id);
                
              if (updateError) throw updateError;
            }
          } else {
            // Insert new answer if it doesn't exist yet
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
        
      } else {
        // Create new entry since none exists
        isNewEntry = true;
        const { data: entryData, error: entryError } = await supabase
          .from('user_entries')
          .insert({
            user_id: user.id,
            date: formattedDate,
            type: entry.type,
            mood: entry.mood
          })
          .select();
        
        if (entryError) throw entryError;
        
        // Then save each answer
        if (entryData && entryData[0]) {
          existingEntryId = entryData[0].id;
          
          // Prepare answers for insertion
          const answersToInsert = entry.answers
            .filter(answer => answer.answer.trim() !== '') // Only insert non-empty answers
            .map(answer => ({
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
          date: formattedDate,
          type: entry.type,
          mood: entry.mood,
          answers: updatedAnswers ? updatedAnswers.map(a => ({
            questionId: a.question_id,
            questionText: a.question_text,
            answer: a.answer
          })) : []
        };
        
        // Update local state with careful merging
        setEntries(prev => {
          // Remove the specific entry being updated if it exists
          const filtered = prev.filter(e => 
            !(e.date === formattedDate && e.type === entry.type)
          );
          
          // Add the updated entry
          return [...filtered, updatedEntry];
        });
        
        // Update streak
        try {
          console.log("Updating streak after entry save");
          await updateStreak();
        } catch (streakError) {
          console.error("Error updating streak:", streakError);
        }
        
        // Refresh entries to get latest data
        setTimeout(() => {
          refreshEntries();
        }, 500);
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

  const getMoodTrend = useCallback((): { date: string; mood: number }[] => {
    return entries
      .filter(entry => entry.mood !== undefined)
      .map(entry => ({ date: entry.date, mood: entry.mood! }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries]);

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
        refreshEntries,
        getMoodTrend,
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
