
export interface Exercise {
  id: string;
  name: string;
  category: string; // e.g., Push, Pull, Legs, Iso
}

export interface WorkoutSet {
  id: string;
  weight: number;
  reps: number;
  rpe?: number; // FTG (Feeling/Rating) 1-10
  completed: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string; // e.g., "Tag 1 - Woche 12"
  exercises: string[]; // List of Exercise IDs
}

export interface CompletedWorkout {
  id: string;
  templateId?: string;
  name: string;
  date: string; // ISO String
  exercises: WorkoutExercise[];
  durationMinutes: number;
}

// For chart data
export interface ProgressPoint {
  date: string;
  weight: number;
  volume: number;
}
