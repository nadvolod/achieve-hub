
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Flame, Trophy, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StreakDisplay: React.FC = () => {
  const { currentStreak, bestStreak, goalsAchieved, updateStreak } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Force the streak to update when the component mounts, but only once
  useEffect(() => {
    if (!isInitialized) {
      const updateStreakData = async () => {
        try {
          console.log("StreakDisplay: Updating streak data");
          await updateStreak();
          setIsInitialized(true);
        } catch (error) {
          console.error("Error updating streak in StreakDisplay:", error);
          setIsInitialized(true); // Set to true even on error to prevent infinite retries
        }
      };
      
      updateStreakData();
    }
  }, [updateStreak, isInitialized]);

  return (
    <div className="mb-6">
      <Card className="bg-white shadow">
        <CardHeader className="pb-2 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-navy-700">Your Streak</CardTitle>
            <CardDescription>Keep the momentum going!</CardDescription>
          </div>
          <Check className="h-5 w-5 text-teal-500" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 min-h-[60px]">
              <Flame className="h-6 w-6 text-orange-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Current</p>
                <p className="text-2xl font-bold text-navy-700">{currentStreak} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-h-[60px]">
              <Trophy className="h-6 w-6 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Best</p>
                <p className="text-2xl font-bold text-navy-700">{bestStreak} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-h-[60px]">
              <Target className="h-6 w-6 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">Goals</p>
                <p className="text-2xl font-bold text-navy-700">{goalsAchieved}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDisplay;
