
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { Save, Target } from "lucide-react";

type WeeklyPriority = {
  id: string;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
  priority_1_completed: boolean;
  priority_2_completed: boolean;
  priority_3_completed: boolean;
  week_start_date: string;
};

const WeeklyPriorities: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [priorities, setPriorities] = useState<WeeklyPriority | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get the start of the current week (Monday)
  const getWeekStartDate = (): string => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const weekStartDate = getWeekStartDate();

  useEffect(() => {
    if (user) {
      fetchWeeklyPriorities();
    }
  }, [user]);

  const fetchWeeklyPriorities = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('weekly_priorities')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartDate)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPriorities(data);
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
          week_start_date: weekStartDate
        });
      }
    } catch (error) {
      console.error('Error fetching weekly priorities:', error);
      toast({
        title: "Error",
        description: "Failed to load weekly priorities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = (priorityNumber: 1 | 2 | 3, value: string) => {
    if (!priorities) return;
    
    setPriorities(prev => prev ? {
      ...prev,
      [`priority_${priorityNumber}`]: value
    } : null);
  };

  const handleCompletionToggle = async (priorityNumber: 1 | 2 | 3) => {
    if (!priorities || !user) return;

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

        if (error) throw error;
      } else {
        // Need to save the record first
        await savePriorities();
      }

      toast({
        title: newCompletionStatus ? "Priority completed!" : "Priority unmarked",
        description: `Priority ${priorityNumber} ${newCompletionStatus ? 'completed' : 'unmarked'}`,
      });
    } catch (error) {
      console.error('Error updating completion status:', error);
      // Revert the local state on error
      setPriorities(prev => prev ? {
        ...prev,
        [`priority_${priorityNumber}_completed`]: !newCompletionStatus
      } : null);
      
      toast({
        title: "Error",
        description: "Failed to update completion status",
        variant: "destructive",
      });
    }
  };

  const savePriorities = async () => {
    if (!priorities || !user) return;

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
            updated_at: new Date().toISOString()
          })
          .eq('id', priorities.id);

        if (error) throw error;
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
            priority_3_completed: priorities.priority_3_completed
          })
          .select()
          .single();

        if (error) throw error;
        
        if (data) {
          setPriorities(prev => prev ? { ...prev, id: data.id } : null);
        }
      }

      toast({
        title: "Priorities saved",
        description: "Your weekly priorities have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving priorities:', error);
      toast({
        title: "Error",
        description: "Failed to save priorities",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6 border-l-4 border-l-purple-400">
        <CardContent className="p-4">
          <div className="animate-pulse">Loading weekly priorities...</div>
        </CardContent>
      </Card>
    );
  }

  if (!priorities) return null;

  return (
    <Card className="mb-6 border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-purple-800">
            What are your top 3 SMART priorities for the week?
          </h3>
        </div>
        <p className="text-sm text-purple-600">
          Week of {new Date(weekStartDate).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-3">
            <Checkbox
              id={`priority-${num}`}
              checked={priorities[`priority_${num}_completed` as keyof WeeklyPriority] as boolean}
              onCheckedChange={() => handleCompletionToggle(num as 1 | 2 | 3)}
              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <Input
              placeholder={`Priority ${num}...`}
              value={priorities[`priority_${num}` as keyof WeeklyPriority] as string || ''}
              onChange={(e) => handlePriorityChange(num as 1 | 2 | 3, e.target.value)}
              className={`flex-1 ${priorities[`priority_${num}_completed` as keyof WeeklyPriority] ? 'line-through text-gray-500' : ''}`}
            />
          </div>
        ))}
        
        <div className="pt-2">
          <Button
            onClick={savePriorities}
            disabled={isSaving}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isSaving ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">{isSaving ? 'Saving...' : 'Save Priorities'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyPriorities;
