import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{success: boolean; message: string}>;
  signOut: () => Promise<void>;
  currentStreak: number;
  bestStreak: number;
  goalsAchieved: number;
  lastActiveDate: string | null;
  updateStreak: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [goalsAchieved, setGoalsAchieved] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Get today's date in local timezone as YYYY-MM-DD
  const getTodayString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load streak data when user logs in
          loadStreakData(session.user.id);
        } else {
          // Reset streak data when user logs out
          setCurrentStreak(0);
          setBestStreak(0);
          setGoalsAchieved(0);
          setLastActiveDate(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadStreakData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

    const today = getTodayString();
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

  // Update streak function with improved logic
  const updateStreak = async () => {
    if (!user) {
      console.log("No user found for streak update");
      return;
    }

    try {
      // Get all user entries to calculate the actual streak
      const { data: entries, error: entriesError } = await supabase
        .from('user_entries')
        .select('date')
        .eq('user_id', user.id)
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
          .eq('id', user.id);
        
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
      await loadGoalsAchieved(user.id);
      
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      // Get the current site URL dynamically
      const siteUrl = window.location.origin;
      console.log("Redirecting to:", siteUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteUrl,
        }
      });
      
      if (error) throw error;
      
      // Check if the user already exists but hasn't confirmed their email
      if (data?.user && data.user.identities?.length === 0) {
        toast({
          title: "Account already exists",
          description: "You've already signed up with this email. Please check your email for the confirmation link or try signing in.",
          duration: 6000,
        });
        return { 
          success: false, 
          message: "You've already signed up with this email. Please check your email for the confirmation link or try signing in." 
        };
      }
      
      toast({
        title: "Account created",
        description: "Check your email for a confirmation link.",
      });
      
      return { success: true, message: "Check your email for a confirmation link." };
    } catch (error: any) {
      // Handle the specific error for already registered users
      if (error.message?.includes("User already registered")) {
        toast({
          title: "Account already exists",
          description: "You've already signed up with this email. Please check your email for the confirmation link or try signing in.",
          duration: 6000,
          variant: "destructive",
        });
        return { 
          success: false, 
          message: "You've already signed up with this email. Please check your email for the confirmation link or try signing in." 
        };
      }

      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signInWithEmail, 
      signUpWithEmail, 
      signOut,
      currentStreak,
      bestStreak,
      goalsAchieved,
      lastActiveDate,
      updateStreak
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
