import { z } from 'zod';

const planExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  position: z.number().int().min(0),
  targetSets: z.number().int().min(1).max(20),
  targetReps: z.number().int().min(1).max(100),
  restSeconds: z.number().int().min(0).max(1800),
});

export const createWorkoutPlanSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  exercises: z.array(planExerciseSchema).min(1),
});

export const updateWorkoutPlanSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  exercises: z.array(planExerciseSchema).min(1).optional(),
});

export const workoutPlanIdParamSchema = z.object({ id: z.string().uuid() });

export type CreateWorkoutPlanInput = z.infer<typeof createWorkoutPlanSchema>;
export type UpdateWorkoutPlanInput = z.infer<typeof updateWorkoutPlanSchema>;
