import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dumbbell, Loader2 } from "lucide-react";
import { useState } from "react";
import Navigation from "./components/Navigation";
import OnboardingDialog from "./components/OnboardingDialog";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import Achievements from "./pages/Achievements";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import WorkoutLogger from "./pages/WorkoutLogger";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

type Tab = "dashboard" | "workout" | "progress" | "achievements" | "profile";

function AppInner() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { login, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const {
    data: profile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const showOnboarding =
    isAuthenticated && !profileLoading && isFetched && profile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full space-y-8">
          <div className="relative">
            <img
              src="/assets/generated/gym-hero-bg.dim_1200x400.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 rounded-3xl"
            />
            <div className="relative z-10 py-12 px-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
                <Dumbbell className="w-10 h-10 text-primary" />
              </div>
              <h1 className="font-display text-5xl font-bold mb-3">
                Gym<span className="text-gradient">Pulse</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Track. Analyze. Dominate.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Your complete fitness companion for muscle building, fat loss,
                weight gain, and powerlifting.
              </p>
            </div>
          </div>
          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg h-14 rounded-2xl glow-primary"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Start Training 🚀"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Powered by Internet Identity — secure, private, no passwords
          </p>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-noise">
      <OnboardingDialog open={showOnboarding} />

      {activeTab === "dashboard" && (
        <Dashboard
          profile={profile ?? null}
          onStartWorkout={() => setActiveTab("workout")}
        />
      )}
      {activeTab === "workout" && <WorkoutLogger />}
      {activeTab === "progress" && <Progress />}
      {activeTab === "achievements" && <Achievements />}
      {activeTab === "profile" && <Profile profile={profile ?? null} />}

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <footer className="fixed bottom-20 left-0 right-0 pointer-events-none">
        {/* Footer in main scrollable content */}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster theme="dark" position="top-center" richColors />
    </QueryClientProvider>
  );
}
