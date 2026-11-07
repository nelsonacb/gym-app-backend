import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import {
  createWorkoutPlanSchema,
  updateWorkoutPlanSchema,
  workoutPlanIdParamSchema,
} from '../../schemas/workoutPlan.schema';

/* ------------------------------------------------------------------ */
/* Response schemas                                                    */
/* ------------------------------------------------------------------ */
const PlanExercise = z
  .object({
    id: z.uuid(),
    workoutPlanId: z.uuid(),
    exerciseId: z.uuid(),
    position: z.number().int(),
    targetSets: z.number().int(),
    targetReps: z.number().int(),
    restSeconds: z.number().int(),
    exercise: z
      .object({
        id: z.uuid(),
        name: z.string(),
        muscleGroup: z.string(),
        equipment: z.string(),
        instructions: z.string().nullable().optional(),
      })
      .openapi('PlanExerciseDetail'),
  })
  .openapi('PlanExercise');

const WorkoutPlan = z
  .object({
    id: z.uuid(),
    name: z.string().openapi({ example: 'Chest Day' }),
    description: z.string().nullable().optional(),
    createdByUserId: z.uuid().nullable().openapi({
      description: 'null means global plan (read-only for everyone)',
    }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    planExercises: z.array(PlanExercise),
  })
  .openapi('WorkoutPlan');

/* ------------------------------------------------------------------ */
/* GET /workout-plans                                                  */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/workout-plans',
  tags: ['Workout Plans'],
  summary: 'List workout plans available to the user',
  description:
    'Returns global plans (createdByUserId = null) plus plans owned by the authenticated user.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'List of plans',
      content: {
        'application/json': {
          schema: z.object({ plans: z.array(WorkoutPlan) }),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});

/* ------------------------------------------------------------------ */
/* POST /workout-plans                                                 */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'post',
  path: '/workout-plans',
  tags: ['Workout Plans'],
  summary: 'Create a custom workout plan',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: createWorkoutPlanSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'Plan created',
      content: {
        'application/json': {
          schema: z.object({ plan: WorkoutPlan }),
        },
      },
    },
    400: { description: 'One or more exerciseId does not exist' },
    401: { description: 'Unauthorized' },
    409: { description: 'Duplicate position within the plan' },
    422: { description: 'Validation failed' },
  },
});

/* ------------------------------------------------------------------ */
/* GET /workout-plans/:id                                              */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/workout-plans/{id}',
  tags: ['Workout Plans'],
  summary: 'Get workout plan by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: workoutPlanIdParamSchema,
  },
  responses: {
    200: {
      description: 'Plan detail',
      content: {
        'application/json': {
          schema: z.object({ plan: WorkoutPlan }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Plan is private to another user' },
    404: { description: 'Plan not found' },
    422: { description: 'Invalid UUID' },
  },
});

/* ------------------------------------------------------------------ */
/* PATCH /workout-plans/:id                                            */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'patch',
  path: '/workout-plans/{id}',
  tags: ['Workout Plans'],
  summary: 'Update a workout plan (owner only)',
  description:
    'Only the owner can edit. Sending `exercises` replaces the full exercise list (not a partial merge).',
  security: [{ bearerAuth: [] }],
  request: {
    params: workoutPlanIdParamSchema,
    body: {
      content: {
        'application/json': { schema: updateWorkoutPlanSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Plan updated',
      content: {
        'application/json': {
          schema: z.object({ plan: WorkoutPlan }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Global plan or owned by another user' },
    404: { description: 'Plan not found' },
    422: { description: 'Validation failed' },
  },
});

/* ------------------------------------------------------------------ */
/* DELETE /workout-plans/:id                                           */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'delete',
  path: '/workout-plans/{id}',
  tags: ['Workout Plans'],
  summary: 'Delete a workout plan (owner only)',
  description:
    'Historical sessions based on this plan are preserved (they keep workoutPlanId = null).',
  security: [{ bearerAuth: [] }],
  request: {
    params: workoutPlanIdParamSchema,
  },
  responses: {
    204: { description: 'Plan deleted (no content)' },
    401: { description: 'Unauthorized' },
    403: { description: 'Global plan or owned by another user' },
    404: { description: 'Plan not found' },
  },
});
