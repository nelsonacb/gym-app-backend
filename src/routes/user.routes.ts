import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  updatePreferencesSchema,
  updateProfileSchema,
} from '../schemas/user.schema';

const router = Router();

router.use(authenticate);

router.patch(
  '/me',
  validate({ body: updateProfileSchema }),
  userController.updateProfile,
);

router.get('/me/preferences', userController.getPreferences);

router.put(
  '/me/preferences',
  validate({ body: updatePreferencesSchema }),
  userController.updatePreferences,
);

export default router;
