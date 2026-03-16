import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import {
  type Achievement,
  type Badge,
  type BodyStats,
  type Exercise,
  Goal,
  type Photo,
  type UserProfile,
  type WorkoutSession,
} from "../backend.d";
import { useActor } from "./useActor";

export { Goal };
export type {
  UserProfile,
  Exercise,
  WorkoutSession,
  BodyStats,
  Photo,
  Achievement,
  Badge,
};

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      name: string;
      goal: Goal;
      weight: number;
      height: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createUserProfile(p.name, p.goal, p.weight, p.height);
    },
    onSuccess: (profile) => {
      qc.setQueryData(["currentUserProfile"], profile);
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: (_data, profile) => {
      qc.setQueryData(["currentUserProfile"], profile);
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetExerciseLibrary() {
  const { actor, isFetching } = useActor();
  return useQuery<Exercise[]>({
    queryKey: ["exerciseLibrary"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExerciseLibrary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMovementSuggestions(goal: Goal, muscleGroup: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Exercise[]>({
    queryKey: ["movementSuggestions", goal, muscleGroup],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMovementSuggestions(goal, muscleGroup);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateWorkoutSession() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      exercises: string[];
      duration: bigint;
      goal: Goal;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createWorkoutSession(p.exercises, p.duration, p.goal);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myWorkouts"] });
      qc.invalidateQueries({ queryKey: ["myBadges"] });
    },
  });
}

export function useGetMyWorkouts() {
  const { actor, isFetching } = useActor();
  return useQuery<WorkoutSession[]>({
    queryKey: ["myWorkouts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWorkouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBodyStats() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      weight: number;
      chest: number;
      waist: number;
      hips: number;
      arms: number;
      legs: number;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addBodyStats(
        p.weight,
        p.chest,
        p.waist,
        p.hips,
        p.arms,
        p.legs,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBodyStats"] });
    },
  });
}

export function useGetMyBodyStats() {
  const { actor, isFetching } = useActor();
  return useQuery<BodyStats[]>({
    queryKey: ["myBodyStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBodyStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProgressPhoto() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      weight: number;
      note: string;
      blob: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addProgressPhoto(p.weight, p.note, p.blob);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProgressPhotos"] });
      qc.invalidateQueries({ queryKey: ["myBadges"] });
    },
  });
}

export function useGetMyProgressPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery<Photo[]>({
    queryKey: ["myProgressPhotos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProgressPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAchievement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { description: string; icon: string }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAchievement(p.description, p.icon);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAchievements"] });
    },
  });
}

export function useGetMyAchievements() {
  const { actor, isFetching } = useActor();
  return useQuery<Achievement[]>({
    queryKey: ["myAchievements"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAchievements();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAwardBadge() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.awardBadge(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBadges"] });
    },
  });
}

export function useGetMyBadges() {
  const { actor, isFetching } = useActor();
  return useQuery<Badge[]>({
    queryKey: ["myBadges"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBadges();
    },
    enabled: !!actor && !isFetching,
  });
}
