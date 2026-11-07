import { z } from '../config/zod-openapi';

export const startSessionSchema = z
  .object({
    workoutPlanId: z.uuid(),
    startedAt: z.coerce.date().optional(),
  })
  .openapi('StartSesionInput');

export const completeSessionSchema = z
  .object({
    finishedAt: z.coerce.date().optional(),
  })
  .openapi('CompleteSessionInput');

export const logSetSchema = z
  .object({
    weight: z.number().min(0).max(2000).nullable(),
    reps: z.number().int().min(1).max(1000).nullable(),
    status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']).default('COMPLETED'),
  })
  .openapi('LogSetInput');

export const listSessionsQuerySchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .openapi('ListSessionInput');

export const sessionIdParamSchema = z
  .object({ id: z.uuid() })
  .openapi('SessionIdInput');
export const sessionExerciseIdParamSchema = z
  .object({ id: z.uuid() })
  .openapi('SessionExeciseIdInput');
export const setNumberParamSchema = z
  .object({
    id: z.uuid(),
    setNumber: z.coerce.number().int().min(1),
  })
  .openapi('SetNumberParamInput');

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type LogSetInput = z.infer<typeof logSetSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
