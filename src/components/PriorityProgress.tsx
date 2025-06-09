
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface PriorityProgressProps {
  priorityText: string;
  progress: number;
  onProgressChange: (progress: number) => void;
  disabled?: boolean;
}

const PriorityProgress: React.FC<PriorityProgressProps> = ({
  priorityText,
  progress,
  onProgressChange,
  disabled = false
}) => {
  // Extract numbers from the priority text
  const extractNumberInfo = (text: string) => {
    // Look for patterns like "10 positions", "$500", "5 calls", etc.
    const patterns = [
      /(\d+)\s*(positions?|applications?|calls?|meetings?|hours?|days?|weeks?|months?|times?|people?|companies?|interviews?|emails?)/i,
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|usd|euros?|pounds?)/i,
      /(\d+)\s*(?:of|out of|\/)\s*(\d+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const number = parseInt(match[1].replace(/,/g, ''));
        const isMoney = text.includes('$') || /dollars?|usd|euros?|pounds?/i.test(text);
        return { target: number, isMoney, unit: match[2] || '' };
      }
    }
    return null;
  };

  const numberInfo = extractNumberInfo(priorityText);

  if (!numberInfo) {
    return null; // No number detected, no progress tracking needed
  }

  const { target, isMoney, unit } = numberInfo;
  const percentage = Math.min((progress / target) * 100, 100);

  // For small numbers (≤10), use individual checkboxes
  if (target <= 10 && !isMoney) {
    return (
      <div className="mt-2 space-y-2">
        <div className="text-sm text-gray-600 mb-2">
          Progress: {progress}/{target} {unit}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: target }, (_, index) => (
            <div key={index} className="flex items-center space-x-1">
              <Checkbox
                id={`progress-${index}`}
                checked={index < progress}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onProgressChange(Math.max(progress, index + 1));
                  } else {
                    onProgressChange(Math.min(progress, index));
                  }
                }}
                disabled={disabled}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label htmlFor={`progress-${index}`} className="text-xs text-gray-500">
                {index + 1}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For larger numbers or monetary values, use a slider with progress bar
  return (
    <div className="mt-2 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Progress: {isMoney ? `$${progress.toLocaleString()}` : progress}/{isMoney ? `$${target.toLocaleString()}` : target} {!isMoney ? unit : ''}
        </span>
        <span className="text-sm font-medium text-purple-600">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <Slider
        value={[progress]}
        onValueChange={(value) => onProgressChange(value[0])}
        max={target}
        min={0}
        step={isMoney ? (target > 1000 ? 50 : 10) : 1}
        disabled={disabled}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>{isMoney ? `$${target.toLocaleString()}` : target}</span>
      </div>
    </div>
  );
};

export default PriorityProgress;
