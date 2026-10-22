import type { Request, Response } from 'express';
import * as sessionService from '../services/workoutSession.service.js';

export const start = async (req: Request, res: Response) => {
  const session = await sessionService.startSession(req.user!.sub, req.body);
  res.status(201).json({ session });
};

export const getById = async (req: Request, res: Response) => {
  const session = await sessionService.getSession(
    req.user!.sub,
    req.params.id as string,
  );
  res.json({ session });
};

export const logSet = async (req: Request, res: Response) => {
  const set = await sessionService.logSet(
    req.user!.sub,
    req.params.id as string,
    req.params.sessionExerciseId as string,
    Number(req.params.setNumber),
    req.body,
  );
  res.json({ set });
};

export const complete = async (req: Request, res: Response) => {
  const session = await sessionService.completeSession(
    req.user!.sub,
    req.params.id as string,
  );
  res.json({ session });
};

export const cancel = async (req: Request, res: Response) => {
  const session = await sessionService.cancelSession(
    req.user!.sub,
    req.params.id as string,
  );
  res.json({ session });
};

export const list = async (req: Request, res: Response) => {
  const result = await sessionService.listSessions(
    req.user!.sub,
    req.query as never,
  );
  res.json(result);
};
