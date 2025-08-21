import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSchema, insertWorkoutExerciseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let exercises;
      if (search) {
        exercises = await storage.searchExercises(search as string);
      } else if (category && category !== 'all') {
        exercises = await storage.getExercisesByCategory(category as string);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts();
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  app.put("/api/workouts/:id", async (req, res) => {
    try {
      const updates = insertWorkoutSchema.partial().parse(req.body);
      const workout = await storage.updateWorkout(req.params.id, updates);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workout" });
    }
  });

  app.delete("/api/workouts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkout(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete workout" });
    }
  });

  // Workout exercise routes
  app.post("/api/workout-exercises", async (req, res) => {
    try {
      const workoutExerciseData = insertWorkoutExerciseSchema.parse(req.body);
      const workoutExercise = await storage.addExerciseToWorkout(workoutExerciseData);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });

  app.put("/api/workout-exercises/:id", async (req, res) => {
    try {
      const updates = insertWorkoutExerciseSchema.partial().parse(req.body);
      const workoutExercise = await storage.updateWorkoutExercise(req.params.id, updates);
      if (!workoutExercise) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      res.json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workout exercise" });
    }
  });

  app.delete("/api/workout-exercises/:id", async (req, res) => {
    try {
      const deleted = await storage.removeExerciseFromWorkout(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Workout exercise not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove exercise from workout" });
    }
  });

  // Statistics route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWorkoutStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
