import { prisma } from '../../lib/prisma';
import { AppError } from '../utils/appError';
import type {
  ListSessionsQuery,
  LogSetInput,
  StartSessionInput,
} from '../schemas/workoutSession.schema.js';

const sessionInclude = {
  sessionExercises: {
    orderBy: { position: 'asc' as const },
    include: {
      sets: { orderBy: { setNumber: 'asc' as const } },
    },
  },
};

/* ------------------------------------------------------------------ */
/* START SESSION                                                       */
/* Takes a snapshot of the plan so later edits never rewrite history.  */
/* ------------------------------------------------------------------ */
export const startSession = async (
  userId: string,
  input: StartSessionInput,
) => {
  const plan = await prisma.workoutPlan.findUnique({
    where: { id: input.workoutPlanId },
    include: { planExercises: { orderBy: { position: 'asc' } } },
  });
  if (!plan) throw new AppError('Workout plan not found', 404);
  if (plan.createdByUserId && plan.createdByUserId !== userId) {
    throw new AppError('Forbidden', 403);
  }
  if (plan.planExercises.length === 0) {
    throw new AppError('Workout plan has no exercises', 400);
  }

  // Prevent double "in_progress" sessions for the same user
  const existing = await prisma.workoutSession.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
  });
  if (existing) {
    throw new AppError(
      'You already have an in-progress session. Finish or cancel it first.',
      409,
      {
        sessionId: existing.id,
      },
    );
  }

  const startedAt = input.startedAt ?? new Date();

  return prisma.workoutSession.create({
    data: {
      userId,
      workoutPlanId: plan.id,
      status: 'IN_PROGRESS',
      startedAt,
      sessionExercises: {
        create: await Promise.all(
          plan.planExercises.map(async (pe) => {
            const exercise = await prisma.exercise.findUniqueOrThrow({
              where: { id: pe.exerciseId },
            });
            return {
              exerciseId: pe.exerciseId,
              exerciseName: exercise.name, // snapshot
              position: pe.position,
              targetSets: pe.targetSets,
              targetReps: pe.targetReps,
              restSeconds: pe.restSeconds,
              sets: {
                create: Array.from({ length: pe.targetSets }, (_, idx) => ({
                  setNumber: idx + 1,
                  weight: null,
                  reps: null,
                  status: 'PENDING' as const,
                })),
              },
            };
          }),
        ),
      },
    },
    include: sessionInclude,
  });
};

/* ------------------------------------------------------------------ */
/* GET SESSION                                                         */
/* ------------------------------------------------------------------ */
export const getSession = async (userId: string, sessionId: string) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: sessionInclude,
  });
  if (!session) throw new AppError('Workout session not found', 404);
  if (session.userId !== userId) throw new AppError('Forbidden', 403);
  return session;
};

/* ------------------------------------------------------------------ */
/* LOG / UPDATE A SET                                                  */
/* ------------------------------------------------------------------ */
export const logSet = async (
  userId: string,
  sessionId: string,
  sessionExerciseId: string,
  setNumber: number,
  input: LogSetInput,
) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: { sessionExercises: { where: { id: sessionExerciseId } } },
  });
  if (!session) throw new AppError('Workout session not found', 404);
  if (session.userId !== userId) throw new AppError('Forbidden', 403);
  if (session.status !== 'IN_PROGRESS') {
    throw new AppError(
      'Cannot log sets on a session that is not in progress',
      400,
    );
  }

  const sessionExercise = session.sessionExercises[0];
  if (!sessionExercise) throw new AppError('Session exercise not found', 404);

  // Business rule: completed sets require weight >= 0 and reps > 0
  if (input.status === 'COMPLETED') {
    if (input.weight === null || input.weight === undefined) {
      throw new AppError(
        'Completed set requires a weight (use 0 for bodyweight)',
        422,
      );
    }
    if (input.weight < 0)
      throw new AppError('Weight must be non-negative', 422);
    if (input.reps === null || input.reps === undefined || input.reps <= 0) {
      throw new AppError('Completed set requires positive reps', 422);
    }
  }

  return prisma.exerciseSet.upsert({
    where: {
      sessionExerciseId_setNumber: { sessionExerciseId, setNumber },
    },
    create: {
      sessionExerciseId,
      setNumber,
      weight: input.weight,
      reps: input.reps,
      status: input.status,
      completedAt: input.status === 'COMPLETED' ? new Date() : null,
    },
    update: {
      weight: input.weight,
      reps: input.reps,
      status: input.status,
      completedAt: input.status === 'COMPLETED' ? new Date() : null,
    },
  });
};

/* ------------------------------------------------------------------ */
/* COMPLETE SESSION                                                    */
/* Derives duration and totalVolume from completed sets only.          */
/* ------------------------------------------------------------------ */
export const completeSession = async (userId: string, sessionId: string) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      sessionExercises: { include: { sets: true } },
    },
  });
  if (!session) throw new AppError('Workout session not found', 404);
  if (session.userId !== userId) throw new AppError('Forbidden', 403);
  if (session.status !== 'IN_PROGRESS') {
    throw new AppError('Session is not in progress', 400);
  }

  const finishedAt = new Date();
  const durationSeconds = Math.max(
    0,
    Math.floor((finishedAt.getTime() - session.startedAt.getTime()) / 1000),
  );

  const totalVolume = session.sessionExercises.reduce((acc, se) => {
    return (
      acc +
      se.sets.reduce((setAcc, s) => {
        if (s.status !== 'COMPLETED' || s.weight === null || s.reps === null)
          return setAcc;
        return setAcc + s.weight * s.reps;
      }, 0)
    );
  }, 0);

  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      finishedAt,
      durationSeconds,
      totalVolume,
    },
    include: sessionInclude,
  });
};

/* ------------------------------------------------------------------ */
/* CANCEL SESSION                                                      */
/* ------------------------------------------------------------------ */
export const cancelSession = async (userId: string, sessionId: string) => {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) throw new AppError('Workout session not found', 404);
  if (session.userId !== userId) throw new AppError('Forbidden', 403);
  if (session.status !== 'IN_PROGRESS') {
    throw new AppError('Only in-progress sessions can be cancelled', 400);
  }
  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: { status: 'CANCELLED', finishedAt: new Date() },
    include: sessionInclude,
  });
};

/* ------------------------------------------------------------------ */
/* HISTORY                                                             */
/* ------------------------------------------------------------------ */
export const listSessions = async (
  userId: string,
  query: ListSessionsQuery,
) => {
  const where = {
    userId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to
      ? {
          startedAt: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: query.offset,
      take: query.limit,
      include: {
        workoutPlan: { select: { id: true, name: true } },
        _count: { select: { sessionExercises: true } },
      },
    }),
    prisma.workoutSession.count({ where }),
  ]);

  return { items, total, limit: query.limit, offset: query.offset };
};
