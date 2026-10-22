import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import type {
  UpdatePreferencesInput,
  UpdateProfileInput,
} from '../schemas/user.schema.js';

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      weightUnit: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

export const getPreferences = async (userId: string) => {
  const prefs = await prisma.userPreference.findUnique({ where: { userId } });
  return prefs ?? { userId, weeklyGoal: null, weightUnit: 'KG' };
};

export const updatePreferences = async (
  userId: string,
  input: UpdatePreferencesInput,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      weeklyGoal: input.weeklyGoal ?? null,
      weightUnit: input.weightUnit ?? user.weightUnit,
    },
    update: {
      ...(input.weeklyGoal !== undefined
        ? { weeklyGoal: input.weeklyGoal }
        : {}),
      ...(input.weightUnit !== undefined
        ? { weightUnit: input.weightUnit }
        : {}),
    },
  });
};
