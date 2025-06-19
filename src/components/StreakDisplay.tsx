
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Flame, Trophy, Target, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StreakDisplay: React.FC = () => {
  const { currentStreak, bestStreak, goalsAchieved, updateStreak } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  // Force the streak to update when the component mounts, but only once
  useEffect(() => {
    if (!isInitialized) {
      const updateStreakData = async () => {
        try {
          console.log("StreakDisplay: Updating streak data");
          await updateStreak();
          setIsInitialized(true);
          setHasConnectionError(false);
        } catch (error) {
          console.error("Error updating streak in StreakDisplay:", error);
          setIsInitialized(true);
          setHasConnectionError(true);
        }
      };
      
      updateStreakData();
    }
  }, [updateStreak, isInitialized]);

  return (
    <Card className="bg-white shadow">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-base font-medium text-navy-700 flex items-center gap-2">
            Your Streak
            {hasConnectionError && (
              <WifiOff className="h-3 w-3 text-amber-500" />
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            {hasConnectionError ? "Working in offline mode" : "Keep the momentum going!"}
          </CardDescription>
        </div>
        <Check className="h-4 w-4 text-teal-500" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Current</p>
              <p className="text-lg font-bold text-navy-700">{currentStreak}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Best</p>
              <p className="text-lg font-bold text-navy-700">{bestStreak}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Goals</p>
              <p className="text-lg font-bold text-navy-700">{goalsAchieved}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
