
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useStreakCalculation } from './useStreakCalculation';

export const useStreakData = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [goalsAchieved, setGoalsAchieved] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const { calculateStreakFromEntries } = useStreakCalculation();

  // Load streak data on auth state change
  const loadStreakData = async (userId: string | undefined) => {
    if (!userId) return;

    try {
      console.log("Loading streak data for user:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, best_streak, last_active_date')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading streak data:", error);
        return;
      }

      if (data) {
        console.log("Loaded streak data:", data);
        setCurrentStreak(data.current_streak || 0);
        setBestStreak(data.best_streak || 0);
        setLastActiveDate(data.last_active_date);
      }

      // Load goals achieved count
      await loadGoalsAchieved(userId);
    } catch (error) {
      console.error("Failed to load streak data:", error);
    }
  };

  // Load total goals achieved count
  const loadGoalsAchieved = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('weekly_priorities')
        .select('priority_1_completed, priority_2_completed, priority_3_completed')
        .eq('user_id', userId);

      if (error) {
        console.error("Error loading goals achieved:", error);
        return;
      }

      if (data) {
        const totalGoals = data.reduce((total, week) => {
          return total + 
            (week.priority_1_completed ? 1 : 0) +
            (week.priority_2_completed ? 1 : 0) +
            (week.priority_3_completed ? 1 : 0);
        }, 0);
        
        console.log("Total goals achieved:", totalGoals);
        setGoalsAchieved(totalGoals);
      }
    } catch (error) {
      console.error("Failed to load goals achieved:", error);
    }
  };

  // Update streak function with improved logic
  const updateStreak = async (userId: string) => {
    if (!userId) {
      console.log("No user found for streak update");
      return;
    }

    try {
      // Get all user entries to calculate the actual streak
      const { data: entries, error: entriesError } = await supabase
        .from('user_entries')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (entriesError) {
        console.error("Error fetching entries for streak calculation:", entriesError);
        return;
      }

      console.log("Fetched entries for streak calculation:", entries);

      // Calculate the actual streak based on all entries
      const { currentStreak: calculatedStreak, lastActiveDate: calculatedLastActive } = calculateStreakFromEntries(entries || []);
      
      console.log("Calculated streak:", {
        calculatedStreak,
        calculatedLastActive,
        currentStoredStreak: currentStreak
      });

      // Update best streak if needed
      let newBestStreak = bestStreak;
      if (calculatedStreak > bestStreak) {
        newBestStreak = calculatedStreak;
        console.log("New best streak achieved:", newBestStreak);
      }
      
      // Only update database if values have changed
      if (calculatedStreak !== currentStreak || calculatedLastActive !== lastActiveDate || newBestStreak !== bestStreak) {
        const { error } = await supabase
          .from('profiles')
          .update({
            current_streak: calculatedStreak,
            best_streak: newBestStreak,
            last_active_date: calculatedLastActive
          })
          .eq('id', userId);
        
        if (error) {
          console.error("Error updating streak in database:", error);
          throw error;
        }
        
        console.log("Streak updated successfully:", {
          currentStreak: calculatedStreak,
          bestStreak: newBestStreak,
          lastActiveDate: calculatedLastActive
        });
        
        // Update local state
        setCurrentStreak(calculatedStreak);
        setBestStreak(newBestStreak);
        setLastActiveDate(calculatedLastActive);
      } else {
        console.log("Streak values unchanged, no database update needed");
      }

      // Update goals achieved count
      await loadGoalsAchieved(userId);
      
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const resetStreakData = () => {
    setCurrentStreak(0);
    setBestStreak(0);
    setGoalsAchieved(0);
    setLastActiveDate(null);
  };

  return {
    currentStreak,
    bestStreak,
    goalsAchieved,
    lastActiveDate,
    loadStreakData,
    updateStreak,
    resetStreakData
  };
};
