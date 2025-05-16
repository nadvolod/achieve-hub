
import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useQuestions } from "../context/QuestionsContext";

interface DatePickerProps {
  onSelectDate: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ onSelectDate }) => {
  const { entries } = useQuestions();
  const [date, setDate] = useState<Date | undefined>();

  // Get dates that have entries
  const datesWithEntries = entries.map(entry => 
    new Date(entry.date).toISOString().split('T')[0]
  );

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      onSelectDate(newDate.toISOString().split('T')[0]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Select date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          modifiers={{
            hasEntry: (date) => {
              const dateStr = date.toISOString().split('T')[0];
              return datesWithEntries.includes(dateStr);
            },
          }}
          modifiersStyles={{
            hasEntry: {
              backgroundColor: "#ccefec",
              fontWeight: "bold",
            },
          }}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
