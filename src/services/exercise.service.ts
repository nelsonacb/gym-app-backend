import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import type { ListExercisesQuery } from '../schemas/exercise.schema.js';

export const listExercises = async (query: ListExercisesQuery) => {
  return prisma.exercise.findMany({
    where: {
      ...(query.muscleGroup ? { muscleGroup: query.muscleGroup } : {}),
      ...(query.equipment ? { equipment: query.equipment } : {}),
      ...(query.search
        ? { name: { contains: query.search, mode: 'insensitive' } }
        : {}),
    },
    orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
  });
};

export const getExerciseById = async (id: string) => {
  const exercise = await prisma.exercise.findUnique({ where: { id } });
  if (!exercise) throw new AppError('Exercise not found', 404);
  return exercise;
};
