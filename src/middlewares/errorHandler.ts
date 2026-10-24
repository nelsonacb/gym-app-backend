// import { Request, Response, NextFunction } from 'express';
// import logger from '../utils/logger';

// export const errorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   logger.error(err.stack || err.message);
//   const status = err.status || 500;
//   const message = err.message || 'Error interno del servidor';
//   res.status(status).json({ error: message });
// };

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../utils/appError';
import { env } from '../config';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.log(
    '🔥 errorHandler called:',
    err instanceof Error ? err.name : typeof err,
  );
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details ?? null,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        message: 'Validation failed',
        details: err.issues.map((issue) => ({
          path: issue.path.join('.') || '(root)',
          message: issue.message,
          code: issue.code,
        })),
      },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: {
          message: 'Unique constraint violation',
          details: { fields: err.meta?.target ?? null },
        },
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: { message: 'Resource not found' },
      });
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json({
        error: {
          message: 'Foreign key constraint violation',
          details: { field: err.meta?.field_name ?? null },
        },
      });
      return;
    }
    res.status(500).json({
      error: { message: 'Database error', details: { code: err.code } },
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      message: 'Internal server error',
      ...(env.NODE_ENV !== 'production' && err instanceof Error
        ? { stack: err.stack, name: err.name }
        : {}),
    },
  });
};
