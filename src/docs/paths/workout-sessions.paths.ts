import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import {
  listSessionsQuerySchema,
  logSetSchema,
  sessionIdParamSchema,
  startSessionSchema,
} from '../../schemas/workoutSession.schema';

/* ------------------------------------------------------------------ */
/* Response schemas                                                    */
/* ------------------------------------------------------------------ */
const ExerciseSet = z
  .object({
    id: z.uuid(),
    sessionExerciseId: z.uuid(),
    setNumber: z.number().int(),
    weight: z.number().nullable(),
    reps: z.number().int().nullable(),
    status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED']),
    completedAt: z.iso.datetime().nullable(),
  })
  .openapi('ExerciseSet');

const SessionExercise = z
  .object({
    id: z.uuid(),
    workoutSessionId: z.uuid(),
    exerciseId: z.uuid(),
    exerciseName: z
      .string()
      .openapi({ description: 'Snapshot of exercise name at session start' }),
    position: z.number().int(),
    targetSets: z.number().int().nullable(),
    targetReps: z.number().int().nullable(),
    restSeconds: z.number().int().nullable(),
    sets: z.array(ExerciseSet),
  })
  .openapi('SessionExercise');

const WorkoutSession = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    workoutPlanId: z.uuid().nullable(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    startedAt: z.iso.datetime(),
    finishedAt: z.iso.datetime().nullable(),
    durationSeconds: z.number().int().nullable(),
    totalVolume: z.number().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    sessionExercises: z.array(SessionExercise),
  })
  .openapi('WorkoutSession');

const WorkoutSessionSummary = z
  .object({
    id: z.uuid(),
    userId: z.uuid(),
    status: z.enum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    startedAt: z.iso.datetime(),
    finishedAt: z.iso.datetime().nullable(),
    durationSeconds: z.number().int().nullable(),
    totalVolume: z.number().nullable(),
    workoutPlan: z.object({ id: z.uuid(), name: z.string() }).nullable(),
    _count: z.object({ sessionExercises: z.number().int() }),
  })
  .openapi('WorkoutSessionSummary');

// Optional body schema for /complete — inline to keep file self-contained
const completeSessionBodySchema = z
  .object({
    finishedAt: z.iso.datetime().optional().openapi({
      description: 'Backdate the finish time. Defaults to now().',
      example: '2026-05-06T19:00:00Z',
    }),
  })
  .openapi('CompleteSessionBody');

/* ------------------------------------------------------------------ */
/* GET /workout-sessions                                               */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/workout-sessions',
  tags: ['Workout Sessions'],
  summary: 'List workout sessions (history)',
  description: 'Paginated history with optional status and date-range filters.',
  security: [{ bearerAuth: [] }],
  request: {
    query: listSessionsQuerySchema,
  },
  responses: {
    200: {
      description: 'Paginated sessions',
      content: {
        'application/json': {
          schema: z.object({
            items: z.array(WorkoutSessionSummary),
            total: z.number().int(),
            limit: z.number().int(),
            offset: z.number().int(),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    422: { description: 'Invalid query param value' },
  },
});

/* ------------------------------------------------------------------ */
/* POST /workout-sessions/start                                        */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'post',
  path: '/workout-sessions/start',
  tags: ['Workout Sessions'],
  summary: 'Start a new workout session from a plan',
  description:
    'Snapshots the plan into session_exercises (name, target sets/reps/rest) and pre-creates exercise_sets in PENDING state. Fails with 409 if the user already has an in-progress session.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: startSessionSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Session started',
      content: {
        'application/json': {
          schema: z.object({ session: WorkoutSession }),
        },
      },
    },
    400: { description: 'Plan has no exercises' },
    401: { description: 'Unauthorized' },
    403: { description: 'Plan is private to another user' },
    404: { description: 'Plan not found' },
    409: {
      description: 'User already has an in-progress session',
      content: {
        'application/json': {
          schema: z.object({
            error: z.object({
              message: z.string(),
              details: z.object({ sessionId: z.string().uuid() }).nullable(),
            }),
          }),
        },
      },
    },
    422: { description: 'Validation failed' },
  },
});

/* ------------------------------------------------------------------ */
/* GET /workout-sessions/:id                                           */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/workout-sessions/{id}',
  tags: ['Workout Sessions'],
  summary: 'Get workout session by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: sessionIdParamSchema,
  },
  responses: {
    200: {
      description: 'Session detail',
      content: {
        'application/json': {
          schema: z.object({ session: WorkoutSession }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Session belongs to another user' },
    404: { description: 'Session not found' },
  },
});

/* ------------------------------------------------------------------ */
/* PATCH /workout-sessions/:id/exercises/:sessionExerciseId/sets/:setNumber */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'patch',
  path: '/workout-sessions/{id}/exercises/{sessionExerciseId}/sets/{setNumber}',
  tags: ['Workout Sessions'],
  summary: 'Log or update a set (idempotent upsert)',
  description:
    'Upserts by (sessionExerciseId, setNumber), so retrying the same payload is safe. Completed sets require weight >= 0 and reps > 0.',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid(),
      sessionExerciseId: z.string().uuid(),
      setNumber: z.coerce.number().int().min(1),
    }),
    body: {
      content: {
        'application/json': { schema: logSetSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Set upserted',
      content: {
        'application/json': {
          schema: z.object({ set: ExerciseSet }),
        },
      },
    },
    400: { description: 'Session is not in progress' },
    401: { description: 'Unauthorized' },
    403: { description: 'Session belongs to another user' },
    404: { description: 'Session or sessionExercise not found' },
    422: {
      description:
        'Validation failed (e.g. negative weight, reps <= 0 with COMPLETED status)',
    },
  },
});

/* ------------------------------------------------------------------ */
/* POST /workout-sessions/:id/complete                                 */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'post',
  path: '/workout-sessions/{id}/complete',
  tags: ['Workout Sessions'],
  summary: 'Complete a workout session',
  description:
    'Derives durationSeconds and totalVolume (weight × reps over COMPLETED sets only). Optional finishedAt lets you backdate the session.',
  security: [{ bearerAuth: [] }],
  request: {
    params: sessionIdParamSchema,
    body: {
      required: false,
      content: {
        'application/json': { schema: completeSessionBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Session completed',
      content: {
        'application/json': {
          schema: z.object({ session: WorkoutSession }),
        },
      },
    },
    400: { description: 'Session is not in progress' },
    401: { description: 'Unauthorized' },
    403: { description: 'Session belongs to another user' },
    404: { description: 'Session not found' },
    422: { description: 'Validation failed' },
  },
});

/* ------------------------------------------------------------------ */
/* POST /workout-sessions/:id/cancel                                   */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'post',
  path: '/workout-sessions/{id}/cancel',
  tags: ['Workout Sessions'],
  summary: 'Cancel an in-progress session',
  description:
    'Sets status to CANCELLED. Sets are preserved (audit trail) but excluded from progress calculations.',
  security: [{ bearerAuth: [] }],
  request: {
    params: sessionIdParamSchema,
  },
  responses: {
    200: {
      description: 'Session cancelled',
      content: {
        'application/json': {
          schema: z.object({ session: WorkoutSession }),
        },
      },
    },
    400: { description: 'Only in-progress sessions can be cancelled' },
    401: { description: 'Unauthorized' },
    403: { description: 'Session belongs to another user' },
    404: { description: 'Session not found' },
  },
});
