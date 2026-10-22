import type { Request, Response } from 'express';
import * as progressService from '../services/progress.service.js';

export const overall = async (req: Request, res: Response) => {
  const progress = await progressService.getOverallProgress(req.user!.sub);
  res.json({ progress });
};

export const exercise = async (req: Request, res: Response) => {
  const progress = await progressService.getExerciseProgress(
    req.user!.sub,
    req.params.exerciseId as string,
    req.query as never,
  );
  res.json({ progress });
};
