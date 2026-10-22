import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack || err.message);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
};
