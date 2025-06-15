
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

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
    // Look for patterns like "10 positions", "$500", "5 calls", "20 lbs", etc.
    const patterns = [
      // Money patterns: $5M, $500, $1,000, etc.
      /\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*([MmKk]?)(?:\s*(million|thousand|dollars?|usd|euros?|pounds?))?/i,
      // Weight patterns: 20 lbs, 10 kg, 87.8 kg etc.
      /(\d+(?:\.\d+)?)\s*(lbs?|pounds?|kg|kilograms?)/i,
      // General number patterns: 10 positions, 5 calls, 21 revenue generating actions, etc.
      /(\d+(?:\.\d+)?)\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)*\s*(?:positions?|applications?|calls?|meetings?|hours?|days?|weeks?|months?|times?|people?|companies?|interviews?|emails?|actions?|outreaches?|leads?|prospects?|demos?|posts?|articles?))/i,
      // Simple number patterns: 10 positions, 5 calls, etc.
      /(\d+(?:\.\d+)?)\s*(positions?|applications?|calls?|meetings?|hours?|days?|weeks?|months?|times?|people?|companies?|interviews?|emails?|actions?|outreaches?|leads?|prospects?|demos?|posts?|articles?)/i,
      // Fraction patterns: 5 of 10, 3/5, etc.
      /(\d+(?:\.\d+)?)\s*(?:of|out of|\/)\s*(\d+(?:\.\d+)?)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let number = parseFloat(match[1].replace(/,/g, ''));
        const isMoney = text.includes('$') || /dollars?|usd|euros?|pounds?/i.test(text);
        const isWeight = /lbs?|pounds?|kg|kilograms?/i.test(text);
        
        // Handle million/thousand suffixes ONLY for money, not for weight
        if (match[2] && /[MmKk]/.test(match[2]) && isMoney) {
          if (/[Mm]/.test(match[2])) {
            number = number * 1000000; // Million
          } else if (/[Kk]/.test(match[2])) {
            number = number * 1000; // Thousand
          }
        }
        
        return { 
          target: number, 
          isMoney, 
          isWeight,
          unit: isWeight ? match[2] : (match[3] || match[2] || ''),
          originalText: match[0]
        };
      }
    }
    return null;
  };

  const numberInfo = extractNumberInfo(priorityText);

  if (!numberInfo) {
    return null; // No number detected, no progress tracking needed
  }

  const { target, isMoney, isWeight, unit } = numberInfo;
  const percentage = Math.min((progress / target) * 100, 100);

  // Determine which type of progress tracker to show
  const shouldUseCheckboxes = target <= 10 && !isMoney && !isWeight && Number.isInteger(target);

  // For small numbers (≤10), use individual checkboxes, but not for money or weight
  if (shouldUseCheckboxes) {
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

  // For larger numbers, monetary values, or weight, use a slider with progress bar
  const formatDisplayValue = (value: number) => {
    if (isMoney) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      } else {
        return `$${value.toLocaleString()}`;
      }
    } else if (isWeight) {
      return `${value} ${unit}`;
    } else {
      return `${value}`;
    }
  };

  const formatTargetValue = (value: number) => {
    if (isMoney) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      } else {
        return `$${value.toLocaleString()}`;
      }
    } else if (isWeight) {
      return `${value} ${unit}`;
    } else {
      return `${value}`;
    }
  };

  // Determine step size based on the target value
  const getStepSize = () => {
    if (isMoney) {
      if (target >= 1000000) return 50000; // $50K steps for millions
      else if (target >= 100000) return 5000; // $5K steps for hundreds of thousands
      else if (target >= 10000) return 1000; // $1K steps for tens of thousands
      else return 100; // $100 steps for smaller amounts
    } else if (isWeight) {
      return 0.1; // 0.1 lb/kg steps for weight to preserve decimals
    } else {
      return 1; // 1 unit steps for other metrics
    }
  };

  return (
    <div className="mt-2 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Progress: {formatDisplayValue(progress)}/{formatTargetValue(target)}
        </span>
        <span className="text-sm font-medium text-purple-600">
          {Math.round(percentage)}%
        </span>
      </div>
      
      <div className="space-y-2">
        <Slider
          value={[progress]}
          onValueChange={(value) => onProgressChange(value[0])}
          max={target}
          min={0}
          step={getStepSize()}
          disabled={disabled}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span>{formatTargetValue(target)}</span>
      </div>
    </div>
  );
};

export default PriorityProgress;
