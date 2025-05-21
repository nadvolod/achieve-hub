
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Flame, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StreakDisplay: React.FC = () => {
  const { currentStreak, bestStreak, updateStreak } = useAuth();

  // Force the streak to update when the component mounts but don't set state
  useEffect(() => {
    const updateStreakData = async () => {
      try {
        console.log("StreakDisplay: Updating streak data");
        await updateStreak();
      } catch (error) {
        console.error("Error updating streak in StreakDisplay:", error);
      }
    };
    
    updateStreakData();
    
    // No need for interval refreshing - we'll update when needed
  }, [updateStreak]);

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
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Current</p>
                <p className="text-2xl font-bold text-navy-700">{currentStreak} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              <div>
                <p className="text-sm text-gray-500">Best</p>
                <p className="text-2xl font-bold text-navy-700">{bestStreak} days</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakDisplay;
