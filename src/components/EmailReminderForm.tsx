
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const reminderFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  morningEnabled: z.boolean().default(false),
  morningTime: z.string().optional(),
  eveningEnabled: z.boolean().default(false),
  eveningTime: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderFormSchema>;

const EmailReminderForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  
  // Load saved values from Supabase
  const getSavedValues = async (): Promise<ReminderFormValues> => {
    if (!user) {
      return {
        email: '',
        morningEnabled: false,
        morningTime: '08:00',
        eveningEnabled: false,
        eveningTime: '20:00',
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('email_reminders')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const reminder = data[0];
        return {
          email: reminder.email,
          morningEnabled: reminder.is_morning,
          morningTime: reminder.is_morning ? reminder.reminder_time.substring(0, 5) : '08:00',
          eveningEnabled: reminder.is_evening,
          eveningTime: reminder.is_evening ? reminder.reminder_time.substring(0, 5) : '20:00',
        };
      }
      
      // If no reminders found, use default values
      return {
        email: user.email || '',
        morningEnabled: false,
        morningTime: '08:00',
        eveningEnabled: false,
        eveningTime: '20:00',
      };
    } catch (error) {
      console.error("Error loading reminder settings:", error);
      
      // Return defaults on error
      return {
        email: user?.email || '',
        morningEnabled: false,
        morningTime: '08:00',
        eveningEnabled: false,
        eveningTime: '20:00',
      };
    }
  };

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      email: '',
      morningEnabled: false,
      morningTime: '08:00',
      eveningEnabled: false,
      eveningTime: '20:00',
    },
  });

  // Load saved values
  useEffect(() => {
    if (user) {
      getSavedValues().then(values => {
        form.reset(values);
      });
    }
  }, [user]);

  const handleSubmit = async (values: ReminderFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if reminders already exist
      const { data, error: fetchError } = await supabase
        .from('email_reminders')
        .select('id')
        .eq('user_id', user.id);
        
      if (fetchError) throw fetchError;
      
      if (data && data.length > 0) {
        // Update existing reminders
        const reminderId = data[0].id;
        
        const { error: updateError } = await supabase
          .from('email_reminders')
          .update({
            email: values.email,
            reminder_time: values.morningEnabled ? values.morningTime : values.eveningTime,
            is_morning: values.morningEnabled,
            is_evening: values.eveningEnabled,
            is_active: values.morningEnabled || values.eveningEnabled
          })
          .eq('id', reminderId);
          
        if (updateError) throw updateError;
      } else {
        // Insert new reminders
        const { error: insertError } = await supabase
          .from('email_reminders')
          .insert([{
            user_id: user.id,
            email: values.email,
            reminder_time: values.morningEnabled ? values.morningTime : values.eveningTime,
            is_morning: values.morningEnabled,
            is_evening: values.eveningEnabled,
            is_active: values.morningEnabled || values.eveningEnabled
          }]);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Reminders saved",
        description: "Your email reminder settings have been saved.",
      });
    } catch (error: any) {
      console.error("Error saving reminder settings:", error);
      toast({
        title: "Error saving",
        description: "There was a problem saving your reminder settings.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormDescription>
                This is where we'll send your reflection reminders.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 pt-2">
          {/* Morning reminder */}
          <div className="space-y-2 border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <h3 className="text-base font-medium">Morning Reminder</h3>
              </div>
              <FormField
                control={form.control}
                name="morningEnabled"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {form.watch("morningEnabled") && (
              <FormField
                control={form.control}
                name="morningTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <React.Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {hour.toString().padStart(2, '0')}:30
                            </SelectItem>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          {/* Evening reminder */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                <h3 className="text-base font-medium">Evening Reminder</h3>
              </div>
              <FormField
                control={form.control}
                name="eveningEnabled"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            {form.watch("eveningEnabled") && (
              <FormField
                control={form.control}
                name="eveningTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <React.Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {hour.toString().padStart(2, '0')}:00
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {hour.toString().padStart(2, '0')}:30
                            </SelectItem>
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-teal-400 hover:bg-teal-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Reminder Settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailReminderForm;
