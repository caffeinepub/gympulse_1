import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  Goal,
  type UserProfile,
  useGetMyBodyStats,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";
import {
  GOAL_DESCRIPTIONS,
  GOAL_EMOJIS,
  GOAL_LABELS,
  formatDate,
  getGoalClass,
} from "../lib/goalUtils";

interface ProfileProps {
  profile: UserProfile | null;
}

export default function Profile({ profile }: ProfileProps) {
  const [name, setName] = useState(profile?.name ?? "");
  const [goal, setGoal] = useState<Goal>(profile?.goal ?? Goal.muscleBuilding);
  const [weight, setWeight] = useState(String(profile?.weight ?? ""));
  const [height, setHeight] = useState(String(profile?.height ?? ""));

  const saveProfile = useSaveCallerUserProfile();
  const { data: bodyStats } = useGetMyBodyStats();
  const { clear, identity } = useInternetIdentity();
  const qc = useQueryClient();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGoal(profile.goal);
      setWeight(String(profile.weight));
      setHeight(String(profile.height));
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        goal,
        weight: Number.parseFloat(weight) || 0,
        height: Number.parseFloat(height) || 0,
        joinDate: profile?.joinDate ?? BigInt(Date.now() * 1_000_000),
      });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    }
  };

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const latestStats = bodyStats?.[bodyStats.length - 1];
  const goalClass = getGoalClass(goal);

  return (
    <div
      data-ocid="profile.page"
      className="pb-nav px-4 pt-6 space-y-5 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="border-border text-muted-foreground hover:text-foreground gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>

      {/* Avatar + Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gym-card p-5 flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">
            {profile?.name ?? "—"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {identity?.getPrincipal().toString().slice(0, 20)}...
          </p>
          {profile?.joinDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Member since {formatDate(profile.joinDate)}
            </p>
          )}
        </div>
      </motion.div>

      {/* Goal Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`gym-card p-4 border ${goalClass}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{GOAL_EMOJIS[goal]}</span>
          <span className="font-display font-bold text-lg">
            {GOAL_LABELS[goal]}
          </span>
        </div>
        <p className="text-sm opacity-90">{GOAL_DESCRIPTIONS[goal]}</p>
      </motion.div>

      {/* Edit Form */}
      <div className="gym-card p-5">
        <h3 className="font-display font-semibold mb-4">Edit Profile</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              data-ocid="profile.name_input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Primary Goal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger
                data-ocid="profile.goal_select"
                className="bg-secondary border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.values(Goal).map((g) => (
                  <SelectItem key={g} value={g}>
                    {GOAL_EMOJIS[g]} {GOAL_LABELS[g]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="profile-weight">Weight (kg)</Label>
              <Input
                id="profile-weight"
                data-ocid="profile.weight_input"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-height">Height (cm)</Label>
              <Input
                id="profile-height"
                data-ocid="profile.height_input"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <Button
            type="submit"
            data-ocid="profile.save_button"
            disabled={saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </div>

      {/* Body Stats Summary */}
      {latestStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gym-card p-5"
        >
          <h3 className="font-display font-semibold mb-3">Latest Body Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Weight", value: latestStats.weight, unit: "kg" },
              { label: "Chest", value: latestStats.chest, unit: "cm" },
              { label: "Waist", value: latestStats.waist, unit: "cm" },
              { label: "Hips", value: latestStats.hips, unit: "cm" },
              { label: "Arms", value: latestStats.arms, unit: "cm" },
              { label: "Legs", value: latestStats.legs, unit: "cm" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-secondary/50 rounded-xl p-3 text-center"
              >
                <div className="font-display text-lg font-bold">
                  {s.value > 0 ? s.value.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
