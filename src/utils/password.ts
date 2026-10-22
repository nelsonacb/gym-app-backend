import bcrypt from 'bcrypt';
import { env } from '../config/index';

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
