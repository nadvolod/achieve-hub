
import { useCallback, useRef, useEffect } from 'react';
import { useQuestions } from '../context/QuestionsContext';
import { useToast } from '@/hooks/use-toast';
import { getTodayDateString } from '../utils/questionsUtils';

interface UseAutoSaveProps {
  questionId: string;
  questionText: string;
  type: 'morning' | 'evening';
  onSaveSuccess?: () => void;
  onSaveError?: (error: any) => void;
}

export const useAutoSave = ({ 
  questionId, 
  questionText, 
  type, 
  onSaveSuccess, 
  onSaveError 
}: UseAutoSaveProps) => {
  const { saveEntry } = useQuestions();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedValue = useRef<string>('');
  const isSavingRef = useRef(false);

  const autoSave = useCallback(async (answer: string) => {
    // Don't save if already saving or if value hasn't changed
    if (isSavingRef.current || answer === lastSavedValue.current) {
      return;
    }

    // Don't save empty answers
    if (!answer.trim()) {
      return;
    }

    try {
      isSavingRef.current = true;
      
      await saveEntry({
        date: getTodayDateString(),
        type,
        answers: [{
          questionId,
          questionText,
          answer: answer.trim()
        }]
      });

      lastSavedValue.current = answer;
      onSaveSuccess?.();
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      onSaveError?.(error);
      
      // Show a subtle error toast
      toast({
        title: "Auto-save failed",
        description: "Your answer will be saved when you manually save.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [questionId, questionText, type, saveEntry, onSaveSuccess, onSaveError, toast]);

  const debouncedAutoSave = useCallback((answer: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      autoSave(answer);
    }, 1000); // 1 second delay
  }, [autoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedAutoSave,
    isAutoSaving: isSavingRef.current
  };
};
