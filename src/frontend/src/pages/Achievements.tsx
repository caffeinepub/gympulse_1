import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useGetMyAchievements, useGetMyBadges } from "../hooks/useQueries";
import { formatDate } from "../lib/goalUtils";

const ALL_BADGES = [
  { name: "First Workout", icon: "🏋️", desc: "Complete your first workout" },
  { name: "3-Day Streak", icon: "🔥", desc: "Work out 3 days in a row" },
  { name: "7-Day Streak", icon: "💪", desc: "Work out 7 days in a row" },
  { name: "30-Day Streak", icon: "🏆", desc: "Work out 30 days in a row" },
  { name: "100 Exercises", icon: "⚡", desc: "Log 100 total exercises" },
  { name: "1000kg Volume", icon: "🎯", desc: "Lift 1000kg total volume" },
  { name: "Photo Uploaded", icon: "📸", desc: "Upload a progress photo" },
  { name: "Goal Set", icon: "🎪", desc: "Set your training goal" },
];

const QUOTES = [
  "Champions are made in the moments when they want to quit.",
  "Every rep counts. Every set matters.",
  "Your only competition is who you were yesterday.",
];

export default function Achievements() {
  const { data: badges, isLoading: loadingBadges } = useGetMyBadges();
  const { data: achievements, isLoading: loadingAchievements } =
    useGetMyAchievements();

  const earnedNames = new Set((badges ?? []).map((b) => b.name));
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  return (
    <div
      data-ocid="achievements.page"
      className="pb-nav px-4 pt-6 space-y-6 max-w-2xl mx-auto"
    >
      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.19 42 / 0.15) 0%, oklch(0.60 0.24 15 / 0.15) 100%)",
          border: "1px solid oklch(var(--primary) / 0.3)",
        }}
      >
        <div className="text-4xl mb-2">🏅</div>
        <p className="font-display text-lg font-semibold text-gradient">
          "{quote}"
        </p>
      </motion.div>

      {/* Badge Gallery */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">
          Badge Collection
        </h2>
        {loadingBadges ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.map((badge, i) => {
              const earned = earnedNames.has(badge.name);
              const earnedBadge = (badges ?? []).find(
                (b) => b.name === badge.name,
              );
              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={`gym-card p-4 text-center transition-all ${
                    earned
                      ? "border-primary/40 shadow-[0_0_20px_oklch(0.72_0.19_42/0.2)]"
                      : "opacity-40 grayscale"
                  }`}
                >
                  <div
                    className={`text-4xl mb-2 ${earned ? "animate-badge-unlock" : ""}`}
                  >
                    {badge.icon}
                  </div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-tight">
                    {badge.desc}
                  </div>
                  {earned && earnedBadge && (
                    <div className="text-xs text-primary mt-1.5 font-medium">
                      ✓ {formatDate(earnedBadge.earnedDate)}
                    </div>
                  )}
                  {!earned && (
                    <div className="text-xs text-muted-foreground mt-1.5">
                      🔒 Locked
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Timeline */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">
          Achievement History
        </h2>
        {loadingAchievements ? (
          <Skeleton className="h-24 w-full" />
        ) : (achievements ?? []).length === 0 ? (
          <div className="gym-card p-6 text-center">
            <p className="text-muted-foreground">
              No achievements yet. Start training!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...(achievements ?? [])].reverse().map((ach, i) => (
              <motion.div
                key={`${ach.achievedAt}-${ach.description.slice(0, 10)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="gym-card p-4 flex items-center gap-4"
              >
                <div className="text-3xl flex-shrink-0">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {ach.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(ach.achievedAt)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
