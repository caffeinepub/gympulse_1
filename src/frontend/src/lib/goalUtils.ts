import { Goal } from "../hooks/useQueries";

export const GOAL_LABELS: Record<Goal, string> = {
  [Goal.muscleBuilding]: "Muscle Building",
  [Goal.fatLoss]: "Fat Loss",
  [Goal.weightGain]: "Weight Gain",
  [Goal.powerLifting]: "Power Lifting",
};

export const GOAL_EMOJIS: Record<Goal, string> = {
  [Goal.muscleBuilding]: "💪",
  [Goal.fatLoss]: "🔥",
  [Goal.weightGain]: "⚖️",
  [Goal.powerLifting]: "🏋️",
};

export const GOAL_COLORS: Record<Goal, string> = {
  [Goal.muscleBuilding]: "goal-muscle",
  [Goal.fatLoss]: "goal-fat",
  [Goal.weightGain]: "goal-weight",
  [Goal.powerLifting]: "goal-power",
};

export const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  [Goal.muscleBuilding]:
    "Focus on hypertrophy through progressive overload, higher reps, and moderate weight. Builds lean muscle mass with strength gains.",
  [Goal.fatLoss]:
    "High-intensity cardio-focused training combined with resistance work. Maximizes calorie burn and metabolic rate.",
  [Goal.weightGain]:
    "Compound movements with calorie surplus emphasis. Builds overall mass through high-volume training.",
  [Goal.powerLifting]:
    "Low-rep, maximum-effort lifts focusing on the big three: squat, bench press, and deadlift. Builds raw strength.",
};

export function getGoalClass(goal: Goal): string {
  return GOAL_COLORS[goal] ?? "goal-muscle";
}

export function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
