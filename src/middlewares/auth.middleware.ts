import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('Missing or invalid Authorization header', 401);
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
