import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dumbbell, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Goal } from "../hooks/useQueries";
import { useCreateUserProfile } from "../hooks/useQueries";
import { GOAL_EMOJIS, GOAL_LABELS } from "../lib/goalUtils";

interface OnboardingDialogProps {
  open: boolean;
}

export default function OnboardingDialog({ open }: OnboardingDialogProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal>(Goal.muscleBuilding);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const createProfile = useCreateUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!weight || !height) {
      toast.error("Please enter weight and height");
      return;
    }
    try {
      await createProfile.mutateAsync({
        name: name.trim(),
        goal,
        weight: Number.parseFloat(weight),
        height: Number.parseFloat(height),
      });
      toast.success("Profile created! Welcome to GymPulse! 🏋️");
    } catch {
      toast.error("Failed to create profile");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        data-ocid="onboarding.dialog"
        className="bg-card border-border max-w-md w-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                Welcome to GymPulse
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                Set up your profile to get started
              </p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-name">Your Name</Label>
            <Input
              id="onboarding-name"
              data-ocid="onboarding.name_input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Primary Goal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger
                data-ocid="onboarding.goal_select"
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
              <Label htmlFor="onboarding-weight">Weight (kg)</Label>
              <Input
                id="onboarding-weight"
                type="number"
                placeholder="75"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="onboarding-height">Height (cm)</Label>
              <Input
                id="onboarding-height"
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
          </div>
          <Button
            type="submit"
            data-ocid="onboarding.submit_button"
            disabled={createProfile.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
          >
            {createProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Up...
              </>
            ) : (
              "Start Training 🚀"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
