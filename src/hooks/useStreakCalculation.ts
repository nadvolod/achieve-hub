
import { supabase } from "@/integrations/supabase/client";

export const useStreakCalculation = () => {
  // Get today's date in local timezone as YYYY-MM-DD
  const getTodayString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate streak based on all user entries
  const calculateStreakFromEntries = (entries: any[]): { currentStreak: number; lastActiveDate: string | null } => {
    if (!entries || entries.length === 0) {
      return { currentStreak: 0, lastActiveDate: null };
    }

    // Get unique dates and sort them in descending order (most recent first)
    const uniqueDates = [...new Set(entries.map(entry => entry.date))].sort((a, b) => b.localeCompare(a));
    
    console.log("Calculating streak from dates:", uniqueDates);
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, lastActiveDate: null };
    }

    const mostRecentDate = uniqueDates[0];
    
    // Calculate streak starting from the most recent date
    let streak = 0;
    let currentDate = new Date(mostRecentDate + 'T00:00:00');
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const entryDate = uniqueDates[i];
      const expectedDate = currentDate.toISOString().split('T')[0];
      
      console.log(`Checking date ${i}: entry=${entryDate}, expected=${expectedDate}`);
      
      if (entryDate === expectedDate) {
        streak++;
        console.log(`Streak continues: ${streak}`);
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Gap found, break the streak
        console.log(`Gap found at ${entryDate}, streak ends at ${streak}`);
        break;
      }
    }
    
    return { currentStreak: streak, lastActiveDate: mostRecentDate };
  };

  return {
    getTodayString,
    calculateStreakFromEntries
  };
};
