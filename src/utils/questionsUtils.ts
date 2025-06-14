
import { Entry, Question } from "../context/QuestionsContext";

// Format date as "May 16, 2025"
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC' // Force UTC to avoid timezone issues
  });
};

// Get today's date as ISO string (YYYY-MM-DD)
export const getTodayDateString = (): string => {
  // Create a fresh Date object to ensure we get the current date
  // Get the local date components to avoid timezone issues
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Sort entries by date (most recent first)
export const sortEntriesByDate = (entries: Entry[]): Entry[] => {
  return [...entries].sort((a, b) => {
    // Sort by date first
    const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateComparison !== 0) return dateComparison;
    
    // If same date, morning comes before evening
    if (a.type === 'morning' && b.type === 'evening') return -1;
    if (a.type === 'evening' && b.type === 'morning') return 1;
    
    return 0;
  });
};

// Group entries by month and year
export const groupEntriesByMonth = (entries: Entry[]): Record<string, Entry[]> => {
  const sorted = sortEntriesByDate(entries);
  const grouped: Record<string, Entry[]> = {};
  
  sorted.forEach(entry => {
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
export const getMorningQuestionsForDate = (date: string, questions: Question[]): Question[] => {
  // Get Top 5 questions
  const topFiveQuestions = questions.filter(q => q.isTopFive && q.isActive && q.type === 'morning');
  
  // Get rotating questions
  const nonTopFiveQuestions = questions.filter(q => !q.isTopFive && q.isActive && q.type === 'morning');
  
  // Select 2 rotating questions (or fewer if not enough available)
  const selectedRotatingCount = Math.min(nonTopFiveQuestions.length, 2);
  
  // Create a deterministic but "random" selection based on the date
  const dateHash = parseInt(date.replace(/-/g, ''));
  
  let rotatingQuestions: Question[] = [];
  
  if (nonTopFiveQuestions.length > 0) {
    // Create a deterministic shuffle based on the date
    const shuffledQuestions = [...nonTopFiveQuestions].sort((a, b) => {
      return ((parseInt(a.id) * dateHash) % 17) - ((parseInt(b.id) * dateHash) % 17);
    });
    
    rotatingQuestions = shuffledQuestions.slice(0, selectedRotatingCount);
  }

  return [...topFiveQuestions, ...rotatingQuestions];
};

// Get all active evening questions
export const getEveningQuestionsForDate = (questions: Question[]): Question[] => {
  return questions.filter(q => q.isActive && q.type === 'evening');
};

// Format time for display (e.g., "8:00 AM")
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Generate a URL with parameters for email reminders
export const generateReminderUrl = (baseUrl: string): string => {
  return `${baseUrl}?source=email&timestamp=${Date.now()}`;
};
