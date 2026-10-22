import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

interface Schemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
}

export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params)
        req.params = schemas.params.parse(req.params) as typeof req.params;
      if (schemas.query) {
        // Express 4: req.query is read-only, but we can mutate properties on it
        const parsed = schemas.query.parse(req.query);
        Object.assign(req.query, parsed);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
