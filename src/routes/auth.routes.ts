import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/register',
  validate({ body: registerSchema }),
  asyncHandler(authController.register),
);
router.post(
  '/login',
  validate({ body: loginSchema }),
  asyncHandler(authController.login),
);
router.get('/me', authenticate, asyncHandler(authController.me));

export default router;
