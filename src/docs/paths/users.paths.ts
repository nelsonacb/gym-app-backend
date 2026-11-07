import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import {
  updateProfileSchema,
  updatePreferencesSchema,
} from '../../schemas/user.schema';

/* ------------------------------------------------------------------ */
/* Response schemas                                                    */
/* ------------------------------------------------------------------ */
const UserResponse = z
  .object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    weightUnit: z.enum(['KG', 'LB']),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('UserResponse');

const UserPreferences = z
  .object({
    id: z.uuid().optional(),
    userId: z.uuid(),
    weeklyGoal: z.number().int().nullable().openapi({ example: 4 }),
    weightUnit: z.enum(['KG', 'LB']),
    createdAt: z.iso.datetime().optional(),
    updatedAt: z.iso.datetime().optional(),
  })
  .openapi('UserPreferences');

/* ------------------------------------------------------------------ */
/* PATCH /users/me                                                     */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'patch',
  path: '/users/me',
  tags: ['Users'],
  summary: 'Update current user profile',
  description: 'Updates name and/or weight unit for the authenticated user.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: updateProfileSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile updated',
      content: {
        'application/json': {
          schema: z.object({ user: UserResponse }),
        },
      },
    },
    401: { description: 'Unauthorized — missing or invalid token' },
    404: { description: 'User not found' },
    422: { description: 'Validation failed' },
  },
});

/* ------------------------------------------------------------------ */
/* GET /users/me/preferences                                           */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'get',
  path: '/users/me/preferences',
  tags: ['Users'],
  summary: 'Get current user preferences',
  description:
    'Returns the preferences row if it exists, or derived defaults from user.weightUnit when not set.',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Preferences (defaults if never saved)',
      content: {
        'application/json': {
          schema: z.object({ preferences: UserPreferences }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'User not found' },
  },
});

/* ------------------------------------------------------------------ */
/* PUT /users/me/preferences                                           */
/* ------------------------------------------------------------------ */
registry.registerPath({
  method: 'put',
  path: '/users/me/preferences',
  tags: ['Users'],
  summary: 'Create or update current user preferences',
  description:
    'Upsert — creates the row if it does not exist, updates otherwise.',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': { schema: updatePreferencesSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Preferences saved',
      content: {
        'application/json': {
          schema: z.object({ preferences: UserPreferences }),
        },
      },
    },
    401: { description: 'Unauthorized' },
    404: { description: 'User not found' },
    422: { description: 'Validation failed' },
  },
});
