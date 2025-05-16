
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuestions, Entry } from "../context/QuestionsContext";
import { formatDate, groupEntriesByMonth } from "../utils/questionsUtils";
import QuestionCard from "./QuestionCard";

interface EntryListProps {
  selectedDate?: string;
}

const EntryList: React.FC<EntryListProps> = ({ selectedDate }) => {
  const { entries } = useQuestions();
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  
  // Filter entries if a date is selected
  const filteredEntries = selectedDate 
    ? entries.filter(entry => entry.date.startsWith(selectedDate)) 
    : entries;
  
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
  
  // Show single entry when a date is selected
  if (selectedDate && filteredEntries.length === 1) {
    const entry = filteredEntries[0];
    return (
      <div className="space-y-4 my-6">
        <h3 className="text-xl font-medium text-navy-500">
          {formatDate(entry.date)}
        </h3>
        {entry.answers.map(answer => (
          <QuestionCard
            key={answer.questionId}
            question={{
              id: answer.questionId,
              text: answer.questionText,
              isMandatory: false, // We don't know in history view, doesn't affect display much
              isActive: true
            }}
            answer={answer.answer}
            onAnswerChange={() => {}} // Read-only
            readOnly={true}
          />
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
                      <CardTitle className="text-sm font-medium flex justify-between">
                        <span>{formatDate(entry.date)}</span>
                        <span className="text-gray-400 text-xs">{entry.answers.length} answers</span>
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
