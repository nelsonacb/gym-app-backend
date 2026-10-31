import { prisma } from '../../lib/prisma';
import type { ExerciseProgressQuery } from '../schemas/progress.schema.js';

/* ------------------------------------------------------------------ */
/* OVERALL PROGRESS                                                    */
/* Returns completed-session counts, total volume, weekly breakdown.   */
/* ------------------------------------------------------------------ */
export const getOverallProgress = async (userId: string) => {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { startedAt: 'asc' },
    select: {
      id: true,
      startedAt: true,
      durationSeconds: true,
      totalVolume: true,
    },
  });

  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce(
    (acc, s) => acc + (s.totalVolume ?? 0),
    0,
  );
  const totalDuration = sessions.reduce(
    (acc, s) => acc + (s.durationSeconds ?? 0),
    0,
  );

  // Agrupar por semana ISO (lunes como primer día)
  const weeklyCount: Record<string, number> = {};
  const weeklyVolume: Record<string, number> = {};

  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const day = d.getUTCDay() || 7; // domingo = 7
    d.setUTCDate(d.getUTCDate() - (day - 1)); // lunes de esa semana
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

    weeklyCount[key] = (weeklyCount[key] ?? 0) + 1;
    weeklyVolume[key] = (weeklyVolume[key] ?? 0) + (s.totalVolume ?? 0);
  }

  const sortedWeeks = Array.from(
    new Set([...Object.keys(weeklyCount), ...Object.keys(weeklyVolume)]),
  ).sort((a, b) => a.localeCompare(b));

  return {
    totalSessions,
    totalVolume,
    totalDurationSeconds: totalDuration,
    weeklyFrequency: sortedWeeks.map((weekStart) => ({
      weekStart,
      count: weeklyCount[weekStart] ?? 0,
    })),
    weeklyVolume: sortedWeeks.map((weekStart) => ({
      weekStart,
      volume: weeklyVolume[weekStart] ?? 0,
    })),
  };
};

/* ------------------------------------------------------------------ */
/* EXERCISE PROGRESS                                                   */
/* Track performance over time: max weight, best set volume, PRs.      */
/* ------------------------------------------------------------------ */
export const getExerciseProgress = async (
  userId: string,
  exerciseId: string,
  query: ExerciseProgressQuery,
) => {
  const rows = await prisma.exerciseSet.findMany({
    where: {
      status: 'COMPLETED',
      sessionExercise: {
        exerciseId,
        workoutSession: {
          userId,
          status: 'COMPLETED',
          ...(query.from || query.to
            ? {
                startedAt: {
                  ...(query.from ? { gte: query.from } : {}),
                  ...(query.to ? { lte: query.to } : {}),
                },
              }
            : {}),
        },
      },
    },
    include: {
      sessionExercise: {
        include: {
          workoutSession: { select: { id: true, startedAt: true } },
        },
      },
    },
    orderBy: { completedAt: 'asc' },
  });

  const points = rows.map((r) => ({
    sessionId: r.sessionExercise.workoutSession.id,
    startedAt: r.sessionExercise.workoutSession.startedAt,
    weight: r.weight,
    reps: r.reps,
    volume: (r.weight ?? 0) * (r.reps ?? 0),
  }));

  // Personal Records — derived from data, no dedicated table
  let maxWeight: number | null = null;
  let maxVolume: number | null = null;
  for (const p of points) {
    if (p.weight !== null)
      maxWeight = maxWeight === null ? p.weight : Math.max(maxWeight, p.weight);
    if (p.volume > 0)
      maxVolume = maxVolume === null ? p.volume : Math.max(maxVolume, p.volume);
  }

  return {
    exerciseId,
    totalSets: points.length,
    personalRecords: { maxWeight, maxSingleSetVolume: maxVolume },
    history: points,
  };
};
