import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { groupWorkoutsByDate, formatDuration } from "@/lib/workout-utils";
import type { Workout } from "@shared/schema";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: workouts, isLoading } = useQuery<Workout[]>({
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const workoutsByDate = workouts ? groupWorkoutsByDate(workouts) : {};

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      days.push(
        <div key={`prev-${day}`} className="aspect-square p-2 text-sm text-slate-400">
          {day}
        </div>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toDateString();
      const dayWorkouts = workoutsByDate[dateString] || [];
      const isToday = new Date().toDateString() === dateString;
      
      days.push(
        <div
          key={day}
          className={`aspect-square p-2 text-sm hover:bg-slate-50 rounded-lg cursor-pointer relative ${
            isToday ? "bg-primary text-white" : ""
          }`}
        >
          <span>{day}</span>
          {dayWorkouts.length > 0 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
              {dayWorkouts.slice(0, 3).map((workout, index) => (
                <div
                  key={workout.id}
                  className={`w-1.5 h-1.5 rounded-full ${
                    isToday ? "bg-white" : getWorkoutDotColor(index)
                  }`}
                />
              ))}
              {dayWorkouts.length > 3 && (
                <div className={`w-1.5 h-1.5 rounded-full ${isToday ? "bg-white" : "bg-slate-400"}`} />
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Next month's leading days
    const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="aspect-square p-2 text-sm text-slate-400">
          {day}
        </div>
      );
    }
    
    return days;
  };

  const getWorkoutDotColor = (index: number) => {
    const colors = ["bg-primary", "bg-secondary", "bg-accent"];
    return colors[index % colors.length];
  };

  const getCurrentMonthStats = () => {
    if (!workouts) return { workouts: 0, avgPerWeek: 0, longestStreak: 0 };
    
    const currentMonthWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate.getMonth() === month && workoutDate.getFullYear() === year;
    });
    
    const weeksInMonth = Math.ceil((firstDayOfWeek + daysInMonth) / 7);
    const avgPerWeek = currentMonthWorkouts.length / weeksInMonth;
    
    return {
      workouts: currentMonthWorkouts.length,
      avgPerWeek: parseFloat(avgPerWeek.toFixed(1)),
      longestStreak: stats?.currentStreak || 0,
    };
  };

  const monthStats = getCurrentMonthStats();

  if (isLoading || statsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Workout Calendar</h2>
        <p className="text-slate-600">View your workout history and patterns</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {MONTHS[month]} {year}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousMonth}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-slate-600">Strength Training</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <span className="text-slate-600">Cardio</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-slate-600">Yoga/Flexibility</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-slate-600">This Month</p>
                <p className="text-3xl font-bold text-primary">{monthStats.workouts}</p>
                <p className="text-sm text-slate-600">Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-secondary" />
              <div>
                <p className="text-sm text-slate-600">Average per Week</p>
                <p className="text-3xl font-bold text-secondary">{monthStats.avgPerWeek}</p>
                <p className="text-sm text-slate-600">Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm text-slate-600">Current Streak</p>
                <p className="text-3xl font-bold text-accent">{monthStats.longestStreak}</p>
                <p className="text-sm text-slate-600">Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
