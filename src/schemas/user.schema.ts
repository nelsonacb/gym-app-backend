import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  weightUnit: z.enum(['KG', 'LB']).optional(),
});

export const updatePreferencesSchema = z.object({
  weeklyGoal: z.number().int().min(1).max(14).nullable().optional(),
  weightUnit: z.enum(['KG', 'LB']).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
