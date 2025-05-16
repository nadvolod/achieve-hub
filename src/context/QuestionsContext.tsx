
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Question {
  id: string;
  text: string;
  isMandatory: boolean;
  isActive: boolean;
  type: 'morning' | 'evening'; // Added question type
}

export interface Entry {
  id: string;
  date: string; // ISO string
  type: 'morning' | 'evening'; // Added entry type
  answers: {
    questionId: string;
    questionText: string;
    answer: string;
  }[];
}

interface QuestionsContextType {
  questions: Question[];
  entries: Entry[];
  todaysMorningQuestions: Question[];
  todaysEveningQuestions: Question[];
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  addQuestion: (question: Omit<Question, 'id'>) => void;
  removeQuestion: (id: string) => void;
  saveEntry: (entry: Omit<Entry, 'id'>) => void;
  getEntries: (date: string) => Entry[];
  refreshTodaysQuestions: () => void;
}

// Updated default questions with types
const defaultMorningQuestions: Question[] = [
  { id: '1', text: 'How can I give even more fully consistently?', isMandatory: true, isActive: true, type: 'morning' },
  { id: '2', text: 'Who do I need to be to be able to go at 95% 6 days of the week?', isMandatory: true, isActive: true, type: 'morning' },
  { id: '3', text: 'Am I happy?', isMandatory: true, isActive: true, type: 'morning' },
  { id: '4', text: 'Am I having fun?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '5', text: 'How can I live with even more courage and determination?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '6', text: 'Did I live with level 10 energy? Who must I become to live with level 10 energy 6/7 days?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '7', text: 'Was I my best yesterday (1-10)?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '8', text: 'How can I love even more (3 human needs)?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '9', text: 'How do I serve even more?', isMandatory: false, isActive: true, type: 'morning' },
  { id: '10', text: 'How can I grow even more?', isMandatory: false, isActive: true, type: 'morning' },
];

// Add evening questions
const defaultEveningQuestions: Question[] = [
  { id: '11', text: 'What did I accomplish today?', isMandatory: true, isActive: true, type: 'evening' },
  { id: '12', text: 'Did I complete all my planned activities? Why?', isMandatory: true, isActive: true, type: 'evening' },
  { id: '13', text: 'What should I focus on tomorrow?', isMandatory: true, isActive: true, type: 'evening' },
  { id: '14', text: 'What should I do tomorrow to make it a better day?', isMandatory: false, isActive: true, type: 'evening' },
  { id: '15', text: 'How did I do with my emotions? What was the moment that made me unconscious?', isMandatory: false, isActive: true, type: 'evening' },
  { id: '16', text: 'What fun did I have today?', isMandatory: false, isActive: true, type: 'evening' },
  { id: '17', text: 'Who should I spend more time with and why?', isMandatory: false, isActive: true, type: 'evening' },
  { id: '18', text: 'What would I do differently if I could live my day over?', isMandatory: false, isActive: true, type: 'evening' },
];

const QuestionsContext = createContext<QuestionsContextType | undefined>(undefined);

export const QuestionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [todaysMorningQuestions, setTodaysMorningQuestions] = useState<Question[]>([]);
  const [todaysEveningQuestions, setTodaysEveningQuestions] = useState<Question[]>([]);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedQuestions = localStorage.getItem('reflectionQuestions');
    const storedEntries = localStorage.getItem('reflectionEntries');
    
    if (storedQuestions) {
      const loadedQuestions = JSON.parse(storedQuestions);
      // Add type property to any questions that don't have it
      const updatedQuestions = loadedQuestions.map((q: any) => ({
        ...q,
        type: q.type || (parseInt(q.id) > 10 ? 'evening' : 'morning')
      }));
      setQuestions(updatedQuestions);
    } else {
      // Combine morning and evening questions
      const allDefaultQuestions = [...defaultMorningQuestions, ...defaultEveningQuestions];
      setQuestions(allDefaultQuestions);
      localStorage.setItem('reflectionQuestions', JSON.stringify(allDefaultQuestions));
    }
    
    if (storedEntries) {
      // Add type to any entries that don't have it
      const loadedEntries = JSON.parse(storedEntries);
      const updatedEntries = loadedEntries.map((entry: any) => ({
        ...entry,
        type: entry.type || 'morning'
      }));
      setEntries(updatedEntries);
      localStorage.setItem('reflectionEntries', JSON.stringify(updatedEntries));
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

  // Generate today's questions for both morning and evening
  const refreshTodaysQuestions = () => {
    const today = new Date().toISOString().split('T')[0];
    const morningEntries = entries.filter(e => e.date.startsWith(today) && e.type === 'morning');
    const eveningEntries = entries.filter(e => e.date.startsWith(today) && e.type === 'evening');
    
    // Morning questions
    if (morningEntries.length > 0) {
      const lastMorningEntry = morningEntries[morningEntries.length - 1];
      const entryQuestionIds = lastMorningEntry.answers.map(a => a.questionId);
      const todaysQ = questions.filter(q => entryQuestionIds.includes(q.id));
      setTodaysMorningQuestions(todaysQ);
    } else {
      generateTodaysMorningQuestions(today);
    }

    // Evening questions
    if (eveningEntries.length > 0) {
      const lastEveningEntry = eveningEntries[eveningEntries.length - 1];
      const entryQuestionIds = lastEveningEntry.answers.map(a => a.questionId);
      const todaysQ = questions.filter(q => entryQuestionIds.includes(q.id));
      setTodaysEveningQuestions(todaysQ);
    } else {
      generateTodaysEveningQuestions(today);
    }
  };

  const generateTodaysMorningQuestions = (today: string) => {
    // Get mandatory questions for morning
    const mandatoryQuestions = questions.filter(q => q.isMandatory && q.isActive && q.type === 'morning');
    
    // Get rotating questions for morning
    const nonMandatoryQuestions = questions.filter(q => !q.isMandatory && q.isActive && q.type === 'morning');
    
    // Select 2 rotating questions (or fewer if not enough available)
    const selectedRotatingCount = Math.min(nonMandatoryQuestions.length, 2);
    
    // Create a deterministic but "random" selection based on the date
    const dateHash = parseInt(today.replace(/-/g, ''));
    
    let rotatingQuestions: Question[] = [];
    
    if (nonMandatoryQuestions.length > 0) {
      // Create a deterministic shuffle based on today's date
      const shuffledQuestions = [...nonMandatoryQuestions].sort((a, b) => {
        return ((parseInt(a.id) * dateHash) % 17) - ((parseInt(b.id) * dateHash) % 17);
      });
      
      rotatingQuestions = shuffledQuestions.slice(0, selectedRotatingCount);
    }

    setTodaysMorningQuestions([...mandatoryQuestions, ...rotatingQuestions]);
  };

  const generateTodaysEveningQuestions = (today: string) => {
    // For evening questions, we show all of them
    const activeEveningQuestions = questions.filter(q => q.isActive && q.type === 'evening');
    setTodaysEveningQuestions(activeEveningQuestions);
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
    setEntries(prev => [...prev, newEntry]);
  };

  const getEntries = (date: string) => {
    return entries.filter(entry => entry.date.startsWith(date));
  };

  return (
    <QuestionsContext.Provider value={{
      questions,
      entries,
      todaysMorningQuestions,
      todaysEveningQuestions,
      updateQuestion,
      addQuestion,
      removeQuestion,
      saveEntry,
      getEntries,
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
