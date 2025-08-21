import { type Exercise, type InsertExercise, type Workout, type InsertWorkout, type WorkoutExercise, type InsertWorkoutExercise, type WorkoutWithExercises } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  searchExercises(query: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;

  // Workout operations
  getWorkouts(): Promise<Workout[]>;
  getWorkout(id: string): Promise<WorkoutWithExercises | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: string, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  deleteWorkout(id: string): Promise<boolean>;

  // Workout exercise operations
  addExerciseToWorkout(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  removeExerciseFromWorkout(id: string): Promise<boolean>;
  updateWorkoutExercise(id: string, updates: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined>;

  // Statistics
  getWorkoutStats(): Promise<{
    totalWorkouts: number;
    totalTime: number;
    totalCalories: number;
    currentStreak: number;
    workoutsThisMonth: number;
  }>;
}

export class MemStorage implements IStorage {
  private exercises: Map<string, Exercise>;
  private workouts: Map<string, Workout>;
  private workoutExercises: Map<string, WorkoutExercise>;

  constructor() {
    this.exercises = new Map();
    this.workouts = new Map();
    this.workoutExercises = new Map();
    
    // Initialize with common exercises
    this.initializeExercises();
  }

  private initializeExercises() {
    const commonExercises: Omit<Exercise, 'id'>[] = [
      { name: "Push-ups", category: "strength", targetMuscles: ["chest", "triceps", "shoulders"], description: "Bodyweight chest exercise" },
      { name: "Pull-ups", category: "strength", targetMuscles: ["back", "biceps"], description: "Bodyweight back exercise" },
      { name: "Squats", category: "strength", targetMuscles: ["legs", "glutes"], description: "Bodyweight leg exercise" },
      { name: "Deadlift", category: "strength", targetMuscles: ["back", "legs", "glutes"], description: "Compound strength exercise" },
      { name: "Bench Press", category: "strength", targetMuscles: ["chest", "triceps", "shoulders"], description: "Chest pressing exercise" },
      { name: "Running", category: "cardio", targetMuscles: ["legs", "core"], description: "Cardiovascular exercise" },
      { name: "Cycling", category: "cardio", targetMuscles: ["legs"], description: "Low-impact cardio" },
      { name: "Burpees", category: "cardio", targetMuscles: ["full body"], description: "High-intensity full body exercise" },
      { name: "Planks", category: "strength", targetMuscles: ["core"], description: "Core stability exercise" },
      { name: "Mountain Climbers", category: "cardio", targetMuscles: ["core", "legs"], description: "Dynamic core exercise" },
      { name: "Yoga Flow", category: "yoga", targetMuscles: ["full body"], description: "Flowing yoga sequence" },
      { name: "Warrior Pose", category: "yoga", targetMuscles: ["legs", "core"], description: "Standing yoga pose" },
      { name: "Downward Dog", category: "yoga", targetMuscles: ["shoulders", "back", "legs"], description: "Inverted yoga pose" },
      { name: "Hamstring Stretch", category: "flexibility", targetMuscles: ["hamstrings"], description: "Leg flexibility" },
      { name: "Shoulder Stretch", category: "flexibility", targetMuscles: ["shoulders"], description: "Upper body flexibility" },
    ];

    commonExercises.forEach(exercise => {
      const id = randomUUID();
      this.exercises.set(id, { ...exercise, id });
    });
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      exercise => exercise.category === category
    );
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(
      exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.description?.toLowerCase().includes(searchTerm) ||
        exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchTerm))
    );
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getWorkouts(): Promise<Workout[]> {
    return Array.from(this.workouts.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getWorkout(id: string): Promise<WorkoutWithExercises | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;

    const exercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === id)
      .map(we => ({
        ...we,
        exercise: this.exercises.get(we.exerciseId)!
      }));

    return { ...workout, exercises };
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = { 
      ...insertWorkout, 
      id,
      date: insertWorkout.date || new Date()
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async updateWorkout(id: string, updates: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;

    const updatedWorkout = { ...workout, ...updates };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const deleted = this.workouts.delete(id);
    // Also delete associated workout exercises
    Array.from(this.workoutExercises.entries())
      .filter(([_, we]) => we.workoutId === id)
      .forEach(([weId, _]) => this.workoutExercises.delete(weId));
    return deleted;
  }

  async addExerciseToWorkout(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = randomUUID();
    const workoutExercise: WorkoutExercise = { ...insertWorkoutExercise, id };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async removeExerciseFromWorkout(id: string): Promise<boolean> {
    return this.workoutExercises.delete(id);
  }

  async updateWorkoutExercise(id: string, updates: Partial<InsertWorkoutExercise>): Promise<WorkoutExercise | undefined> {
    const workoutExercise = this.workoutExercises.get(id);
    if (!workoutExercise) return undefined;

    const updated = { ...workoutExercise, ...updates };
    this.workoutExercises.set(id, updated);
    return updated;
  }

  async getWorkoutStats(): Promise<{
    totalWorkouts: number;
    totalTime: number;
    totalCalories: number;
    currentStreak: number;
    workoutsThisMonth: number;
  }> {
    const workouts = Array.from(this.workouts.values());
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalWorkouts = workouts.length;
    const totalTime = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const workoutsThisMonth = workouts.filter(w => new Date(w.date) >= startOfMonth).length;

    // Calculate current streak
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else if (daysDiff === currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
      
      currentDate = new Date(workoutDate);
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return {
      totalWorkouts,
      totalTime,
      totalCalories,
      currentStreak,
      workoutsThisMonth
    };
  }
}

export const storage = new MemStorage();
