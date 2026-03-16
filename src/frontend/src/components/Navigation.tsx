import {
  Dumbbell,
  LayoutDashboard,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";

type Tab = "dashboard" | "workout" | "progress" | "achievements" | "profile";

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: {
  id: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  ocid: string;
}[] = [
  {
    id: "dashboard",
    label: "Home",
    icon: LayoutDashboard,
    ocid: "nav.dashboard_tab",
  },
  { id: "workout", label: "Workout", icon: Dumbbell, ocid: "nav.workout_tab" },
  {
    id: "progress",
    label: "Progress",
    icon: TrendingUp,
    ocid: "nav.progress_tab",
  },
  {
    id: "achievements",
    label: "Awards",
    icon: Trophy,
    ocid: "nav.achievements_tab",
  },
  { id: "profile", label: "Profile", icon: User, ocid: "nav.profile_tab" },
];

export default function Navigation({
  activeTab,
  onTabChange,
}: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border bottom-nav-height flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            type="button"
            key={tab.id}
            data-ocid={tab.ocid}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_8px_oklch(0.72_0.19_42)]" : ""}`}
              />
              {isActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span
              className={`text-xs font-medium ${isActive ? "text-primary" : ""}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
