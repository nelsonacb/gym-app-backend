import { z } from '../config/zod-openapi';

export const listExercisesQuerySchema = z
  .object({
    muscleGroup: z
      .enum([
        'CHEST',
        'BACK',
        'SHOULDERS',
        'BICEPS',
        'TRICEPS',
        'LEGS',
        'GLUTES',
        'CORE',
        'CARDIO',
        'OTHER',
      ])
      .optional(),
    equipment: z
      .enum([
        'BARBELL',
        'DUMBBELL',
        'MACHINE',
        'CABLE',
        'BODYWEIGHT',
        'KETTLEBELL',
        'OTHER',
      ])
      .optional(),
    search: z.string().trim().min(1).optional(),
  })
  .openapi('ListExercisesInput');

export const exerciseIdParamSchema = z
  .object({
    id: z.uuid(),
  })
  .openapi('ExercisesByIdInput');

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
