import { Workout, WorkoutWithExercises } from "@shared/schema";

export const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getWorkoutSummary = (workout: WorkoutWithExercises) => {
  const exerciseCount = workout.exercises.length;
  const duration = workout.duration ? formatDuration(workout.duration) : "No duration";
  
  return {
    exerciseCount,
    duration,
    categories: [...new Set(workout.exercises.map(e => e.exercise.category))],
  };
};

export const calculateCalories = (exercises: any[]) => {
  // Basic calorie estimation
  let calories = 0;
  exercises.forEach(exercise => {
    const category = exercise.exercise.category;
    const duration = exercise.time ? exercise.time / 60 : 30; // Default 30 minutes if not specified
    
    switch (category) {
      case "strength":
        calories += duration * 8; // ~8 calories per minute
        break;
      case "cardio":
        calories += duration * 12; // ~12 calories per minute
        break;
      case "yoga":
        calories += duration * 4; // ~4 calories per minute
        break;
      case "flexibility":
        calories += duration * 2; // ~2 calories per minute
        break;
      default:
        calories += duration * 6;
    }
  });
  
  return Math.round(calories);
};

export const getWorkoutIntensity = (exercises: any[]) => {
  const categories = exercises.map(e => e.exercise.category);
  const strengthCount = categories.filter(c => c === "strength").length;
  const cardioCount = categories.filter(c => c === "cardio").length;
  
  if (cardioCount > strengthCount) return "High";
  if (strengthCount > 2) return "Medium";
  return "Low";
};

export const groupWorkoutsByDate = (workouts: Workout[]) => {
  const grouped: { [key: string]: Workout[] } = {};
  
  workouts.forEach(workout => {
    const date = new Date(workout.date).toDateString();
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(workout);
  });
  
  return grouped;
};

export const getStreakCount = (workouts: Workout[]) => {
  if (workouts.length === 0) return 0;
  
  const sortedWorkouts = workouts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.date);
    workoutDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor(
      (currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff === streak + 1) {
      streak++;
    } else {
      break;
    }
    
    currentDate = new Date(workoutDate);
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
};
