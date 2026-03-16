# GymPulse - Workout Tracker & Body Conditioning App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication and profile system
- Daily workout logging: exercises, sets, reps, rest intervals between sets
- Workout goals / modes: Muscle Building, Fat Loss, Weight Gain, Power Lifting
- Exercise library with suggested movements per goal
- Workout history and analytics dashboard
- Body conditioning photo uploads (progress photos)
- Rewards and achievement system to keep users motivated
- Body stats tracking (weight, measurements)

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User profiles: goal, stats (weight, height), join date
- Exercise library: name, muscle groups, category (cardio/strength/compound)
- Workout sessions: date, exercises with sets/reps/weight/rest intervals, notes
- Body stats log: date, weight, optional measurements
- Achievement/reward system: badges earned based on streak, volume, milestones
- Movement suggestions: map goal type to recommended exercises
- Progress photo metadata stored, actual blobs via blob-storage

### Frontend
- Dashboard: today's workout, streak, recent achievements, goal progress
- Workout Logger: add exercises, log sets/reps/weight, timer for rest between sets
- Exercise Library: browse exercises by muscle group and goal
- Analytics: charts for volume, weight progression, goal-specific metrics
- Body Progress: upload progress photos, view timeline
- Achievements: badges gallery with locked/unlocked states
- Profile: set goals, body stats, personal info
