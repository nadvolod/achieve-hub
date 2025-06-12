
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MoodTrackerProps {
  mood?: number;
  onMoodChange: (mood: number) => void;
  type: 'morning' | 'evening';
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ mood, onMoodChange, type }) => {
  const moodLabels = {
    1: "😔 Very Poor",
    2: "😞 Poor", 
    3: "😐 Okay",
    4: "😊 Good",
    5: "😄 Excellent"
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-navy-500">
          How are you feeling {type === 'morning' ? 'this morning' : 'this evening'}?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={mood?.toString()} 
          onValueChange={(value) => onMoodChange(parseInt(value))}
          className="space-y-2"
        >
          {Object.entries(moodLabels).map(([value, label]) => (
            <div key={value} className="flex items-center space-x-2">
              <RadioGroupItem value={value} id={`mood-${value}`} />
              <Label 
                htmlFor={`mood-${value}`} 
                className="text-sm cursor-pointer flex-1 py-1"
              >
                {label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
