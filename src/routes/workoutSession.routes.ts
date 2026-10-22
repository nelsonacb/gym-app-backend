import { Router } from 'express';
import * as sessionController from '../controllers/workoutSession.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  listSessionsQuerySchema,
  logSetSchema,
  sessionExerciseIdParamSchema,
  sessionIdParamSchema,
  setNumberParamSchema,
  startSessionSchema,
} from '../schemas/workoutSession.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  validate({ query: listSessionsQuerySchema }),
  asyncHandler(sessionController.list),
);
router.post(
  '/start',
  validate({ body: startSessionSchema }),
  asyncHandler(sessionController.start),
);
router.get(
  '/:id',
  validate({ params: sessionIdParamSchema }),
  asyncHandler(sessionController.getById),
);
router.patch(
  '/:id/exercises/:sessionExerciseId/sets/:setNumber',
  validate({
    params: z.object({
      id: z.uuid(),
      sessionExerciseId: z.uuid(),
      setNumber: z.coerce.number().int().min(1),
    }),
    body: logSetSchema,
  }),
  asyncHandler(sessionController.logSet),
);
router.post(
  '/:id/complete',
  validate({ params: sessionIdParamSchema }),
  asyncHandler(sessionController.complete),
);
router.post(
  '/:id/cancel',
  validate({ params: sessionIdParamSchema }),
  asyncHandler(sessionController.cancel),
);

export default router;
