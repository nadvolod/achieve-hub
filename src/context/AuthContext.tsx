
import React, { createContext, useState, useEffect, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useStreakData } from "../hooks/useStreakData";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

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
  
  const {
    currentStreak,
    bestStreak,
    goalsAchieved,
    lastActiveDate,
    loadStreakData,
    updateStreak: updateStreakData,
    resetStreakData
  } = useStreakData();
  
  const { signInWithEmail, signUpWithEmail, signOut } = useSupabaseAuth();

  const updateStreak = async () => {
    if (user) {
      await updateStreakData(user.id);
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
          resetStreakData();
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
  }, [loadStreakData, resetStreakData]);

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
