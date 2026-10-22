-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('KG', 'LB');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'LEGS', 'GLUTES', 'CORE', 'CARDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'KETTLEBELL', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkoutSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExerciseSetStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "weight_unit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weekly_goal" INTEGER,
    "weight_unit" "WeightUnit" NOT NULL DEFAULT 'KG',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" "MuscleGroup" NOT NULL,
    "equipment" "Equipment" NOT NULL,
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_exercises" (
    "id" TEXT NOT NULL,
    "workout_plan_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "target_sets" INTEGER NOT NULL,
    "target_reps" INTEGER NOT NULL,
    "rest_seconds" INTEGER NOT NULL,

    CONSTRAINT "plan_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_plan_id" TEXT,
    "status" "WorkoutSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "total_volume" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_exercises" (
    "id" TEXT NOT NULL,
    "workout_session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "exercise_name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "target_sets" INTEGER,
    "target_reps" INTEGER,
    "rest_seconds" INTEGER,

    CONSTRAINT "session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_sets" (
    "id" TEXT NOT NULL,
    "session_exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER,
    "status" "ExerciseSetStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "exercise_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "exercises_muscle_group_idx" ON "exercises"("muscle_group");

-- CreateIndex
CREATE INDEX "workout_plans_created_by_user_id_idx" ON "workout_plans"("created_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "plan_exercises_workout_plan_id_position_key" ON "plan_exercises"("workout_plan_id", "position");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_status_idx" ON "workout_sessions"("user_id", "status");

-- CreateIndex
CREATE INDEX "workout_sessions_user_id_started_at_idx" ON "workout_sessions"("user_id", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "session_exercises_workout_session_id_position_key" ON "session_exercises"("workout_session_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_sets_session_exercise_id_set_number_key" ON "exercise_sets"("session_exercise_id", "set_number");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_plans" ADD CONSTRAINT "workout_plans_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_exercises" ADD CONSTRAINT "plan_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_workout_plan_id_fkey" FOREIGN KEY ("workout_plan_id") REFERENCES "workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_workout_session_id_fkey" FOREIGN KEY ("workout_session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_exercises" ADD CONSTRAINT "session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_sets" ADD CONSTRAINT "exercise_sets_session_exercise_id_fkey" FOREIGN KEY ("session_exercise_id") REFERENCES "session_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
