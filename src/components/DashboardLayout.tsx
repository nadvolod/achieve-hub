
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Grid, List, Target, TrendingUp, Calendar } from "lucide-react";
import StreakDisplay from "./StreakDisplay";
import WeeklyPriorities from "./WeeklyPriorities";
import MoodChart from "./MoodChart";
import { useQuestions } from "../context/QuestionsContext";

interface DashboardLayoutProps {
  formattedDate: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onViewModeChange: (mode: 'dashboard' | 'single' | 'list') => void;
  onRefresh: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  formattedDate,
  activeTab,
  onTabChange,
  onViewModeChange,
  onRefresh
}) => {
  const { getMoodTrend } = useQuestions();
  const moodTrend = getMoodTrend();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-navy-500 mb-1">Achieve Hub</h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </p>
            </div>
            <Button 
              onClick={onRefresh} 
              variant="outline" 
              size="sm"
              className="text-teal-500 border-teal-300 hover:bg-teal-50"
            >
              Refresh
            </Button>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={onTabChange} 
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="morning" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>Morning</span>
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Evening</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Streaks & Priorities */}
          <div className="space-y-4">
            <StreakDisplay />
            <WeeklyPriorities />
          </div>

          {/* Middle Column - Mood Chart */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Mood Trend</h3>
              </div>
              <MoodChart moodData={moodTrend} />
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => onViewModeChange('single')}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-2 justify-center"
                  size="lg"
                >
                  <Grid className="h-5 w-5" />
                  Start {activeTab === 'morning' ? 'Morning' : 'Evening'} Questions
                </Button>
                
                <Button
                  onClick={() => onViewModeChange('list')}
                  variant="outline"
                  className="w-full border-teal-300 text-teal-600 hover:bg-teal-50 flex items-center gap-2 justify-center"
                  size="lg"
                >
                  <List className="h-5 w-5" />
                  View All Questions
                </Button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Today's Focus</h4>
                <p className="text-sm text-gray-600">
                  Complete your {activeTab} reflection to maintain your streak and achieve your goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
