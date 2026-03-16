import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface RestTimerProps {
  open: boolean;
  duration: number;
  onClose: () => void;
}

export default function RestTimer({ open, duration, onClose }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (open) {
      setRemaining(duration);
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              gain.gain.setValueAtTime(0.5, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.5,
              );
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 0.5);
            } catch {}
            setTimeout(handleClose, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open, duration, handleClose]);

  const progress = remaining / duration;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="rest_timer.dialog"
        className="bg-card border-border max-w-xs w-full text-center"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-center">
            Rest Timer
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-32 h-32">
            <svg
              viewBox="0 0 120 120"
              className="w-32 h-32 -rotate-90"
              role="img"
              aria-label="Rest timer countdown"
            >
              <title>Rest timer countdown</title>
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="oklch(var(--border))"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="oklch(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-3xl font-bold text-foreground">
                {minutes > 0
                  ? `${minutes}:${String(seconds).padStart(2, "0")}`
                  : seconds}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">seconds remaining</p>
          <Button
            data-ocid="rest_timer.cancel_button"
            variant="outline"
            className="border-border hover:bg-secondary"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" />
            Skip Rest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
