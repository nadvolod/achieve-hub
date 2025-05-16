
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Question {
  id: string;
  text: string;
  isMandatory: boolean;
  isActive: boolean;
}

export interface Entry {
  id: string;
  date: string; // ISO string
  answers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
}

interface QuestionsContextType {
  questions: Question[];
  entries: Entry[];
  todaysQuestions: Question[];
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  removeQuestion: (id: string) => void;
  saveEntry: (entry: Omit<Entry, 'id'>) => void;
  getEntry: (date: string) => Entry | undefined;
  refreshTodaysQuestions: () => void;
}

const defaultQuestions: Question[] = [
  { id: '1', text: 'How can I give even more fully consistently?', isMandatory: true, isActive: true },
  { id: '2', text: 'Who do I need to be to be able to go at 95% 6 days of the week?', isMandatory: true, isActive: true },
  { id: '3', text: 'Am I happy?', isMandatory: true, isActive: true },
  { id: '4', text: 'Am I having fun?', isMandatory: false, isActive: true },
  { id: '5', text: 'How can I live with even more courage and determination?', isMandatory: false, isActive: true },
  { id: '6', text: 'Did I live with level 10 energy? Who must I become to live with level 10 energy 6/7 days?', isMandatory: false, isActive: true },
  { id: '7', text: 'Was I my best yesterday (1-10)?', isMandatory: false, isActive: true },
  { id: '8', text: 'How can I love even more (3 human needs)?', isMandatory: false, isActive: true },
  { id: '9', text: 'How do I serve even more?', isMandatory: false, isActive: true },
  { id: '10', text: 'How can I grow even more?', isMandatory: false, isActive: true },
  { id: '11', text: 'Who should I spend more time with and why?', isMandatory: false, isActive: true },
  { id: '12', text: 'What would I do differently if I could live my day over?', isMandatory: false, isActive: true },
  { id: '13', text: 'What kind of man do I want to be?', isMandatory: false, isActive: true },
  { id: '14', text: 'If I could do only 3 things, what are the most important things for today? Why?', isMandatory: false, isActive: true },
  { id: '15', text: 'How does a CEO behave?', isMandatory: false, isActive: true },
  { id: '16', text: 'How does an abundant person behave?', isMandatory: false, isActive: true },
  { id: '17', text: 'What would I fill my time with if I wasn\'t spending all of it at work?', isMandatory: false, isActive: true },
];

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todaysQuestions, setTodaysQuestions] = useState<Question[]>([]);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem('reflectionQuestions');
    const storedEntries = localStorage.getItem('reflectionEntries');
    
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    } else {
      setQuestions(defaultQuestions);
      localStorage.setItem('reflectionQuestions', JSON.stringify(defaultQuestions));
    }
    
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  // Save to localStorage whenever questions or entries change
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem('reflectionQuestions', JSON.stringify(questions));
    }
  }, [questions]);

  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('reflectionEntries', JSON.stringify(entries));
    }
  }, [entries]);

  // Generate today's questions based on rules (3 mandatory + 2 rotating)
  const refreshTodaysQuestions = () => {
    const today = new Date().toISOString().split('T')[0];
    const entry = entries.find(e => e.date.startsWith(today));

    // If we already have an entry for today, use those questions
    if (entry) {
      const entryQuestionIds = entry.answers.map(a => a.questionId);
      const todaysQ = questions.filter(q => entryQuestionIds.includes(q.id));
      setTodaysQuestions(todaysQ);
      return;
    }

    // Get mandatory questions
    const mandatoryQuestions = questions.filter(q => q.isMandatory && q.isActive);
    
    // Get rotating questions
    const nonMandatoryQuestions = questions.filter(q => !q.isMandatory && q.isActive);
    
    // Select 2 rotating questions (or fewer if not enough available)
    const selectedRotatingCount = Math.min(nonMandatoryQuestions.length, 2);
    
    // Create a deterministic but "random" selection based on the date
    // This ensures the same questions appear on the same date if you reload,
    // but different dates get different combinations
    const dateHash = parseInt(today.replace(/-/g, ''));
    
    let rotatingQuestions: Question[] = [];
    
    if (nonMandatoryQuestions.length > 0) {
      // Create a deterministic shuffle based on today's date
      const shuffledQuestions = [...nonMandatoryQuestions].sort((a, b) => {
        return ((parseInt(a.id) * dateHash) % 17) - ((parseInt(b.id) * dateHash) % 17);
      });
      
      rotatingQuestions = shuffledQuestions.slice(0, selectedRotatingCount);
    }

    setTodaysQuestions([...mandatoryQuestions, ...rotatingQuestions]);
  };

  // Call on initial load and whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      refreshTodaysQuestions();
    }
  }, [questions]);

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => q.id === id ? { ...q, ...updates } : q)
    );
  };

  const addQuestion = (question: Omit<Question, 'id'>) => {
    const id = Date.now().toString();
    setQuestions(prev => [...prev, { ...question, id }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const saveEntry = (entry: Omit<Entry, 'id'>) => {
    const id = Date.now().toString();
    const newEntry = { ...entry, id };
    setEntries(prev => {
      // Check if entry for this date already exists
      const entryDateStart = entry.date.split('T')[0];
      const existingEntryIndex = prev.findIndex(e => e.date.startsWith(entryDateStart));
      
      if (existingEntryIndex >= 0) {
        // Replace the existing entry
        const updatedEntries = [...prev];
        updatedEntries[existingEntryIndex] = newEntry;
        return updatedEntries;
      } else {
        // Add new entry
        return [...prev, newEntry];
      }
    });
  };

  const getEntry = (date: string) => {
    return entries.find(entry => entry.date.startsWith(date));
  };

  return (
    <QuestionsContext.Provider value={{
      questions,
      entries,
      todaysQuestions,
      updateQuestion,
      addQuestion,
      removeQuestion,
      saveEntry,
      getEntry,
      refreshTodaysQuestions
    }}>
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
