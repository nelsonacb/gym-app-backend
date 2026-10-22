import { Router } from 'express';
import * as planController from '../controllers/workoutPlan.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createWorkoutPlanSchema,
  updateWorkoutPlanSchema,
  workoutPlanIdParamSchema,
} from '../schemas/workoutPlan.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', asyncHandler(planController.list));
router.post(
  '/',
  validate({ body: createWorkoutPlanSchema }),
  asyncHandler(planController.create),
);
router.get(
  '/:id',
  validate({ params: workoutPlanIdParamSchema }),
  asyncHandler(planController.getById),
);
router.patch(
  '/:id',
  validate({ params: workoutPlanIdParamSchema, body: updateWorkoutPlanSchema }),
  asyncHandler(planController.update),
);
router.delete(
  '/:id',
  validate({ params: workoutPlanIdParamSchema }),
  asyncHandler(planController.remove),
);

export default router;
