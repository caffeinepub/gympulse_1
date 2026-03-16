import Array "mo:core/Array";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type Goal = {
    #muscleBuilding;
    #fatLoss;
    #weightGain;
    #powerLifting;
  };

  public type WorkoutSession = {
    id : Nat;
    owner : Principal;
    date : Time.Time;
    exercises : [Text];
    duration : Nat;
    goal : Goal;
  };

  public type UserProfile = {
    name : Text;
    goal : Goal;
    weight : Float;
    height : Float;
    joinDate : Time.Time;
  };

  public type BodyStats = {
    date : Time.Time;
    weight : Float;
    chest : Float;
    waist : Float;
    hips : Float;
    arms : Float;
    legs : Float;
  };

  public type Exercise = {
    id : Nat;
    name : Text;
    primaryMuscles : [Text];
    category : Text;
    goal : Goal;
  };

  module Exercise {
    public func compare(e1 : Exercise, e2 : Exercise) : Order.Order {
      Nat.compare(e1.id, e2.id);
    };
  };

  public type Badge = {
    name : Text;
    earnedDate : Time.Time;
  };

  module Badge {
    public func compare(b1 : Badge, b2 : Badge) : Order.Order {
      switch (Text.compare(b1.name, b2.name)) {
        case (#equal) { Int.compare(b1.earnedDate, b2.earnedDate) };
        case (order) { order };
      };
    };
  };

  public type Photo = {
    dateTaken : Time.Time;
    note : Text;
    weight : Float;
    blob : ?Storage.ExternalBlob;
  };

  public type Achievement = {
    description : Text;
    icon : Text;
    achievedAt : Time.Time;
  };

  module Achievement {
    public func compare(a1 : Achievement, a2 : Achievement) : Order.Order {
      switch (Text.compare(a1.description, a2.description)) {
        case (#equal) { Int.compare(a1.achievedAt, a2.achievedAt) };
        case (order) { order };
      };
    };
  };

  // Data storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let workouts = Map.empty<Principal, List.List<WorkoutSession>>();
  let bodyStats = Map.empty<Principal, List.List<BodyStats>>();
  let exerciseLibrary = Map.empty<Nat, Exercise>();
  let badges = Map.empty<Principal, List.List<Badge>>();
  let photos = Map.empty<Principal, List.List<Photo>>();
  let achievements = Map.empty<Principal, List.List<Achievement>>();

  var nextSessionId = 1;
  var nextExerciseId = 1;

  // Required user profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User profile creation (alternative method)
  public shared ({ caller }) func createUserProfile(name : Text, goal : Goal, weight : Float, height : Float) : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let profile : UserProfile = {
      name;
      goal;
      weight;
      height;
      joinDate = Time.now();
    };
    userProfiles.add(caller, profile);
    profile;
  };

  // Workout sessions
  public shared ({ caller }) func createWorkoutSession(exercises : [Text], duration : Nat, goal : Goal) : async WorkoutSession {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create workout sessions");
    };

    let session : WorkoutSession = {
      id = nextSessionId;
      owner = caller;
      date = Time.now();
      exercises;
      duration;
      goal;
    };
    nextSessionId += 1;

    let userWorkouts = switch (workouts.get(caller)) {
      case null { List.empty<WorkoutSession>() };
      case (?list) { list };
    };
    userWorkouts.add(session);
    workouts.add(caller, userWorkouts);
    session;
  };

  public query ({ caller }) func getMyWorkouts() : async [WorkoutSession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workouts");
    };

    switch (workouts.get(caller)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  // Body stats
  public shared ({ caller }) func addBodyStats(weight : Float, chest : Float, waist : Float, hips : Float, arms : Float, legs : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add body stats");
    };

    let stats : BodyStats = {
      date = Time.now();
      weight;
      chest;
      waist;
      hips;
      arms;
      legs;
    };

    let userStats = switch (bodyStats.get(caller)) {
      case null { List.empty<BodyStats>() };
      case (?list) { list };
    };
    userStats.add(stats);
    bodyStats.add(caller, userStats);
  };

  public query ({ caller }) func getMyBodyStats() : async [BodyStats] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view body stats");
    };

    switch (bodyStats.get(caller)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  // Progress photos
  public shared ({ caller }) func addProgressPhoto(weight : Float, note : Text, blob : ?Storage.ExternalBlob) : async Photo {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add progress photos");
    };

    let photo : Photo = {
      dateTaken = Time.now();
      note;
      weight;
      blob;
    };

    let userPhotos = switch (photos.get(caller)) {
      case null { List.empty<Photo>() };
      case (?list) { list };
    };
    userPhotos.add(photo);
    photos.add(caller, userPhotos);
    photo;
  };

  public query ({ caller }) func getMyProgressPhotos() : async [Photo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress photos");
    };

    switch (photos.get(caller)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  // Exercise library - Admin only for adding
  public shared ({ caller }) func addExercise(name : Text, primaryMuscles : [Text], category : Text, goal : Goal) : async Exercise {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add exercises");
    };

    let exercise : Exercise = {
      id = nextExerciseId;
      name;
      primaryMuscles;
      category;
      goal;
    };
    nextExerciseId += 1;
    exerciseLibrary.add(exercise.id, exercise);
    exercise;
  };

  public query ({ caller }) func getExerciseLibrary() : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exercise library");
    };

    exerciseLibrary.values().toArray();
  };

  // Movement suggestions
  public query ({ caller }) func getMovementSuggestions(goal : Goal, muscleGroup : Text) : async [Exercise] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get movement suggestions");
    };

    let filtered = exerciseLibrary.values().toArray().filter(
      func(exercise : Exercise) : Bool {
        exercise.goal == goal and exercise.primaryMuscles.find<Text>(func(m : Text) : Bool { m == muscleGroup }) != null
      }
    );
    filtered.sort();
  };

  // Badges
  public shared ({ caller }) func awardBadge(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can earn badges");
    };

    let badge : Badge = {
      name;
      earnedDate = Time.now();
    };

    let userBadges = switch (badges.get(caller)) {
      case null { List.empty<Badge>() };
      case (?list) { list };
    };
    userBadges.add(badge);
    badges.add(caller, userBadges);
  };

  public query ({ caller }) func getEarnedBadges(userId : Principal) : async [Badge] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own badges");
    };

    switch (badges.get(userId)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func getMyBadges() : async [Badge] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view badges");
    };

    switch (badges.get(caller)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  // Achievements
  public shared ({ caller }) func addAchievement(description : Text, icon : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add achievements");
    };

    let achievement : Achievement = {
      description;
      icon;
      achievedAt = Time.now();
    };

    let userAchievements = switch (achievements.get(caller)) {
      case null { List.empty<Achievement>() };
      case (?list) { list };
    };
    userAchievements.add(achievement);
    achievements.add(caller, userAchievements);
  };

  public query ({ caller }) func getAchievements(userId : Principal) : async [Achievement] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own achievements");
    };

    switch (achievements.get(userId)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func getMyAchievements() : async [Achievement] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view achievements");
    };

    switch (achievements.get(caller)) {
      case null { [] };
      case (?list) { list.toArray() };
    };
  };
};
