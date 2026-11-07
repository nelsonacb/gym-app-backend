import { registry } from '../registry';
import { z } from '../../config/zod-openapi';
import { registerSchema, loginSchema } from '../../schemas/auth.schema';

// ---- POST /auth/register ----
registry.registerPath({
  method: 'post',
  path: '/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: z.object({
            token: z.string().openapi({ example: 'eyJhbGciOi...' }),
            user: z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.email(),
              weightUnit: z.enum(['KG', 'LB']),
            }),
          }),
        },
      },
    },
    409: { description: 'Email already registered' },
    422: { description: 'Validation failed' },
  },
});

// ---- POST /auth/login ----
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: {
    body: {
      content: {
        'application/json': { schema: loginSchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Login successful',
      content: {
        'application/json': {
          schema: z.object({
            token: z.string(),
            user: z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.email(),
              weightUnit: z.enum(['KG', 'LB']),
            }),
          }),
        },
      },
    },
    401: { description: 'Invalid credentials' },
  },
});

// ---- GET /auth/me ----
registry.registerPath({
  method: 'get',
  path: '/auth/me',
  tags: ['Auth'],
  summary: 'Get current authenticated user',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user',
      content: {
        'application/json': {
          schema: z.object({
            user: z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.email(),
              weightUnit: z.enum(['KG', 'LB']),
              createdAt: z.iso.datetime(),
            }),
          }),
        },
      },
    },
    401: { description: 'Unauthorized' },
  },
});
