import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

export const register = async (req: Request, res: Response) => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body as LoginInput);
  res.status(200).json(result);
};

export const me = async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.sub);
  res.json({ user });
};
