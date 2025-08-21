import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Zap, Clock, BarChart3, Heart, Plus, TrendingUp, Calendar } from "lucide-react";
import StatsCard from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, getWorkoutSummary } from "@/lib/workout-utils";
import type { Workout, WorkoutWithExercises } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalWorkouts: number;
    totalTime: number;
    totalCalories: number;
    currentStreak: number;
    workoutsThisMonth: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: recentWorkouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
  });

  if (statsLoading || workoutsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const recentWorkoutList = recentWorkouts?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back!</h2>
        <p className="text-slate-600">
          Ready for today's workout? You're on a {stats?.currentStreak || 0}-day streak! 🔥
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Workouts This Month"
          value={stats?.workoutsThisMonth || 0}
          subtitle="Total sessions"
          icon={Zap}
          trend="↗ +12%"
          iconColor="text-primary"
        />
        
        <StatsCard
          title="Total Time"
          value={stats?.totalTime ? formatDuration(stats.totalTime) : "0h"}
          subtitle="Hours trained"
          icon={Clock}
          trend="↗ +5%"
          iconColor="text-secondary"
        />
        
        <StatsCard
          title="Calories Burned"
          value={stats?.totalCalories?.toLocaleString() || 0}
          subtitle="Total calories"
          icon={BarChart3}
          trend="↗ +8%"
          iconColor="text-accent"
        />
        
        <StatsCard
          title="Current Streak"
          value={stats?.currentStreak || 0}
          subtitle="Days in a row"
          icon={Heart}
          trend="↗ +3%"
          iconColor="text-red-500"
        />
      </div>

      {/* Recent Workouts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Workouts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Workouts</CardTitle>
                <Link href="/calendar">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentWorkoutList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">No workouts yet!</p>
                  <Link href="/log-workout">
                    <Button className="gradient-primary text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Log Your First Workout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentWorkoutList.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{workout.name}</p>
                        <p className="text-sm text-slate-600">
                          {workout.duration ? formatDuration(workout.duration) : "Duration not set"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(workout.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(workout.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/log-workout">
                <Button className="w-full gradient-primary text-white font-medium hover:shadow-md transition-all flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Start Workout</span>
                </Button>
              </Link>
              
              <Link href="/progress">
                <Button
                  variant="outline"
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>View Progress</span>
                </Button>
              </Link>
              
              <Link href="/calendar">
                <Button
                  variant="outline"
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>View Calendar</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Motivational Quote */}
          <Card className="mt-6 gradient-card border border-primary/10">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-700 italic">
                "The only bad workout is the one that didn't happen."
              </p>
              <p className="text-xs text-slate-500 mt-2">- Daily Motivation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
