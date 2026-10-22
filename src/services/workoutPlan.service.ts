import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import type {
  CreateWorkoutPlanInput,
  UpdateWorkoutPlanInput,
} from '../schemas/workoutPlan.schema.js';

const planInclude = {
  planExercises: {
    orderBy: { position: 'asc' as const },
    include: { exercise: true },
  },
};

export const listPlansForUser = async (userId: string) => {
  // Global plans (createdByUserId = null) + user's own plans
  return prisma.workoutPlan.findMany({
    where: { OR: [{ createdByUserId: userId }, { createdByUserId: null }] },
    include: planInclude,
    orderBy: { createdAt: 'desc' },
  });
};

export const getPlanById = async (userId: string, planId: string) => {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    include: planInclude,
  });
  if (!plan) throw new AppError('Workout plan not found', 404);
  if (plan.createdByUserId !== null && plan.createdByUserId !== userId) {
    throw new AppError('Forbidden', 403);
  }
  return plan;
};

export const createPlan = async (
  userId: string,
  input: CreateWorkoutPlanInput,
) => {
  // Validate all exerciseIds exist
  const ids = input.exercises.map((e) => e.exerciseId);
  const existing = await prisma.exercise.findMany({
    where: { id: { in: ids } },
  });
  if (existing.length !== new Set(ids).size) {
    throw new AppError('One or more exercise IDs are invalid', 400);
  }

  return prisma.workoutPlan.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      createdByUserId: userId,
      planExercises: {
        create: input.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          position: e.position,
          targetSets: e.targetSets,
          targetReps: e.targetReps,
          restSeconds: e.restSeconds,
        })),
      },
    },
    include: planInclude,
  });
};

export const updatePlan = async (
  userId: string,
  planId: string,
  input: UpdateWorkoutPlanInput,
) => {
  const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Workout plan not found', 404);
  if (plan.createdByUserId !== userId) {
    throw new AppError('Only the owner can modify this plan', 403);
  }

  return prisma.$transaction(async (tx) => {
    if (input.exercises) {
      await tx.planExercise.deleteMany({ where: { workoutPlanId: planId } });
    }
    return tx.workoutPlan.update({
      where: { id: planId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.exercises
          ? {
              planExercises: {
                create: input.exercises.map((e) => ({
                  exerciseId: e.exerciseId,
                  position: e.position,
                  targetSets: e.targetSets,
                  targetReps: e.targetReps,
                  restSeconds: e.restSeconds,
                })),
              },
            }
          : {}),
      },
      include: planInclude,
    });
  });
};

export const deletePlan = async (userId: string, planId: string) => {
  const plan = await prisma.workoutPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new AppError('Workout plan not found', 404);
  if (plan.createdByUserId !== userId) {
    throw new AppError('Only the owner can delete this plan', 403);
  }
  await prisma.workoutPlan.delete({ where: { id: planId } });
};
