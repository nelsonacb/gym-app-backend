import { z } from '../config/zod-openapi';

export const exerciseProgressQuerySchema = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .openapi('ExerciseProgressInput');

export type ExerciseProgressQuery = z.infer<typeof exerciseProgressQuerySchema>;
