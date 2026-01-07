export enum Difficulty {
    EASY = 'Fácil',
    MEDIUM = 'Médio',
    HARD = 'Difícil'
}

export interface Exercise {
    id: string;
    name: string;
    equipment: string;
    sets: number;
    reps: string;
    imageUrl: string;
    videoUrl?: string; // Optional link to video
    tips: string;
    completed: boolean;
    suggestedChanges?: Partial<Exercise>; // For AI adaptations
}

export interface WorkoutDay {
    id: string; // e.g., 'monday'
    label: string;
    muscleGroup: string;
    exercises: Exercise[];
    isRestDay: boolean;
    modified: boolean; // If user changed the workout
    completed: boolean;
    score: 'GOOD' | 'MEDIUM' | 'BAD' | 'PENDING';
}

export interface WeightEntry {
    date: string;
    weight: number;
}

export interface MonthlyStats {
    month: string;
    workouts: number;
}

export interface LevelConfig {
    level: number;
    title: string;
    minPoints: number;
    maxPoints: number;
    icon: string;
}

export interface UserProfile {
    name: string;
    height: number; // cm
    startWeight: number;
    currentWeight: number;
    weightHistory: WeightEntry[];
    streak: number;
    totalExercisesCompleted: number;
    dailyPoints: number; // Gamification points
}

export type Screen = 'HOME' | 'WORKOUT' | 'PROFILE';