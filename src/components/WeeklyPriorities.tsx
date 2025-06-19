import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { Save, Target, WifiOff } from "lucide-react";
import PriorityProgress from "./PriorityProgress";
import { getWeekStartDate } from "../utils/questionsUtils";

type WeeklyPriority = {
  id: string;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
  priority_1_completed: boolean;
  priority_2_completed: boolean;
  priority_3_completed: boolean;
  priority_1_progress: number;
  priority_2_progress: number;
  priority_3_progress: number;
  week_start_date: string;
};

const WeeklyPriorities: React.FC = () => {
  const { user, updateStreak } = useAuth();
  const { toast } = useToast();
  const [priorities, setPriorities] = useState<WeeklyPriority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  // Add ref to prevent multiple simultaneous fetch calls
  const fetchingRef = useRef(false);

  // Get the start of the current week (Sunday) - memoize this value
  const weekStartDate = React.useMemo((): string => {
    return getWeekStartDate();
  }, []);

  const fetchWeeklyPriorities = useCallback(async () => {
    if (!user || hasInitialized || fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setIsLoading(true);
      setHasError(false);
      setIsOffline(false);
      
      const { data, error } = await supabase
        .from('weekly_priorities')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate)
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        setHasError(true);
        setIsOffline(true);
        // Set default priorities to prevent jumping and stop retrying
        setPriorities({
          id: '',
          priority_1: '',
          priority_2: '',
          priority_3: '',
          priority_1_completed: false,
          priority_2_completed: false,
          priority_3_completed: false,
          priority_1_progress: 0,
          priority_2_progress: 0,
          priority_3_progress: 0,
          week_start_date: weekStartDate
        });
        setHasInitialized(true);
        return;
      }

      if (data) {
        // Ensure progress fields exist with default values
        setPriorities({
          ...data,
          priority_1_progress: data.priority_1_progress || 0,
          priority_2_progress: data.priority_2_progress || 0,
          priority_3_progress: data.priority_3_progress || 0,
        });
      } else {
        // Create empty priorities for the week
        setPriorities({
          id: '',
          priority_1: '',
          priority_2: '',
          priority_3: '',
          priority_1_completed: false,
          priority_2_completed: false,
          priority_3_completed: false,
          priority_1_progress: 0,
          priority_2_progress: 0,
          priority_3_progress: 0,
          week_start_date: weekStartDate
        });
      }
      setHasInitialized(true);
      setHasError(false);
      setIsOffline(false);
    } catch (error) {
      console.error('Error fetching weekly priorities:', error);
      setHasError(true);
      setIsOffline(true);
      // Set default priorities to prevent jumping and stop retrying
      setPriorities({
        id: '',
        priority_1: '',
        priority_2: '',
        priority_3: '',
        priority_1_completed: false,
        priority_2_completed: false,
        priority_3_completed: false,
        priority_1_progress: 0,
        priority_2_progress: 0,
        priority_3_progress: 0,
        week_start_date: weekStartDate
      });
      setHasInitialized(true);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [user, weekStartDate, hasInitialized]);

  useEffect(() => {
    if (user && !hasInitialized && !fetchingRef.current) {
      fetchWeeklyPriorities();
    }
  }, [user, fetchWeeklyPriorities, hasInitialized]);

  const handlePriorityChange = useCallback((priorityNumber: 1 | 2 | 3, value: string) => {
    if (!priorities) return;
    
    setPriorities(prev => prev ? {
      ...prev,
      [`priority_${priorityNumber}`]: value
    } : null);
  }, [priorities]);

  const handleProgressChange = useCallback((priorityNumber: 1 | 2 | 3, progress: number) => {
    if (!priorities) return;
    
    setPriorities(prev => prev ? {
      ...prev,
      [`priority_${priorityNumber}_progress`]: progress
    } : null);
  }, [priorities]);

  const handleCompletionToggle = useCallback(async (priorityNumber: 1 | 2 | 3) => {
    if (!priorities || !user || isOffline) return;

    const newCompletionStatus = !priorities[`priority_${priorityNumber}_completed`];
    
    // Update local state immediately for responsive UI
    setPriorities(prev => prev ? {
      ...prev,
      [`priority_${priorityNumber}_completed`]: newCompletionStatus
    } : null);

    try {
      if (priorities.id) {
        // Update existing record
        const { error } = await supabase
          .from('weekly_priorities')
          .update({
            [`priority_${priorityNumber}_completed`]: newCompletionStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', priorities.id);

        if (error) {
          console.error('Error updating completion:', error);
          // Revert on error
          setPriorities(prev => prev ? {
            ...prev,
            [`priority_${priorityNumber}_completed`]: !newCompletionStatus
          } : null);
          setIsOffline(true);
          return;
        }
      } else {
        // Need to save the record first
        await savePriorities();
      }

      // Update the goals achieved count after completion toggle
      await updateStreak();

      toast({
        title: newCompletionStatus ? "Priority completed!" : "Priority unmarked",
        description: `Priority ${priorityNumber} ${newCompletionStatus ? 'completed' : 'unmarked'}`,
      });
      
      setIsOffline(false);
    } catch (error) {
      console.error('Error updating completion status:', error);
      setIsOffline(true);
      // Revert the local state on error
      setPriorities(prev => prev ? {
        ...prev,
        [`priority_${priorityNumber}_completed`]: !newCompletionStatus
      } : null);
    }
  }, [priorities, user, updateStreak, toast, isOffline]);

  const savePriorities = useCallback(async () => {
    if (!priorities || !user || isOffline) return;

    setIsSaving(true);
    try {
      if (priorities.id) {
        // Update existing record
        const { error } = await supabase
          .from('weekly_priorities')
          .update({
            priority_1: priorities.priority_1,
            priority_2: priorities.priority_2,
            priority_3: priorities.priority_3,
            priority_1_completed: priorities.priority_1_completed,
            priority_2_completed: priorities.priority_2_completed,
            priority_3_completed: priorities.priority_3_completed,
            priority_1_progress: priorities.priority_1_progress,
            priority_2_progress: priorities.priority_2_progress,
            priority_3_progress: priorities.priority_3_progress,
            updated_at: new Date().toISOString()
          })
          .eq('id', priorities.id);

        if (error) {
          console.error('Error updating priorities:', error);
          setIsOffline(true);
          toast({
            title: "Connection Error",
            description: "Working in offline mode. Changes will be saved when connection is restored.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('weekly_priorities')
          .insert({
            user_id: user.id,
            week_start_date: weekStartDate,
            priority_1: priorities.priority_1,
            priority_2: priorities.priority_2,
            priority_3: priorities.priority_3,
            priority_1_completed: priorities.priority_1_completed,
            priority_2_completed: priorities.priority_2_completed,
            priority_3_completed: priorities.priority_3_completed,
            priority_1_progress: priorities.priority_1_progress,
            priority_2_progress: priorities.priority_2_progress,
            priority_3_progress: priorities.priority_3_progress
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating priorities:', error);
          setIsOffline(true);
          toast({
            title: "Connection Error",
            description: "Working in offline mode. Changes will be saved when connection is restored.",
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setPriorities(prev => prev ? { ...prev, id: data.id } : null);
        }
      }

      setIsOffline(false);
      toast({
        title: "Priorities saved",
        description: "Your weekly priorities have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving priorities:', error);
      setIsOffline(true);
      toast({
        title: "Connection Error",
        description: "Working in offline mode. Changes will be saved when connection is restored.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [priorities, user, weekStartDate, toast, isOffline]);

  // Always render with consistent height to prevent jumping
  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-purple-400">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="animate-pulse text-purple-600">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!priorities) {
    return (
      <Card className="border-l-4 border-l-purple-400">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="text-red-600 flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            Offline mode
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500 rounded-full p-2">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">
                Weekly Goals
              </h3>
              <p className="text-xs text-purple-600">
                Week of {new Date(weekStartDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          {isOffline && (
            <WifiOff className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {[1, 2, 3].map((num) => (
          <div key={num} className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`priority-${num}`}
                checked={priorities[`priority_${num}_completed` as keyof WeeklyPriority] as boolean}
                onCheckedChange={() => handleCompletionToggle(num as 1 | 2 | 3)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                disabled={isOffline}
              />
              <Input
                placeholder={`Goal ${num}...`}
                value={priorities[`priority_${num}` as keyof WeeklyPriority] as string || ''}
                onChange={(e) => handlePriorityChange(num as 1 | 2 | 3, e.target.value)}
                className={`flex-1 text-sm ${priorities[`priority_${num}_completed` as keyof WeeklyPriority] ? 'line-through text-gray-500' : ''}`}
                disabled={isOffline}
              />
            </div>
            
            {priorities[`priority_${num}` as keyof WeeklyPriority] && (
              <PriorityProgress
                priorityText={priorities[`priority_${num}` as keyof WeeklyPriority] as string}
                progress={priorities[`priority_${num}_progress` as keyof WeeklyPriority] as number}
                onProgressChange={(progress) => handleProgressChange(num as 1 | 2 | 3, progress)}
                disabled={isOffline}
              />
            )}
          </div>
        ))}
        
        <Button
          onClick={savePriorities}
          disabled={isSaving || isOffline}
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white mt-4"
        >
          {isSaving ? (
            <span className="animate-spin">⟳</span>
          ) : isOffline ? (
            <WifiOff className="h-3 w-3" />
          ) : (
            <Save className="h-3 w-3" />
          )}
          <span className="ml-2">
            {isSaving ? 'Saving...' : isOffline ? 'Offline' : 'Save Goals'}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default WeeklyPriorities;
