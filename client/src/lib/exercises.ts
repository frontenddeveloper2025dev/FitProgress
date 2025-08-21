import { Exercise } from "@shared/schema";

export const exerciseCategories = [
  { id: "all", name: "All", color: "primary" },
  { id: "strength", name: "Strength", color: "primary" },
  { id: "cardio", name: "Cardio", color: "secondary" },
  { id: "yoga", name: "Yoga", color: "accent" },
  { id: "flexibility", name: "Flexibility", color: "purple" },
];

export const getExerciseIcon = (category: string) => {
  switch (category) {
    case "strength":
      return "💪";
    case "cardio":
      return "🏃‍♂️";
    case "yoga":
      return "🧘‍♀️";
    case "flexibility":
      return "🤸‍♀️";
    default:
      return "🏋️‍♂️";
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "strength":
      return "text-primary bg-primary/10";
    case "cardio":
      return "text-secondary bg-secondary/10";
    case "yoga":
      return "text-accent bg-accent/10";
    case "flexibility":
      return "text-purple-500 bg-purple-500/10";
    default:
      return "text-primary bg-primary/10";
  }
};

export const getMetricLabels = (category: string) => {
  switch (category) {
    case "strength":
      return { primary: "Sets", secondary: "Reps", tertiary: "Weight (lbs)" };
    case "cardio":
      return { primary: "Duration (min)", secondary: "Distance (mi)", tertiary: "Calories" };
    case "yoga":
    case "flexibility":
      return { primary: "Duration (min)", secondary: "Difficulty", tertiary: "Focus Area" };
    default:
      return { primary: "Sets", secondary: "Reps", tertiary: "Weight (lbs)" };
  }
};
