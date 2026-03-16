import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Plus,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Goal,
  type UserProfile,
  useGetMovementSuggestions,
  useGetMyBadges,
  useGetMyWorkouts,
} from "../hooks/useQueries";
import {
  GOAL_EMOJIS,
  GOAL_LABELS,
  formatShortDate,
  getGoalClass,
} from "../lib/goalUtils";

const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Train insane or remain the same.",
  "The pain you feel today is the strength you feel tomorrow.",
];

interface DashboardProps {
  profile: UserProfile | null;
  onStartWorkout: () => void;
}

function getBadgeIcon(name: string): string {
  const map: Record<string, string> = {
    "First Workout": "🏋️",
    "3-Day Streak": "🔥",
    "7-Day Streak": "💪",
    "30-Day Streak": "🏆",
    "100 Exercises": "⚡",
    "1000kg Volume": "🎯",
    "Photo Uploaded": "📸",
    "Goal Set": "🎪",
  };
  return map[name] ?? "🥇";
}

export default function Dashboard({ profile, onStartWorkout }: DashboardProps) {
  const { data: workouts, isLoading: loadingWorkouts } = useGetMyWorkouts();
  const { data: badges, isLoading: loadingBadges } = useGetMyBadges();
  const { data: suggestions } = useGetMovementSuggestions(
    profile?.goal ?? Goal.muscleBuilding,
    "",
  );

  const todayStr = new Date().toDateString();
  const todayWorkouts = useMemo(() => {
    if (!workouts) return [];
    return workouts.filter((w) => {
      const d = new Date(Number(w.date) / 1_000_000);
      return d.toDateString() === todayStr;
    });
  }, [workouts, todayStr]);

  const thisWeekWorkouts = useMemo(() => {
    if (!workouts) return 0;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return workouts.filter((w) => Number(w.date) / 1_000_000 > weekAgo).length;
  }, [workouts]);

  const streak = useMemo(() => {
    if (!workouts || workouts.length === 0) return 0;
    const sorted = [...workouts].sort(
      (a, b) => Number(b.date) - Number(a.date),
    );
    let count = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);
    for (const w of sorted) {
      const wDate = new Date(Number(w.date) / 1_000_000);
      wDate.setHours(0, 0, 0, 0);
      const diff =
        (checkDate.getTime() - wDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff <= 1) {
        count++;
        checkDate = wDate;
      } else break;
    }
    return count;
  }, [workouts]);

  const totalVolume = useMemo(() => {
    if (!workouts) return 0;
    return workouts.reduce((sum, w) => sum + w.exercises.length, 0);
  }, [workouts]);

  const quote =
    MOTIVATIONAL_QUOTES[new Date().getDay() % MOTIVATIONAL_QUOTES.length];
  const recentBadges = badges?.slice(-3).reverse() ?? [];
  const goalClass = getGoalClass(profile?.goal ?? Goal.muscleBuilding);

  return (
    <div
      data-ocid="dashboard.page"
      className="pb-nav px-4 pt-6 space-y-6 max-w-2xl mx-auto"
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.16 0.01 260) 0%, oklch(0.14 0.02 260) 100%)",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <img
          src="/assets/generated/gym-hero-bg.dim_1200x400.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">
                Welcome back,
              </p>
              <h1 className="font-display text-3xl font-bold">
                {profile?.name ?? "Athlete"}
              </h1>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full border text-sm font-medium ${goalClass}`}
            >
              {GOAL_EMOJIS[profile?.goal ?? Goal.muscleBuilding]}{" "}
              {GOAL_LABELS[profile?.goal ?? Goal.muscleBuilding]}
            </div>
          </div>
          <p className="text-muted-foreground text-sm mt-3 italic">"{quote}"</p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="gym-card p-4 text-center">
          <div className="text-3xl mb-1">🔥</div>
          {loadingWorkouts ? (
            <Skeleton className="h-7 w-12 mx-auto mb-1" />
          ) : (
            <div className="font-display text-2xl font-bold text-primary">
              {streak}
            </div>
          )}
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="gym-card p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <Dumbbell className="w-5 h-5 text-muted-foreground" />
          </div>
          {loadingWorkouts ? (
            <Skeleton className="h-7 w-12 mx-auto mb-1" />
          ) : (
            <div className="font-display text-2xl font-bold">
              {workouts?.length ?? 0}
            </div>
          )}
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="gym-card p-4 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          {loadingWorkouts ? (
            <Skeleton className="h-7 w-12 mx-auto mb-1" />
          ) : (
            <div className="font-display text-2xl font-bold">
              {thisWeekWorkouts}
            </div>
          )}
          <div className="text-xs text-muted-foreground">This Week</div>
        </div>
      </motion.div>

      {/* Today */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="gym-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-primary" /> Today's Workout
          </h2>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        {loadingWorkouts ? (
          <Skeleton className="h-12 w-full" />
        ) : todayWorkouts.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm mb-3">
              No workout logged today
            </p>
            <Button
              data-ocid="dashboard.primary_button"
              onClick={onStartWorkout}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
            >
              <Plus className="w-4 h-4" /> Start Workout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {todayWorkouts.map((w) => (
              <div
                key={w.id.toString()}
                className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2"
              >
                <span className="text-sm">{w.exercises.length} exercises</span>
                <span className="text-xs text-muted-foreground">
                  {formatShortDate(w.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recent Badges */}
      {!loadingBadges && recentBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="gym-card p-5"
        >
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Recent Badges
          </h2>
          <div className="flex gap-3">
            {recentBadges.map((b) => (
              <div
                key={b.name}
                className="flex flex-col items-center gap-1 bg-secondary/50 rounded-xl p-3 flex-1"
              >
                <span className="text-2xl">{getBadgeIcon(b.name)}</span>
                <span className="text-xs text-center text-muted-foreground leading-tight">
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="gym-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Suggested Moves
            </h2>
            <Badge
              variant="outline"
              className={getGoalClass(profile?.goal ?? Goal.muscleBuilding)}
            >
              {GOAL_LABELS[profile?.goal ?? Goal.muscleBuilding]}
            </Badge>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 4).map((ex) => (
              <div
                key={ex.id.toString()}
                className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2.5"
              >
                <div>
                  <span className="text-sm font-medium">{ex.name}</span>
                  <div className="flex gap-1 mt-0.5">
                    {ex.primaryMuscles.slice(0, 2).map((m) => (
                      <span
                        key={m}
                        className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Volume stat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="gym-card p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-muted-foreground text-sm">
            Total Exercises Logged
          </p>
          <p className="font-display text-3xl font-bold text-gradient">
            {totalVolume}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Dumbbell className="w-6 h-6 text-primary" />
        </div>
      </motion.div>
    </div>
  );
}
