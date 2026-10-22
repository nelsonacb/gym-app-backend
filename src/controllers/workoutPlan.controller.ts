import type { Request, Response } from 'express';
import * as planService from '../services/workoutPlan.service.js';

export const list = async (req: Request, res: Response) => {
  const plans = await planService.listPlansForUser(req.user!.sub);
  res.json({ plans });
};

export const getById = async (req: Request, res: Response) => {
  const plan = await planService.getPlanById(
    req.user!.sub,
    req.params.id as string,
  );
  res.json({ plan });
};

export const create = async (req: Request, res: Response) => {
  const plan = await planService.createPlan(req.user!.sub, req.body);
  res.status(201).json({ plan });
};

export const update = async (req: Request, res: Response) => {
  const plan = await planService.updatePlan(
    req.user!.sub,
    req.params.id as string,
    req.body,
  );
  res.json({ plan });
};

export const remove = async (req: Request, res: Response) => {
  await planService.deletePlan(req.user!.sub, req.params.id as string);
  res.status(204).send();
};
