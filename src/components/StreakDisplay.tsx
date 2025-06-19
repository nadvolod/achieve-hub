
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Flame, Trophy, Target, WifiOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StreakDisplay: React.FC = () => {
  const { currentStreak, bestStreak, goalsAchieved, updateStreak } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasConnectionError, setHasConnectionError] = useState(false);

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
    <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-l-4 border-l-teal-400">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-500 rounded-full p-2">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-teal-800">
                Your Progress
              </CardTitle>
              <CardDescription className="text-sm text-teal-600">
                {hasConnectionError ? "Working offline" : "Keep the momentum going!"}
              </CardDescription>
            </div>
          </div>
          {hasConnectionError && (
            <WifiOff className="h-4 w-4 text-amber-500" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-3 mx-auto mb-2 w-fit">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{currentStreak}</p>
            <p className="text-xs text-gray-600">Current Streak</p>
          </div>
          
          <div className="text-center">
            <div className="bg-amber-100 rounded-full p-3 mx-auto mb-2 w-fit">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{bestStreak}</p>
            <p className="text-xs text-gray-600">Best Streak</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 mx-auto mb-2 w-fit">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{goalsAchieved}</p>
            <p className="text-xs text-gray-600">Goals Hit</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakDisplay;
