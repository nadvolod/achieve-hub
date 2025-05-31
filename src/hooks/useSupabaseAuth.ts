
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useSupabaseAuth = () => {
  const { toast } = useToast();

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

  return {
    signInWithEmail,
    signUpWithEmail,
    signOut
  };
};
