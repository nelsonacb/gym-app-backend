import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import {
  exerciseIdParamSchema,
  listExercisesQuerySchema,
} from '../../schemas/exercise.schema';

/* ------------------------------------------------------------------ */
/* Response schemas                                                    */
/* ------------------------------------------------------------------ */
const Exercise = z
  .object({
    id: z.uuid(),
    name: z.string().openapi({ example: 'Bench Press' }),
    muscleGroup: z.enum([
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
    ]),
    equipment: z.enum([
      'BARBELL',
      'DUMBBELL',
      'MACHINE',
      'CABLE',
      'BODYWEIGHT',
      'KETTLEBELL',
      'OTHER',
    ]),
    instructions: z.string().nullable().optional(),
    createdAt: z.iso.datetime(),
  })
  .openapi('Exercise');

/* ------------------------------------------------------------------ */
/* GET /exercises                                                      */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/exercises',
  tags: ['Exercises'],
  summary: 'List exercises (shared catalog)',
  description:
    'Returns all exercises. Optional filters narrow by muscle group, equipment, or name search (case-insensitive).',
  security: [{ bearerAuth: [] }],
  request: {
    query: listExercisesQuerySchema,
  },
  responses: {
    200: {
      description: 'Exercise list',
      content: {
        'application/json': {
          schema: z.object({ exercises: z.array(Exercise) }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    422: { description: 'Invalid query param value' },
  },
});

/* ------------------------------------------------------------------ */
/* GET /exercises/:id                                                  */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/exercises/{id}',
  tags: ['Exercises'],
  summary: 'Get exercise by ID',
  security: [{ bearerAuth: [] }],
  request: {
    params: exerciseIdParamSchema,
  },
  responses: {
    200: {
      description: 'Exercise detail',
      content: {
        'application/json': {
          schema: z.object({ exercise: Exercise }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'Exercise not found' },
    422: { description: 'Invalid UUID' },
  },
});
