import express, { Router } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { limiter } from './middlewares/rateLimiter';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import exerciseRoutes from './routes/exercise.routes';
import workoutPlanRoutes from './routes/workoutPlan.routes';
import workoutSessionRoutes from './routes/workoutSession.routes';
import progressRoutes from './routes/progress.routes';
import { env } from './config';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

app.use(limiter);

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }),
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workout-plans', workoutPlanRoutes);
router.use('/workout-sessions', workoutSessionRoutes);
router.use('/progress', progressRoutes);

app.use('/api', router);

app.use((_req, res, next) => {
  res.status(404).json({ error: { message: 'Route not found' } });
});

app.use(errorHandler);

export default app;
