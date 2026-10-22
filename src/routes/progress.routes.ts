import { Router } from 'express';
import * as progressController from '../controllers/progress.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { exerciseProgressQuerySchema } from '../schemas/progress.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { z } from 'zod';

const router = Router();

router.use(authenticate);
router.get('/overall', asyncHandler(progressController.overall));
router.get(
  '/exercises/:exerciseId',
  validate({
    params: z.object({ exerciseId: z.uuid() }),
    query: exerciseProgressQuerySchema,
  }),
  asyncHandler(progressController.exercise),
);

export default router;
