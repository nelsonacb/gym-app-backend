import { z } from '../config/zod-openapi';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    weightUnit: z.enum(['KG', 'LB']).optional(),
  })
  .openapi('UpdateProfileInput');

export const updatePreferencesSchema = z
  .object({
    weeklyGoal: z.number().int().min(1).max(14).nullable().optional(),
    weightUnit: z.enum(['KG', 'LB']).optional(),
  })
  .openapi('UpdatePreferencesInput');

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
