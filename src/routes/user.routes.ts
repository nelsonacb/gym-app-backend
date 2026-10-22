import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updatePreferencesSchema,
  updateProfileSchema,
} from '../schemas/user.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  asyncHandler(userController.updateProfile),
);
router.get('/me/preferences', asyncHandler(userController.getPreferences));
router.put(
  '/me/preferences',
  validate({ body: updatePreferencesSchema }),
  asyncHandler(userController.updatePreferences),
);

export default router;
