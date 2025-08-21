import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'strength', 'cardio', 'yoga', 'flexibility'
  targetMuscles: text("target_muscles").array().notNull().default(sql`'{}'::text[]`),
  description: text("description"),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  date: timestamp("date").notNull().default(sql`CURRENT_TIMESTAMP`),
  duration: integer("duration"), // in minutes
  notes: text("notes"),
  caloriesBurned: integer("calories_burned"),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").notNull().references(() => workouts.id),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"), // in pounds
  distance: integer("distance"), // in meters for cardio
  time: integer("time"), // in seconds for time-based exercises
  notes: text("notes"),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;

export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
};
