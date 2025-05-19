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
  const [lastActiveDate, setLastActiveDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Load streak data on auth state change
  const loadStreakData = async (userId: string | undefined) => {
    if (!userId) return;

    try {
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
        setCurrentStreak(data.current_streak || 0);
        setBestStreak(data.best_streak || 0);
        setLastActiveDate(data.last_active_date);
      }
    } catch (error) {
      console.error("Failed to load streak data:", error);
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

  // Update streak function
  const updateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      // If the last active date is yesterday, increment streak
      // If it's today, keep streak the same
      // If it's neither, reset streak to 1
      
      let newStreak = 1; // Default to 1 for a new streak
      let newBestStreak = bestStreak;
      
      if (lastActiveDate) {
        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(today);
        const yesterday = new Date(todayDate);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isToday = lastDate.toISOString().split('T')[0] === today;
        const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
        
        if (isToday) {
          // Already logged today, keep current streak
          return;
        } else if (isYesterday) {
          // Logged yesterday, increment streak
          newStreak = currentStreak + 1;
        }
      }
      
      // Update best streak if needed
      if (newStreak > bestStreak) {
        newBestStreak = newStreak;
      }
      
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
          last_active_date: today
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setCurrentStreak(newStreak);
      setBestStreak(newBestStreak);
      setLastActiveDate(today);
      
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
