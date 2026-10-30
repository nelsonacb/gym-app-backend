import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().transform(Number).default(4000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
  CORS_ORIGIN: z.string().default('*'),
});

export const env = envSchema.parse(process.env);
