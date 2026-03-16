import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Exercise {
    id: bigint;
    goal: Goal;
    name: string;
    primaryMuscles: Array<string>;
    category: string;
}
export type Time = bigint;
export interface WorkoutSession {
    id: bigint;
    duration: bigint;
    owner: Principal;
    date: Time;
    goal: Goal;
    exercises: Array<string>;
}
export interface BodyStats {
    weight: number;
    arms: number;
    date: Time;
    hips: number;
    chest: number;
    legs: number;
    waist: number;
}
export interface Badge {
    earnedDate: Time;
    name: string;
}
export interface Achievement {
    icon: string;
    achievedAt: Time;
    description: string;
}
export interface UserProfile {
    weight: number;
    height: number;
    joinDate: Time;
    goal: Goal;
    name: string;
}
export interface Photo {
    weight: number;
    blob?: ExternalBlob;
    note: string;
    dateTaken: Time;
}
export enum Goal {
    powerLifting = "powerLifting",
    fatLoss = "fatLoss",
    weightGain = "weightGain",
    muscleBuilding = "muscleBuilding"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAchievement(description: string, icon: string): Promise<void>;
    addBodyStats(weight: number, chest: number, waist: number, hips: number, arms: number, legs: number): Promise<void>;
    addExercise(name: string, primaryMuscles: Array<string>, category: string, goal: Goal): Promise<Exercise>;
    addProgressPhoto(weight: number, note: string, blob: ExternalBlob | null): Promise<Photo>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(name: string): Promise<void>;
    createUserProfile(name: string, goal: Goal, weight: number, height: number): Promise<UserProfile>;
    createWorkoutSession(exercises: Array<string>, duration: bigint, goal: Goal): Promise<WorkoutSession>;
    getAchievements(userId: Principal): Promise<Array<Achievement>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEarnedBadges(userId: Principal): Promise<Array<Badge>>;
    getExerciseLibrary(): Promise<Array<Exercise>>;
    getMovementSuggestions(goal: Goal, muscleGroup: string): Promise<Array<Exercise>>;
    getMyAchievements(): Promise<Array<Achievement>>;
    getMyBadges(): Promise<Array<Badge>>;
    getMyBodyStats(): Promise<Array<BodyStats>>;
    getMyProgressPhotos(): Promise<Array<Photo>>;
    getMyWorkouts(): Promise<Array<WorkoutSession>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
