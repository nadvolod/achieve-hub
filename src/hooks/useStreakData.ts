
import { useState, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useStreakCalculation } from './useStreakCalculation';

export const useStreakData = () => {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [goalsAchieved, setGoalsAchieved] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { calculateStreakFromEntries } = useStreakCalculation();
  
  // Add refs to prevent multiple simultaneous calls
  const loadingRef = useRef(false);
  const updateRef = useRef(false);

  // Load streak data on auth state change
  const loadStreakData = useCallback(async (userId: string | undefined) => {
    if (!userId || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setHasError(false);
      console.log("Loading streak data for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('current_streak, best_streak, last_active_date')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading streak data:", error);
        setHasError(true);
        // Set default values and don't retry
        setCurrentStreak(0);
        setBestStreak(0);
        setLastActiveDate(null);
        return;
      }

      if (data) {
        console.log("Loaded streak data:", data);
        setCurrentStreak(data.current_streak || 0);
        setBestStreak(data.best_streak || 0);
        setLastActiveDate(data.last_active_date);
        setHasError(false);
      }

      // Load goals achieved count - but don't let errors here break the whole flow
      try {
        await loadGoalsAchieved(userId);
      } catch (goalsError) {
        console.error("Error loading goals, continuing anyway:", goalsError);
      }
    } catch (error) {
      console.error("Failed to load streak data:", error);
      setHasError(true);
      // Set default values to prevent layout jumping
      setCurrentStreak(0);
      setBestStreak(0);
      setLastActiveDate(null);
      setGoalsAchieved(0);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // Load total goals achieved count
  const loadGoalsAchieved = useCallback(async (userId: string) => {
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
      // Don't throw, just continue with current value
    }
  }, []);

  // Update streak function with improved error handling
  const updateStreak = useCallback(async (userId: string) => {
    if (!userId || updateRef.current) {
      console.log("No user found for streak update or already updating");
      return;
    }

    try {
      updateRef.current = true;
      
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
      
      // Only update database and state if values have actually changed
      if (calculatedStreak !== currentStreak || calculatedLastActive !== lastActiveDate || newBestStreak !== bestStreak) {
        try {
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
            return;
          }
          
          console.log("Streak updated successfully:", {
            currentStreak: calculatedStreak,
            bestStreak: newBestStreak,
            lastActiveDate: calculatedLastActive
          });
          
          // Update local state only if database update succeeded
          setCurrentStreak(calculatedStreak);
          setBestStreak(newBestStreak);
          setLastActiveDate(calculatedLastActive);
          setHasError(false);
        } catch (dbError) {
          console.error("Database update failed:", dbError);
          setHasError(true);
          return;
        }
      } else {
        console.log("Streak values unchanged, no database update needed");
      }

      // Update goals achieved count - but don't let errors here break the flow
      try {
        await loadGoalsAchieved(userId);
      } catch (goalsError) {
        console.error("Error updating goals, continuing anyway:", goalsError);
      }
      
    } catch (error) {
      console.error("Error updating streak:", error);
      setHasError(true);
    } finally {
      updateRef.current = false;
    }
  }, [currentStreak, bestStreak, lastActiveDate, calculateStreakFromEntries, loadGoalsAchieved]);

  const resetStreakData = useCallback(() => {
    setCurrentStreak(0);
    setBestStreak(0);
    setGoalsAchieved(0);
    setLastActiveDate(null);
    setIsLoading(false);
    setHasError(false);
    loadingRef.current = false;
    updateRef.current = false;
  }, []);

  return {
    currentStreak,
    bestStreak,
    goalsAchieved,
    lastActiveDate,
    isLoading,
    hasError,
    loadStreakData,
    updateStreak,
    resetStreakData
  };
};
