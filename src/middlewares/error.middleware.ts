import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../utils/appError';
import { env } from '../config/index.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, details: err.details ?? null },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: { message: 'Unique constraint violation', details: err.meta },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { message: 'Resource not found', details: err.meta },
      });
      return;
    }
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      ...(env.NODE_ENV !== 'production' && err instanceof Error
        ? { stack: err.stack }
        : {}),
    },
  });
};
