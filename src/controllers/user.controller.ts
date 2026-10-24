import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';
import {
  UpdatePreferencesInput,
  UpdateProfileInput,
} from '../schemas/user.schema.js';

export const updateProfile = async (req: Request, res: Response) => {
  const user = await userService.updateProfile(
    req.user!.sub,
    req.body as UpdateProfileInput,
  );
  res.json({ user });
};

export const getPreferences = async (req: Request, res: Response) => {
  const preferences = await userService.getPreferences(req.user!.sub);
  res.json({ preferences });
};

export const updatePreferences = async (req: Request, res: Response) => {
  const preferences = await userService.updatePreferences(
    req.user!.sub,
    req.body as UpdatePreferencesInput,
  );
  res.json({ preferences });
};
