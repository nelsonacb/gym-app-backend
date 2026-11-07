import { z } from '../config/zod-openapi';

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(8).max(72),
    weightUnit: z.enum(['KG', 'LB']).optional(),
  })
  .openapi('RegisterInput');

export const loginSchema = z
  .object({
    email: z.email().trim().toLowerCase(),
    password: z.string().min(1),
  })
  .openapi('LoginInput');

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
