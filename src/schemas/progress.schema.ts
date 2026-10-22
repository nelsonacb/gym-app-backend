import { z } from 'zod';

export const exerciseProgressQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type ExerciseProgressQuery = z.infer<typeof exerciseProgressQuerySchema>;
