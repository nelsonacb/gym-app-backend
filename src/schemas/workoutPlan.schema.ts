import { z } from '../config/zod-openapi';

const planExerciseSchema = z
  .object({
    exerciseId: z.uuid(),
    position: z.number().int().min(0),
    targetSets: z.number().int().min(1).max(20),
    targetReps: z.number().int().min(1).max(100),
    restSeconds: z.number().int().min(0).max(1800),
  })
  .openapi('PlanExerciseInput');

export const createWorkoutPlanSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional(),
    exercises: z.array(planExerciseSchema).min(1),
  })
  .openapi('CreateWorkoutPlanInput');

export const updateWorkoutPlanSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    exercises: z.array(planExerciseSchema).min(1).optional(),
  })
  .openapi('UpdateWorkoutPlanInput');

export const workoutPlanIdParamSchema = z
  .object({ id: z.uuid() })
  .openapi('WorkoutPlanIdInput');

export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;
