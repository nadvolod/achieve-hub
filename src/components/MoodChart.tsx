
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MoodChartProps {
  moodData: { date: string; mood: number }[];
}

const MoodChart: React.FC<MoodChartProps> = ({ moodData }) => {
  if (moodData.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg text-navy-500">Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            No mood data yet. Start tracking your mood to see trends!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = moodData.map(item => ({
    ...item,
    formattedDate: format(parseISO(item.date), 'MMM dd')
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const moodLabels = {
        1: "Very Poor 😔",
        2: "Poor 😞", 
        3: "Okay 😐",
        4: "Good 😊",
        5: "Excellent 😄"
      };
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-teal-600">
            Mood: {moodLabels[payload[0].value as keyof typeof moodLabels]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg text-navy-500">Mood Trend</CardTitle>
        <p className="text-sm text-gray-600">Track how your mood changes over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[1, 5]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  const labels = { 1: '😔', 2: '😞', 3: '😐', 4: '😊', 5: '😄' };
                  return labels[value as keyof typeof labels] || value;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#14b8a6" 
                strokeWidth={3}
                dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#0d9488' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodChart;
