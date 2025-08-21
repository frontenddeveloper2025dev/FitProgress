import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Plus, X, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { exerciseCategories, getCategoryColor } from "@/lib/exercises";
import WorkoutTimer from "@/components/workout-timer";
import type { Exercise, InsertWorkout, InsertWorkoutExercise } from "@shared/schema";

const workoutSchema = z.object({
  name: z.string().min(1, "Workout name is required"),
  notes: z.string().optional(),
});

const exerciseSchema = z.object({
  sets: z.number().min(1).optional(),
  reps: z.number().min(1).optional(),
  weight: z.number().min(1).optional(),
  distance: z.number().min(1).optional(),
  time: z.number().min(1).optional(),
  notes: z.string().optional(),
});

type WorkoutForm = z.infer<typeof workoutSchema>;
type ExerciseForm = z.infer<typeof exerciseSchema>;

interface SelectedExercise {
  exercise: Exercise;
  data: ExerciseForm;
}

export default function LogWorkout() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const { toast } = useToast();

  const workoutForm = useForm<WorkoutForm>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      notes: "",
    },
  });

  const { data: exercises, isLoading } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises", { category: selectedCategory, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`/api/exercises?${params}`);
      if (!response.ok) throw new Error("Failed to fetch exercises");
      return response.json();
    },
  });

  const createWorkoutMutation = useMutation({
    mutationFn: async (data: { workout: InsertWorkout; exercises: (InsertWorkoutExercise & { exerciseId: string })[] }) => {
      const workoutResponse = await apiRequest("POST", "/api/workouts", data.workout);
      const workout = await workoutResponse.json();
      
      // Add exercises to workout
      for (const exercise of data.exercises) {
        await apiRequest("POST", "/api/workout-exercises", {
          ...exercise,
          workoutId: workout.id,
        });
      }
      
      return workout;
    },
    onSuccess: () => {
      toast({
        title: "Workout saved!",
        description: "Your workout has been logged successfully.",
      });
      
      // Reset form
      workoutForm.reset();
      setSelectedExercises([]);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addExercise = (exercise: Exercise) => {
    if (selectedExercises.some(se => se.exercise.id === exercise.id)) {
      toast({
        title: "Exercise already added",
        description: "This exercise is already in your workout.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedExercises(prev => [
      ...prev,
      { exercise, data: {} }
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(se => se.exercise.id !== exerciseId));
  };

  const updateExerciseData = (exerciseId: string, data: Partial<ExerciseForm>) => {
    setSelectedExercises(prev => prev.map(se => 
      se.exercise.id === exerciseId 
        ? { ...se, data: { ...se.data, ...data } }
        : se
    ));
  };

  const onSubmit = (data: WorkoutForm) => {
    if (selectedExercises.length === 0) {
      toast({
        title: "No exercises selected",
        description: "Please add at least one exercise to your workout.",
        variant: "destructive",
      });
      return;
    }

    const workoutData: InsertWorkout = {
      name: data.name,
      notes: data.notes,
      date: new Date(),
    };

    const exerciseData = selectedExercises.map(se => ({
      exerciseId: se.exercise.id,
      sets: se.data.sets,
      reps: se.data.reps,
      weight: se.data.weight,
      distance: se.data.distance,
      time: se.data.time,
      notes: se.data.notes,
    }));

    createWorkoutMutation.mutate({ workout: workoutData, exercises: exerciseData });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Log Workout</h2>
        <p className="text-slate-600">Track your exercises and progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exercise Search & Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {exerciseCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={
                      selectedCategory === category.id
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Exercise List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))
                ) : exercises?.length === 0 ? (
                  <p className="text-center text-slate-600 py-8">No exercises found</p>
                ) : (
                  exercises?.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(exercise.category)}`}>
                          <span className="text-sm font-medium">
                            {exercise.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{exercise.name}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {exercise.category}
                            </Badge>
                            <p className="text-sm text-slate-600">
                              {exercise.targetMuscles.join(", ")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addExercise(exercise)}
                        className="text-primary hover:text-primary/80"
                        variant="ghost"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Workout & Timer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...workoutForm}>
                <form onSubmit={workoutForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={workoutForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Upper Body Strength" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Selected Exercises */}
                  <div className="space-y-3">
                    {selectedExercises.map((selectedExercise) => (
                      <div key={selectedExercise.exercise.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-slate-900">
                            {selectedExercise.exercise.name}
                          </h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeExercise(selectedExercise.exercise.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Exercise metrics based on category */}
                        {selectedExercise.exercise.category === "strength" ? (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <Input
                              type="number"
                              placeholder="Sets"
                              value={selectedExercise.data.sets || ""}
                              onChange={(e) => updateExerciseData(
                                selectedExercise.exercise.id,
                                { sets: parseInt(e.target.value) || undefined }
                              )}
                            />
                            <Input
                              type="number"
                              placeholder="Reps"
                              value={selectedExercise.data.reps || ""}
                              onChange={(e) => updateExerciseData(
                                selectedExercise.exercise.id,
                                { reps: parseInt(e.target.value) || undefined }
                              )}
                            />
                            <Input
                              type="number"
                              placeholder="Weight"
                              value={selectedExercise.data.weight || ""}
                              onChange={(e) => updateExerciseData(
                                selectedExercise.exercise.id,
                                { weight: parseInt(e.target.value) || undefined }
                              )}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <Input
                              type="number"
                              placeholder="Duration (min)"
                              value={selectedExercise.data.time ? Math.round(selectedExercise.data.time / 60) : ""}
                              onChange={(e) => updateExerciseData(
                                selectedExercise.exercise.id,
                                { time: (parseInt(e.target.value) || 0) * 60 }
                              )}
                            />
                            <Input
                              type="number"
                              placeholder="Distance (mi)"
                              value={selectedExercise.data.distance || ""}
                              onChange={(e) => updateExerciseData(
                                selectedExercise.exercise.id,
                                { distance: parseInt(e.target.value) || undefined }
                              )}
                            />
                          </div>
                        )}
                        
                        <Textarea
                          placeholder="Notes..."
                          value={selectedExercise.data.notes || ""}
                          onChange={(e) => updateExerciseData(
                            selectedExercise.exercise.id,
                            { notes: e.target.value }
                          )}
                          className="h-16 resize-none"
                        />
                      </div>
                    ))}
                    
                    {selectedExercises.length === 0 && (
                      <p className="text-center text-slate-500 py-4">
                        No exercises added yet. Search and add exercises from the left panel.
                      </p>
                    )}
                  </div>

                  <FormField
                    control={workoutForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How did the workout feel? Any observations..."
                            className="h-20 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full gradient-primary text-white font-medium hover:shadow-md transition-all"
                      disabled={createWorkoutMutation.isPending}
                    >
                      {createWorkoutMutation.isPending ? "Saving..." : "Save Workout"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      onClick={() => {
                        setSelectedExercises([]);
                        workoutForm.reset();
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <WorkoutTimer />
        </div>
      </div>
    </div>
  );
}
