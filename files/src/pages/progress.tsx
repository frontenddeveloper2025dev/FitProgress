import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Clock, Zap, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/stats-card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDuration } from "@/lib/workout-utils";
import type { Workout } from "@shared/schema";

export default function Progress() {
  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalWorkouts: number;
    totalTime: number;
    totalCalories: number;
    currentStreak: number;
    workoutsThisMonth: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const generateFrequencyData = () => {
    if (!workouts) return [];
    
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    
    const weeklyData = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(fourWeeksAgo.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekWorkouts = workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekStart && workoutDate < weekEnd;
      });
      
      weeklyData.push({
        week: `Week ${i + 1}`,
        workouts: weekWorkouts.length,
      });
    }
    
    return weeklyData;
  };

  const generateWeightProgressData = () => {
    // Mock data for weight progression
    return [
      { month: "Jan", weight: 135 },
      { month: "Feb", weight: 145 },
      { month: "Mar", weight: 155 },
      { month: "Apr", weight: 165 },
      { month: "May", weight: 175 },
      { month: "Jun", weight: 185 },
    ];
  };

  const getPersonalRecords = () => {
    if (!workouts) return [];
    
    // Mock personal records data
    return [
      {
        exercise: "Bench Press",
        value: "185 lbs",
        date: "Dec 18, 2024",
        icon: "💪",
        color: "text-primary",
      },
      {
        exercise: "Squat",
        value: "225 lbs",
        date: "Dec 16, 2024",
        icon: "🦵",
        color: "text-secondary",
      },
      {
        exercise: "5K Run",
        value: "22:15",
        date: "Dec 14, 2024",
        icon: "🏃‍♂️",
        color: "text-accent",
      },
      {
        exercise: "Deadlift",
        value: "275 lbs",
        date: "Dec 12, 2024",
        icon: "🏋️‍♂️",
        color: "text-purple-500",
      },
      {
        exercise: "Plank Hold",
        value: "3:45",
        date: "Dec 10, 2024",
        icon: "🧘‍♂️",
        color: "text-green-500",
      },
      {
        exercise: "Pull-ups",
        value: "15 reps",
        date: "Dec 8, 2024",
        icon: "💪",
        color: "text-blue-500",
      },
    ];
  };

  const frequencyData = generateFrequencyData();
  const weightData = generateWeightProgressData();
  const personalRecords = getPersonalRecords();

  const getProgressTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `↗ +${Math.round(change)}%` : `↘ ${Math.round(change)}%`;
  };

  if (workoutsLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Progress Tracking</h2>
        <p className="text-slate-600">Visualize your fitness journey and achievements</p>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Frequency Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Workout Frequency</CardTitle>
              <Select defaultValue="30days">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="workouts"
                  stroke="hsl(217.5 91.2% 59.8%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(217.5 91.2% 59.8%)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weight Progress Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weight Progress</CardTitle>
              <Select defaultValue="bench">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bench">Bench Press</SelectItem>
                  <SelectItem value="squat">Squat</SelectItem>
                  <SelectItem value="deadlift">Deadlift</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(159.4 86.5% 45.1%)"
                  fill="hsl(159.4 86.5% 45.1% / 0.1)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Workouts"
          value={stats?.totalWorkouts || 0}
          subtitle="All time"
          icon={Zap}
          trend={getProgressTrend(stats?.totalWorkouts || 0, Math.max(1, (stats?.totalWorkouts || 0) - 10))}
          iconColor="text-primary"
        />
        
        <StatsCard
          title="Total Time"
          value={stats?.totalTime ? formatDuration(stats.totalTime) : "0h"}
          subtitle="Hours trained"
          icon={Clock}
          trend={getProgressTrend(stats?.totalTime || 0, Math.max(1, (stats?.totalTime || 0) - 5))}
          iconColor="text-secondary"
        />
        
        <StatsCard
          title="Avg Duration"
          value={stats?.totalWorkouts && stats?.totalTime 
            ? formatDuration(Math.round(stats.totalTime / stats.totalWorkouts))
            : "0m"
          }
          subtitle="Per workout"
          icon={TrendingUp}
          trend="↗ +8%"
          iconColor="text-accent"
        />
        
        <StatsCard
          title="Calories Burned"
          value={stats?.totalCalories?.toLocaleString() || 0}
          subtitle="Total burned"
          icon={Heart}
          trend="↗ +31%"
          iconColor="text-red-500"
        />
      </div>

      {/* Personal Records */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalRecords.map((record, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${record.color.replace('text-', 'bg-')}/10`}>
                  <span className="text-2xl">{record.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{record.exercise}</p>
                  <p className={`text-2xl font-bold ${record.color} mb-1`}>
                    {record.value}
                  </p>
                  <p className="text-xs text-slate-500">Set on {record.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
