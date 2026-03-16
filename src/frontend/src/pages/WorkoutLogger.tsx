import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, Plus, Search, Timer, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import RestTimer from "../components/RestTimer";
import {
  type Exercise,
  Goal,
  useAwardBadge,
  useCreateWorkoutSession,
  useGetExerciseLibrary,
  useGetMyBadges,
  useGetMyWorkouts,
} from "../hooks/useQueries";
import { GOAL_EMOJIS, GOAL_LABELS, getGoalClass } from "../lib/goalUtils";

interface SetEntry {
  reps: string;
  weight: string;
  rest: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetEntry[];
  uid: string;
}

export default function WorkoutLogger() {
  const [goal, setGoal] = useState<Goal>(Goal.muscleBuilding);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState<ExerciseEntry[]>([]);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [saved, setSaved] = useState(false);

  const { data: library } = useGetExerciseLibrary();
  const { data: existingWorkouts } = useGetMyWorkouts();
  const { data: myBadges } = useGetMyBadges();
  const createWorkout = useCreateWorkoutSession();
  const awardBadge = useAwardBadge();

  const filteredLibrary = (library ?? []).filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.primaryMuscles.some((m) =>
        m.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const addExercise = useCallback((ex: Exercise) => {
    setEntries((prev) => [
      ...prev,
      {
        exercise: ex,
        sets: [{ reps: "10", weight: "0", rest: "60" }],
        uid: `${ex.id}-${Date.now()}`,
      },
    ]);
    setShowExerciseList(false);
    setSearch("");
  }, []);

  const removeExercise = useCallback((uid: string) => {
    setEntries((prev) => prev.filter((e) => e.uid !== uid));
  }, []);

  const addSet = useCallback((uid: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.uid === uid
          ? { ...e, sets: [...e.sets, { reps: "10", weight: "0", rest: "60" }] }
          : e,
      ),
    );
  }, []);

  const updateSet = useCallback(
    (uid: string, setIdx: number, field: keyof SetEntry, value: string) => {
      setEntries((prev) =>
        prev.map((e) =>
          e.uid === uid
            ? {
                ...e,
                sets: e.sets.map((s, j) =>
                  j === setIdx ? { ...s, [field]: value } : s,
                ),
              }
            : e,
        ),
      );
    },
    [],
  );

  const startTimer = (duration: number) => {
    setTimerDuration(duration);
    setTimerOpen(true);
  };

  const handleSave = async () => {
    if (entries.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    const exerciseNames = entries.flatMap((e) =>
      e.sets.map((s) => `${e.exercise.name} x${s.reps} @${s.weight}kg`),
    );
    try {
      await createWorkout.mutateAsync({
        exercises: exerciseNames,
        duration: BigInt(45),
        goal,
      });
      const badgeNames = (myBadges ?? []).map((b) => b.name);
      const totalAfter = (existingWorkouts?.length ?? 0) + 1;
      if (totalAfter === 1 && !badgeNames.includes("First Workout")) {
        await awardBadge.mutateAsync("First Workout");
        toast.success("🏋️ Badge Unlocked: First Workout!");
      }
      if (!badgeNames.includes("Goal Set")) {
        await awardBadge.mutateAsync("Goal Set");
      }
      setSaved(true);
      toast.success("Workout saved! Great job! 💪");
      setEntries([]);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save workout");
    }
  };

  return (
    <div
      data-ocid="workout.page"
      className="pb-nav px-4 pt-6 space-y-5 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Log Workout</h1>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Goal Selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Object.values(Goal).map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => setGoal(g)}
            className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
              goal === g
                ? `${getGoalClass(g)} ring-2 ring-current/40`
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {GOAL_EMOJIS[g]} {GOAL_LABELS[g]}
          </button>
        ))}
      </div>

      {/* Exercise Search */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="workout.exercise_search_input"
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowExerciseList(true);
              }}
              onFocus={() => setShowExerciseList(true)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          <Button
            type="button"
            data-ocid="workout.add_exercise_button"
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={() => setShowExerciseList(!showExerciseList)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <AnimatePresence>
          {showExerciseList && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 w-full mt-2"
            >
              <div className="gym-card overflow-hidden">
                <ScrollArea className="h-56">
                  {filteredLibrary.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No exercises found.
                    </div>
                  ) : (
                    filteredLibrary.map((ex) => (
                      <button
                        type="button"
                        key={ex.id.toString()}
                        onClick={() => addExercise(ex)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/70 transition-colors text-left border-b border-border last:border-0"
                      >
                        <div>
                          <span className="text-sm font-medium">{ex.name}</span>
                          <div className="flex gap-1 mt-0.5">
                            {ex.primaryMuscles.slice(0, 2).map((m) => (
                              <span
                                key={m}
                                className={`text-xs rounded px-1.5 py-0.5 border ${getGoalClass(ex.goal)}`}
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise Entries */}
      <div className="space-y-4">
        <AnimatePresence>
          {entries.map((entry, exIdx) => (
            <motion.div
              key={entry.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="gym-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{entry.exercise.name}</h3>
                  <div className="flex gap-1 mt-1">
                    {entry.exercise.primaryMuscles.map((m) => (
                      <span
                        key={m}
                        className={`text-xs rounded px-1.5 py-0.5 border ${getGoalClass(entry.exercise.goal)}`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeExercise(entry.uid)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground px-1">
                  <span>Set</span>
                  <span>Reps</span>
                  <span>Kg</span>
                  <span>Rest</span>
                </div>
                {entry.sets.map((set, setIdx) => (
                  <div
                    key={`${entry.uid}-set-${setIdx}`}
                    className="grid grid-cols-4 gap-2 items-center"
                  >
                    <span className="text-sm font-medium text-muted-foreground text-center">
                      {setIdx + 1}
                    </span>
                    <Input
                      data-ocid={
                        exIdx === 0 && setIdx === 0
                          ? "workout.set_reps_input.1"
                          : undefined
                      }
                      type="number"
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(entry.uid, setIdx, "reps", e.target.value)
                      }
                      className="bg-secondary border-border h-9 text-center p-1"
                    />
                    <Input
                      data-ocid={
                        exIdx === 0 && setIdx === 0
                          ? "workout.set_weight_input.1"
                          : undefined
                      }
                      type="number"
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(entry.uid, setIdx, "weight", e.target.value)
                      }
                      className="bg-secondary border-border h-9 text-center p-1"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        startTimer(Number.parseInt(set.rest) || 60)
                      }
                      className="flex items-center justify-center gap-1 bg-secondary hover:bg-secondary/70 border border-border rounded-md h-9 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Timer className="w-3 h-3" />
                      {set.rest}s
                    </button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                data-ocid={exIdx === 0 ? "workout.add_set_button.1" : undefined}
                variant="outline"
                size="sm"
                onClick={() => addSet(entry.uid)}
                className="w-full border-dashed border-border hover:bg-secondary text-muted-foreground"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Set
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div
            data-ocid="workout.empty_state"
            className="gym-card p-8 text-center"
          >
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-muted-foreground">
              Search and add exercises above to start logging
            </p>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button
            type="button"
            data-ocid="workout.save_button"
            onClick={handleSave}
            disabled={createWorkout.isPending}
            className={`w-full font-semibold h-12 text-base ${
              saved
                ? "bg-green-600 hover:bg-green-600"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {createWorkout.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Saved!
              </>
            ) : (
              "Save Workout 💪"
            )}
          </Button>
        </motion.div>
      )}

      <RestTimer
        open={timerOpen}
        duration={timerDuration}
        onClose={() => setTimerOpen(false)}
      />
    </div>
  );
}
