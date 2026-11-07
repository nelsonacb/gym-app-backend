import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import { exerciseProgressQuerySchema } from '../../schemas/progress.schema';

/* ------------------------------------------------------------------ */
/* Response schemas                                                    */
/* ------------------------------------------------------------------ */
const OverallProgress = z
  .object({
    totalSessions: z.number().int(),
    totalVolume: z.number(),
    totalDurationSeconds: z.number().int(),
    weeklyFrequency: z.array(
      z.object({
        weekStart: z.string().openapi({ example: '2026-09-21' }),
        count: z.number().int(),
      }),
    ),
    weeklyVolume: z.array(
      z.object({
        weekStart: z.string().openapi({ example: '2026-09-21' }),
        volume: z.number(),
      }),
    ),
  })
  .openapi('OverallProgress');

const ExerciseProgress = z
  .object({
    exerciseId: z.uuid(),
    totalSets: z.number().int(),
    personalRecords: z.object({
      maxWeight: z.number().nullable(),
      maxSingleSetVolume: z.number().nullable(),
    }),
    history: z.array(
      z.object({
        sessionId: z.uuid(),
        startedAt: z.iso.datetime(),
        weight: z.number().nullable(),
        reps: z.number().int().nullable(),
        volume: z.number(),
      }),
    ),
  })
  .openapi('ExerciseProgress');

/* ------------------------------------------------------------------ */
/* GET /progress/overall                                               */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/progress/overall',
  tags: ['Progress'],
  summary: 'Overall training progress',
  description:
    'Aggregates completed sessions: total volume, total duration, weekly frequency and weekly volume (ISO weeks, Monday start).',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Overall progress',
      content: {
        'application/json': {
          schema: z.object({ progress: OverallProgress }),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

/* ------------------------------------------------------------------ */
/* GET /progress/exercises/:exerciseId                                 */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/progress/exercises/{exerciseId}',
  tags: ['Progress'],
  summary: 'Progress and PRs for a single exercise',
  description:
    'Personal records are derived on read from COMPLETED sets in COMPLETED sessions — no stored PR table.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ exerciseId: z.string().uuid() }),
    query: exerciseProgressQuerySchema,
  },
  responses: {
    200: {
      description: 'Exercise progress',
      content: {
        'application/json': {
          schema: z.object({ progress: ExerciseProgress }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    422: { description: 'Invalid UUID' },
  },
});
