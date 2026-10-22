import type { Request, Response } from 'express';
import * as exerciseService from '../services/exercise.service.js';

export const list = async (req: Request, res: Response) => {
  const exercises = await exerciseService.listExercises(req.query);
  res.json({ exercises });
};

export const getById = async (req: Request, res: Response) => {
  const exercise = await exerciseService.getExerciseById(
    req.params.id as string,
  );
  res.json({ exercise });
};
