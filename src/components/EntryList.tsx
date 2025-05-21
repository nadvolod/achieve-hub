
import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon } from "lucide-react";
import { useQuestions, Entry } from "../context/QuestionsContext";
import { formatDate, groupEntriesByMonth } from "../utils/questionsUtils";
import QuestionCard from "./QuestionCard";

interface EntryListProps {
  selectedDate?: string;
}

const EntryList: React.FC<EntryListProps> = ({ selectedDate }) => {
  const { entries, getEntries, refreshEntries } = useQuestions();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [displayEntries, setDisplayEntries] = useState<Entry[]>([]);
  
  // Force refresh entries when component mounts or when dependencies change
  useEffect(() => {
    console.log("EntryList: Forcing refresh of entries");
    refreshEntries();
  }, [refreshEntries]);
  
  // Update displayEntries when entries or selectedDate changes
  useEffect(() => {
    console.log("EntryList: Updating display entries", { 
      selectedDate, 
      entriesCount: entries.length 
    });
    
    if (selectedDate) {
      // If a date is selected, get entries for that date
      const filteredEntries = getEntries(selectedDate);
      console.log("EntryList: Filtered entries for date", { 
        date: selectedDate, 
        count: filteredEntries.length 
      });
      setDisplayEntries(filteredEntries);
    } else {
      // If no date is selected, use all entries
      console.log("EntryList: Using all entries", { count: entries.length });
      setDisplayEntries([...entries]);
    }
  }, [selectedDate, entries, getEntries]);
  
  // Simply use displayEntries for rendering, it already contains the right data
  const filteredEntries = displayEntries;
  
  // Group entries by month for accordion view
  const groupedEntries = groupEntriesByMonth(filteredEntries);
  
  if (entries.length === 0) {
    return (
      <Card className="text-center p-8 my-6">
        <CardContent className="text-gray-500">
          You haven't recorded any entries yet.
        </CardContent>
      </Card>
    );
  }
  
  if (filteredEntries.length === 0) {
    return (
      <Card className="text-center p-8 my-6">
        <CardContent className="text-gray-500">
          No entries found for the selected date.
        </CardContent>
      </Card>
    );
  }
  
  // Show single or multiple entries when a date is selected
  if (selectedDate && filteredEntries.length > 0) {
    return (
      <div className="space-y-6 my-6">
        <h3 className="text-xl font-medium text-navy-500">
          {formatDate(selectedDate)}
        </h3>
        
        {filteredEntries.map(entry => (
          <Card key={entry.id} className="mb-6 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  {entry.type === 'morning' ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>Morning Reflection</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span>Evening Reflection</span>
                    </>
                  )}
                </CardTitle>
                <Badge variant="outline" className={entry.type === 'morning' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}>
                  {formatDate(entry.date).split(', ')[1]} 
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {entry.answers.map(answer => (
                  <div key={answer.questionId} className="mb-4 last:mb-0">
                    <h4 className="text-sm font-medium text-gray-800 mb-1">{answer.questionText}</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{answer.answer || "No answer provided"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If no specific date selected, show the accordion list of all entries
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <Accordion type="single" collapsible className="w-full">
        {Object.entries(groupedEntries).map(([month, monthEntries]) => (
          <AccordionItem key={month} value={month}>
            <AccordionTrigger className="text-navy-500 hover:text-navy-700 font-medium">
              {month} ({monthEntries.length} entries)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {monthEntries.map(entry => (
                  <Card 
                    key={entry.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer
                      ${expandedEntry === entry.id ? 'ring-1 ring-teal-400' : ''}`}
                    onClick={() => {
                      setExpandedEntry(expandedEntry === entry.id ? null : entry.id);
                    }}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm font-medium flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {entry.type === 'morning' ? (
                            <Sun className="h-4 w-4 text-amber-500" />
                          ) : (
                            <Moon className="h-4 w-4 text-indigo-500" />
                          )}
                          <span>{formatDate(entry.date)}</span>
                        </div>
                        <Badge variant="outline" className={entry.type === 'morning' ? 'bg-amber-50 text-amber-600 text-xs' : 'bg-indigo-50 text-indigo-600 text-xs'}>
                          {entry.type === 'morning' ? 'Morning' : 'Evening'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    
                    {expandedEntry === entry.id && (
                      <CardContent className="p-3 pt-0">
                        {entry.answers.map(answer => (
                          <div key={answer.questionId} className="mb-3 last:mb-0">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">{answer.questionText}</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{answer.answer || "No answer provided"}</p>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
};

export default EntryList;
