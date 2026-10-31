import rateLimit from 'express-rate-limit';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config';

export const limiter =
  env.NODE_ENV === 'development'
    ? (_req: Request, _res: Response, next: NextFunction): void => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: { message: 'Too many requests, please try again later' },
        },
      });
