import { Router } from 'express';
import * as exerciseController from '../controllers/exercise.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  exerciseIdParamSchema,
  listExercisesQuerySchema,
} from '../schemas/exercise.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get(
  '/',
  validate({ query: listExercisesQuerySchema }),
  asyncHandler(exerciseController.list),
);
router.get(
  '/:id',
  validate({ params: exerciseIdParamSchema }),
  asyncHandler(exerciseController.getById),
);

export default router;
