import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import type {
  UpdatePreferencesInput,
  UpdateProfileInput,
} from '../schemas/user.schema';

export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.weightUnit !== undefined
        ? { weightUnit: input.weightUnit }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      weightUnit: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getPreferences = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const prefs = await prisma.userPreference.findUnique({ where: { userId } });

  if (!prefs) {
    return {
      userId,
      weeklyGoal: null,
      weightUnit: user.weightUnit,
    };
  }
  return prefs;
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
