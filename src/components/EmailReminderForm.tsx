
import React, { useState } from "react";
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
  
  // Load saved values from localStorage
  const getSavedValues = (): ReminderFormValues => {
    const savedValues = localStorage.getItem('emailReminders');
    if (savedValues) {
      return JSON.parse(savedValues);
    }
    return {
      email: '',
      morningEnabled: false,
      morningTime: '08:00',
      eveningEnabled: false,
      eveningTime: '20:00',
    };
  };

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: getSavedValues(),
  });

  const handleSubmit = (values: ReminderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('emailReminders', JSON.stringify(values));
      
      // In a real application, you would send this to a backend API
      // to schedule the emails, but for now we'll just simulate success
      
      toast({
        title: "Reminders saved",
        description: "Your email reminder settings have been saved.",
      });
    } catch (error) {
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
