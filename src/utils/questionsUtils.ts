
import { Entry, Question } from "../context/QuestionsContext";

// Format date as "May 16, 2025"
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Get today's date as ISO string (YYYY-MM-DD)
export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Sort entries by date (most recent first)
export const sortEntriesByDate = (entries: Entry[]): Entry[] => {
  return [...entries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

// Group entries by month and year
export const groupEntriesByMonth = (entries: Entry[]): Record<string, Entry[]> => {
  const grouped: Record<string, Entry[]> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!grouped[monthYear]) {
      grouped[monthYear] = [];
    }
    
    grouped[monthYear].push(entry);
  });
  
  return grouped;
};

// Get the list of questions for a specific day using the same deterministic algorithm as in context
export const getQuestionsForDate = (date: string, questions: Question[]): Question[] => {
  // Get mandatory questions
  const mandatoryQuestions = questions.filter(q => q.isMandatory && q.isActive);
  
  // Get rotating questions
  const nonMandatoryQuestions = questions.filter(q => !q.isMandatory && q.isActive);
  
  // Select 2 rotating questions (or fewer if not enough available)
  const selectedRotatingCount = Math.min(nonMandatoryQuestions.length, 2);
  
  // Create a deterministic but "random" selection based on the date
  const dateHash = parseInt(date.replace(/-/g, ''));
  
  let rotatingQuestions: Question[] = [];
  
  if (nonMandatoryQuestions.length > 0) {
    // Create a deterministic shuffle based on the date
    const shuffledQuestions = [...nonMandatoryQuestions].sort((a, b) => {
      return ((parseInt(a.id) * dateHash) % 17) - ((parseInt(b.id) * dateHash) % 17);
    });
    
    rotatingQuestions = shuffledQuestions.slice(0, selectedRotatingCount);
  }

  return [...mandatoryQuestions, ...rotatingQuestions];
};
